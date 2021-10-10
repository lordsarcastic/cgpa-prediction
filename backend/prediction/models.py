import uuid
from functools import lru_cache
from typing import Callable, List, Union

from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import gettext_lazy as _
from .utils import arrayfy_strings, stringify_array

import pandas as pd

from DecisionTreeClassifier import produce_dataframe, read_file_data, ALLOWED_EXTENSIONS, normalize_dataframe

def clean_array(array: List) -> List:
    """
    :param array: an array of values of different types
    :return: an array containing truthy values in `array`
    """

    return list(filter(bool, array))

class TrainingModel(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=64)
    dataset = models.FileField(upload_to='models')
    target_column = models.CharField(max_length=50, null=True)
    feature_columns = models.TextField(blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True, editable=False)
    last_updated = models.DateTimeField(auto_now=True, editable=False)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-last_updated']
    
    @lru_cache
    def get_dataframe_from_dataset(self, dataset_path, columns: List[str] = None):
        file_data = read_file_data(dataset_path.name)
        dataframe = produce_dataframe(file_data, columns)
        return dataframe

    def validate_dataset(self, value):
        extension = value.name.split('.')[-1]
        if extension not in ALLOWED_EXTENSIONS:
            raise ValidationError(_(f'Expected file with extension: {ALLOWED_EXTENSIONS}, found file type of {extension}'))
        
        return value
    
    def validate_feature_columns(self, value):
        try:
            value_array = arrayfy_strings(value)
        except:
            raise ValidationError(_('Columns are not valid as an array. Ensure input is a string of comma-separated values'))

        return value_array
        # return stringify_array(value_array)
    

    def validate(self, attrs):
        dataframe = self.get_dataframe_from_dataset(attrs['dataset'])
        columns = clean_array([
            attrs.get('target_column'),
            *attrs.get('feature_columns')
        ])
        for column in columns:
            if column and column not in dataframe.columns:
                raise ValueError(f"{column} is not a column in dataframe")
        if columns:
            attrs['dataset'] = normalize_dataframe(
                attrs.get('feature_column'),
                attrs.get('target_column'),
                dataframe
            )
        
        return super().validate(attrs)
    
    def clean_fields(self):
        extension = self.dataset.name.split('.')[-1]
        if extension not in ALLOWED_EXTENSIONS:
            raise ValidationError(_(f'Expected file with extension: {ALLOWED_EXTENSIONS}, found file type of {extension}'))
        
        try:
            value_array = arrayfy_strings(self.feature_columns)
        except:
            raise ValidationError(_('Columns are not valid as an array. Ensure input is a string of comma-separated values'))
        
        dataframe = self.get_dataframe_from_dataset(self.dataset)
        columns = clean_array([
            self.target_column,
            *value_array
        ])

        for column in columns:
            if column and column not in dataframe.columns:
                raise ValueError(f"{column} is not a column in dataframe")
    
    def clean(self):
        value_array = arrayfy_strings(self.feature_columns)
        dataframe = self.get_dataframe_from_dataset(self.dataset)
        columns = clean_array([
            self.target_column,
            *value_array
        ])
        if columns:
            dataframe = normalize_dataframe(
                self.feature_column,
                value_array,
                dataframe
            )
po
        pd.to_csv(dataframe)
            
