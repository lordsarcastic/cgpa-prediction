from django.contrib.auth.models import AbstractUser
from django.db import models
from django.template.defaultfilters import slugify


class User(AbstractUser):
    slug = models.SlugField(blank=True, editable=False)

    def save(self, *args, **kwargs):
        self.slug = slugify(self.username)
        return super().save(*args, **kwargs)
