from django.urls import path, include

from .views import SetColumnsView, TrainingModelDetailView, TrainingModelView


app_name = 'prediction'

urlpatterns = [
    path("", TrainingModelView.as_view(), name="base"),
    path("<slug:uuid>/", include([
        path('', TrainingModelDetailView.as_view(), name="training-detail"),
        path('set-columns/', SetColumnsView.as_view(), name="set-columns" )
    ])), 
]
