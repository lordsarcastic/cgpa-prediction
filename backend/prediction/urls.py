from django.urls import path
from .views import TrainingModelView


app_name = 'prediction'

urlpatterns = [
    path("", TrainingModelView.as_view(), name="base")
]
