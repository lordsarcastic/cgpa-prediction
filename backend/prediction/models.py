import uuid
from functools import lru_cache
from typing import List

from django.core.exceptions import ValidationError
from django.db import models
from django.urls import reverse
from django.utils.translation import gettext_lazy as _

from backend.Learning.utils import produce_dataframe, read_file_data, ALLOWED_EXTENSIONS
from .utils import arrayfy_strings


def clean_array(array: List) -> List:
    """
    :param array: an array of values of different types
    :return: an array containing truthy values in `array`
    """

    return list(filter(bool, array))

def validate_dataset(value):
        extension = value.name.split('.')[-1]
        if extension not in ALLOWED_EXTENSIONS:
            raise ValidationError(_(f'Expected file with extension: {ALLOWED_EXTENSIONS}, found file type of {extension}'))
        
def validate_feature_columns(value):
    try:
        arrayfy_strings(value)
    except:
        raise ValidationError(_('Columns are not valid as an array. Ensure input is a string of comma-separated values'))


class TrainingModel(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=64)
    dataset = models.FileField(upload_to='models', validators=[validate_dataset])
    target_column = models.CharField(max_length=50, blank=True)
    feature_columns = models.TextField(blank=True)
    created = models.DateTimeField(auto_now_add=True, editable=False)
    last_updated = models.DateTimeField(auto_now=True, editable=False)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-last_updated']
    
    @lru_cache
    def get_dataframe_from_dataset(self, dataset_path, columns: List[str] = None):
        file_data = read_file_data(dataset_path.path)
        dataframe = produce_dataframe(file_data, columns)
        
        return dataframe

    def clean(self):
        extension = self.dataset.name.split('.')[-1]
        if extension not in ALLOWED_EXTENSIONS:
            raise ValidationError(_(f'Expected file with extension: {ALLOWED_EXTENSIONS}, found file type of {extension}'))
        
        try:
            value_array = arrayfy_strings(self.feature_columns)
        except:
            raise ValidationError(_('Columns are not valid as an array. Ensure input is a string of comma-separated values'))
        
        dataframe = self.get_dataframe_from_dataset(self.dataset)
        if self.target_column and self.target_column not in dataframe.columns:
            raise ValidationError(_(f"Target column '{self.target_column}' is not in dataset"))

        columns = clean_array(value_array)

        for column in columns:
            if column and column not in dataframe.columns:
                raise ValidationError(_(f"{column} is not a column in dataset"))
        
    def save(self, *args):
        value_array = arrayfy_strings(self.feature_columns)
        if value_array:
            self.feature_columns = ', '.join(value_array)
        if not self.target_column:
            self.target_column = str()
        if not value_array:
            self.feature_columns = str()

        return super().save(*args)

    def get_absolute_url(self):
        return reverse("prediction:training-detail", kwargs={"uuid": self.uuid})
    
