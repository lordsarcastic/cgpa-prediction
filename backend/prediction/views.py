from .serializers import TrainingModelSerializer
from .models import TrainingModel


from rest_framework import generics


class TrainingModelView(generics.ListCreateAPIView):
    queryset = TrainingModel.objects.all()
    serializer_class = TrainingModelSerializer


class SetFeatureColumnsView(generics.UpdateAPIView):
    queryset = TrainingModel.objects.all()
    serializer_class = TrainingModelSerializer
    