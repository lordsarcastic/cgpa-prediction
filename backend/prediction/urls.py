from django.urls import path, include

from .views import FeatureSelectionView, ListOrCreateTrainingModelView, PredictionView, SetColumnsView, TrainModelView, TrainingModelDetailView


app_name = 'prediction'

urlpatterns = [
    path("", ListOrCreateTrainingModelView.as_view(), name="base"),
    path("<slug:uuid>/", include([
        path('', TrainingModelDetailView.as_view(), name="training-detail"),
        path('set-columns/', SetColumnsView.as_view(), name="set-columns"),
        path('select-features/', FeatureSelectionView.as_view(), name="select-features"),
        path('train/', TrainModelView.as_view(), name="train"),
        path('predict/', PredictionView.as_view(), name="predict")
    ])),
]
