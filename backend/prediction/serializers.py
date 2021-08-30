from functools import lru_cache
from typing import Callable, List, Union

from django.core.exceptions import ValidationError
from django.utils.timesince import timesince

from rest_framework import serializers

from DecisionTreeClassifier import produce_dataframe, read_file_data, ALLOWED_EXTENSIONS, normalize_dataframe
from .models import TrainingModel
from .utils import arrayfy_strings, stringify_array


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


class DataFrameField(serializers.FileField):
    def to_representation(self, value):
        file_data = read_file_data(value)
        dataframe = produce_dataframe(file_data)
        return dataframe.head().to_dict()


class TimesinceField(serializers.ReadOnlyField):
    def to_representation(self, value):
        return timesince(value)



class TrainingModelSerializer(serializers.ModelSerializer):
    dataset = DataFrameField()
    last_updated = TimesinceField()
    created = TimesinceField()

    class Meta:
        model = TrainingModel
        exclude = ('id', )
    
    @lru_cache
    def get_dataframe_from_dataset(self, dataset_path, columns: List[str] = None):
        extension = dataset_path.name.split('.')[-1]
        file_data = read_file_data(dataset_path, extension)
        dataframe = produce_dataframe(file_data, columns)
        return dataframe

    def validate_dataset(self, value):
        extension = value.name.split('.')[-1]
        if extension not in ALLOWED_EXTENSIONS:
            raise serializers.ValidationError(f'Expected file with extension: {ALLOWED_EXTENSIONS}, found file type of {extension}')
        
        return value
    
    def validate_feature_columns(self, value):
        try:
            value_array = arrayfy_strings(value)
        except:
            raise serializers.ValidationError('Columns are not valid as an array. Ensure input is a string of comma-separated values')
        
        return stringify_array(value_array)
    

    def validate(self, attrs):
        dataframe = self.get_dataframe_from_dataset(attrs['dataset'])
        columns = [
            attrs.get('target_column'),
            *attrs.get('feature_columns')
        ]
        for column in columns:
            dataframe[column] = raise_validation_error_for_dataframe(
                produce_dataframe,
                f"Column '{column}' does not exist in dataset",
                ValueError,
                dataframe
            )
        attrs['dataset'] = normalize_dataframe(
            attrs.get('feature_column'),
            attrs.get('target_column'),
            dataframe
        )
        
        return super().validate(attrs)