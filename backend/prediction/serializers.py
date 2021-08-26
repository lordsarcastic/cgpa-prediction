from django.utils.timesince import timesince
from rest_framework import serializers

from DecisionTreeClassifier import produce_dataframe, read_file_data
from .models import TrainingModel


class DataFrameField(serializers.FileField):
    def to_representation(self, value):
        file_data = read_file_data(value)
        dataframe = produce_dataframe(file_data)
        return dataframe.head().to_dict()


class TimesinceField(serializers.Field):
    def to_representation(self, value):
        return timesince(value)



class TrainingModelSerializer(serializers.ModelSerializer):
    dataset = DataFrameField()
    last_updated = TimesinceField()
    created = TimesinceField()

    class Meta:
        model = TrainingModel
        exclude = ('id', )
