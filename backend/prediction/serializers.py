from functools import lru_cache
from typing import Callable, Dict, List, Union

from django.core.exceptions import ValidationError
from django.utils.timesince import timesince
from django.utils.translation import gettext_lazy as _

from rest_framework import serializers
from Learning.feature_selection import pearson_feature_selection, rfe_feature_selection

from Learning.utils import produce_dataframe, read_file_data, ALLOWED_EXTENSIONS
from .models import TrainingModel, validate_dataset
from .utils import arrayfy_strings


def raise_validation_error_for_dataframe(action: Callable, error_msg: str, exception_type: Union[Exception, None] = None, *args):
    if exception_type:
        try:
            result = action(*args)
        except exception_type:
            raise ValidationError(error_msg)

    try:
        result = action(*args)
    except:
        raise ValidationError(error_msg)
    
    return result

def clean_array(array: List) -> List:
    """
    :param array: an array of values of different types
    :return: an array containing truthy values in `array`
    """

    return list(filter(bool, array))

class DataFrameField(serializers.FileField):
    def to_representation(self, value):
        file_data = read_file_data(value.path)
        dataframe = produce_dataframe(file_data)
        return dataframe.head().to_dict()


class TimesinceField(serializers.ReadOnlyField):
    def to_representation(self, value):
        return timesince(value)


class ListTrainingModelSerializer(serializers.ModelSerializer):
    last_updated = TimesinceField()
    created = TimesinceField()
    url = serializers.URLField(source='get_absolute_url')

    class Meta:
        model = TrainingModel
        exclude = ('id', 'dataset')


class TrainingModelSerializer(serializers.ModelSerializer):
    dataset = DataFrameField()
    last_updated = TimesinceField()
    created = TimesinceField()

    class Meta:
        model = TrainingModel
        exclude = ('id',)

    @lru_cache
    def get_dataframe_from_dataset(self, dataset_path, columns: List[str] = None):
        file_data = read_file_data(dataset_path.path)
        dataframe = produce_dataframe(file_data, columns)
        return dataframe

    def validate_dataset(self, value):
        extension = value.name.split('.')[-1]
        if extension not in ALLOWED_EXTENSIONS:
            raise serializers.ValidationError(f"Expected file with extension: `{', '.join(ALLOWED_EXTENSIONS.keys())}`, found file type of {extension}")
        return value

class SetColumnsSerializer(TrainingModelSerializer):
    feature_columns = serializers.CharField(required=True)
    target_column = serializers.CharField(required=True)

    class Meta:
        model = TrainingModel
        fields = ('feature_columns', 'target_column')

    def validate_feature_columns(self, value):
        try:
            value_array = arrayfy_strings(value)
        except:
            raise serializers.ValidationError('Columns are not valid as an array. Ensure input is a string of comma-separated values')

        dataframe = self.get_dataframe_from_dataset(self.instance.dataset)
        columns = clean_array(value_array)

        for column in columns:
            if column and column not in dataframe.columns:
                raise ValidationError(_(f"{column} is not a column in dataset"))

        return value
    
    def validate_target_column(self, value):
        dataframe = self.get_dataframe_from_dataset(self.instance.dataset)
        if value and value not in dataframe.columns:
            raise ValidationError(_(f"Target column '{value}' is not in dataset"))

        return value


class FeatureSelectionSerializer(SetColumnsSerializer):
    algorithm = serializers.ChoiceField(choices=[
        ('pearson', 'Pearson Correlation',),
        ('rfe', 'Recursive Feature Elimination',)
    ])
    target_column = serializers.CharField(required=True)

    class Meta:
        model = TrainingModel
        fields = ('algorithm', 'target_column',)

    @lru_cache
    def get_dataframe_from_dataset(self, dataset_path, columns: List[str] = None):
        file_data = read_file_data(dataset_path.path)
        dataframe = produce_dataframe(file_data, columns)
        return dataframe
    
    # def validate_algorithm(self, value):
    #     if value not in ('rfe', 'pearson'):
    #         raise ValidationError(_("Field 'algorithm' must be either one of 'rfe' or 'pearson'"))
        
    #     return value

    def validate_target_column(self, value):
        dataframe = self.get_dataframe_from_dataset(self.instance.dataset)
        if value and value not in dataframe.columns:
            raise ValidationError(_(f"Target column '{value}' is not in dataset"))

        return value
    
    def update(self, instance: TrainingModel, validated_data: Dict[str, str]) -> TrainingModel:
        FEATURE_SELECTION_ALGORITHMS: Dict[str, Callable] = {
            'pearson': pearson_feature_selection,
            'rfe': rfe_feature_selection
        }

        if (validated_data.get('algorithm'),
            validated_data.get('target_column'))  == (instance.algorithm,
            instance.target_column):
            return instance
        
        features = FEATURE_SELECTION_ALGORITHMS[validated_data.get('algorithm')](
            instance.dataset.path,
            validated_data.get('target_column')
        )

        instance.algorithm = self.validated_data.get("algorithm")
        instance.feature_columns = str(features)
        instance.target_column = self.validated_data.get('target_column')
        instance.save(validated=True)

        return instance