import uuid
from functools import lru_cache
from typing import List

from django.core.exceptions import ValidationError
from django.db import models
from django.urls import reverse
from django.utils.translation import gettext_lazy as _

from Learning.utils import produce_dataframe, read_file_data, ALLOWED_EXTENSIONS
from .utils import arrayfy_strings, clean_array, validate_dataset


class TrainingModel(models.Model):
    class FeatureSelectionAlgorithm(models.TextChoices):
        rfe = "rfe", "Recursive Feature Elimination"
        pearson = "pearson", "Pearson Correlation"

    class TrainingAlgorithm(models.TextChoices):
        dt = 'decision_tree', "Decision Tree Classifier"
        rf = 'random_forest', "Random Forest"

    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=64)
    dataset = models.FileField(
        upload_to='models', validators=[validate_dataset])
    feature_selection_algorithm = models.CharField(
        choices=FeatureSelectionAlgorithm.choices, max_length=7, blank=True)
    training_algorithm = models.CharField(
        choices=TrainingAlgorithm.choices, max_length=13, blank=True)
    target_column = models.CharField(max_length=50, blank=True)
    feature_columns = models.TextField(blank=True)
    trained_model = models.FileField(upload_to='models/trained', blank=True)
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
            raise ValidationError(
                _(f'Expected file with extension: {ALLOWED_EXTENSIONS}, found file type of {extension}'))

        try:
            value_array = arrayfy_strings(self.feature_columns)
        except:
            raise ValidationError(
                _('Columns are not valid as an array. Ensure input is a string of comma-separated values'))

        dataframe = self.get_dataframe_from_dataset(self.dataset)
        if self.target_column and self.target_column not in dataframe.columns:
            raise ValidationError(
                _(f"Target column '{self.target_column}' is not in dataset"))

        columns = clean_array(value_array)

        for column in columns:
            if column and column not in dataframe.columns:
                raise ValidationError(
                    _(f"{column} is not a column in dataset"))

    def save(self, *args, **kwargs):
        value_array = arrayfy_strings(self.feature_columns)
        if self.target_column in value_array:
            value_array.remove(self.target_column)

        self.feature_columns = ', '.join(value_array)

        return super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse("prediction:training-detail", kwargs={"uuid": self.uuid})
