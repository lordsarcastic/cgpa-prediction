import pickle
from functools import lru_cache
from typing import Callable, Dict, List

from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.utils.timesince import timesince
from django.utils.translation import gettext_lazy as _

from rest_framework import serializers
from sklearn import metrics
from Learning.feature_selection import pearson_feature_selection, rfe_feature_selection
from Learning.utils import GRADE_VALUE, TRANSPOSED_GP_VALUE, produce_dataframe, read_file_data, ALLOWED_EXTENSIONS
from Learning.classifier import decision_tree_classifier, random_forest_classifier
from .models import TrainingModel
from .utils import arrayfy_strings, clean_array, remove_chars_from_string


class DataFrameField(serializers.FileField):
    def to_representation(self, value):
        try:
            file_data = read_file_data(value.path)
        except:
            raise ValidationError(_("Cannot read dataset. Is it a CSV or Excel file?"))
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
        fields = '__all__'
        read_only_fields = (
            'uuid',
            'feature_selection_algorithm',
            'training_algorithm',
            'target_column',
            'feature_columns',
            'trained_model',
            'created',
            'last_updated'
        )

    @lru_cache
    def get_dataframe_from_dataset(self, dataset_path, columns: List[str] = None):
        try:
            file_data = read_file_data(dataset_path.path)
        except:
            raise ValidationError(_("Cannot read dataset. Is it a CSV or Excel file?"))
        dataframe = produce_dataframe(file_data, columns)
        return dataframe

    def validate_dataset(self, value):
        """
        We're not validating the file mime type because Django
        does not give us a file type with which we can work with
        by referencing a path. Perhaps later, we'll find a way to
        push raw bytes to check things out
        """
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

        
        if self.initial_data.get('target_columns') in columns:
            raise ValidationError(_("Target column cannot be a part of feature columns"))
    
        return value
    
    def validate_target_column(self, value):
        dataframe = self.get_dataframe_from_dataset(self.instance.dataset)
        if value and value not in dataframe.columns:
            raise ValidationError(_(f"Target column '{value}' is not in dataset"))

        return value


class FeatureSelectionSerializer(SetColumnsSerializer):
    feature_selection_algorithm = serializers.ChoiceField(choices=TrainingModel.FeatureSelectionAlgorithm.choices)
    target_column = serializers.CharField(required=True)

    class Meta:
        model = TrainingModel
        fields = ('feature_selection_algorithm', 'target_column',)

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

        features = FEATURE_SELECTION_ALGORITHMS[validated_data.get('feature_selection_algorithm')](
            instance.dataset.path,
            validated_data.get('target_column')
        )
        
        if (col := validated_data.get('target_column')) in features: 
            features.remove(col)

        features.sort()
        instance.feature_selection_algorithm = self.validated_data.get("feature_selection_algorithm")
        instance.feature_columns = ', '.join(features)
        instance.target_column = self.validated_data.get('target_column')
        instance.save()

        return instance


class TrainModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingModel
        read_only_fields = ('uuid', 'title', )
        fields = ('uuid', 'title', 'training_algorithm',)
    
    def validate_training_algorithm(self, value):
        if value == '':
            raise ValidationError(_("Training algorithm must be selected"))

        return value

    def update(self, instance: TrainingModel, validated_data: Dict[str, str]):
        TRAINING_ALGORITHMS: Dict[str, callable] = {
            'decision_tree': decision_tree_classifier,
            'random_forest': random_forest_classifier
        }

        transformed_feature_columns = remove_chars_from_string(
            instance.feature_columns,
            ',',
            ' '
        ).split()

        transformed_feature_columns.sort()

        model_results = TRAINING_ALGORITHMS[
            validated_data.get('training_algorithm')
        ](
            instance.dataset.path,
            transformed_feature_columns,
            instance.target_column
        )

        model_file_object = pickle.dumps(model_results)
        accuracy = round(metrics.accuracy_score(
            model_results['target_prediction'],
            model_results['target_test']
        ) * 100, 1)
        instance.training_algorithm = validated_data.get('training_algorithm')
        instance.trained_model.save(
            str(instance.uuid),
            ContentFile(model_file_object)
        )
        instance.save()
        return instance, accuracy


class PredictionSerializer(serializers.Serializer):
    fields = serializers.JSONField()

    def validate_fields(self, value: Dict[str, str]):
        instance = self.context['instance']

        if not instance.feature_columns:
            raise ValidationError(_("Feature columns have not yet been set"))
        
        if not instance.trained_model:
            raise ValidationError(_("Model has not been trained yet"))

        if list(value.keys()) != remove_chars_from_string(
                instance.feature_columns,
                ',',
                ' '
        ).split():
            raise ValidationError(_(f"Expected column(s) {instance.feature_columns}, got {list(value.keys())}"))
        
        for item in value.values():
            if item.upper() not in GRADE_VALUE.keys():
                raise ValidationError(_(f"'{item}' is not one of {tuple(GRADE_VALUE.keys())}"))

        return value
    
    def predict(self):
        instance = self.context['instance']
        user_input = list(map(
            lambda value: GRADE_VALUE.get(value.upper()),
            list(self.validated_data.get('fields').values())
        ))

        model_results = open(instance.trained_model.path, 'rb')
        training_results = pickle.load(model_results)
        prediction_result = training_results['clf'].predict([user_input])
        
        result = {
            'prediction_result': TRANSPOSED_GP_VALUE[str(prediction_result[0])],
            'fields': self.validated_data.get('fields')
        }

        return result
