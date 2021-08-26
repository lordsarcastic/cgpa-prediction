import uuid
from typing import List
from django.db import models


class TrainingModel(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=64)
    dataset = models.FileField(upload_to='models')
    target_column = models.CharField(max_length=50, null=True)
    prediction_columns = models.TextField(blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-last_updated']
