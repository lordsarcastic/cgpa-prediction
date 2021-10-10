from django.urls import path
from .views import SetFeatureColumnsView, TrainingModelView


app_name = 'prediction'

urlpatterns = [
    path("", TrainingModelView.as_view(), name="base"),
    path("<slug:uuid>/", SetFeatureColumnsView.as_view(), name="set-feature-columns" )
]
