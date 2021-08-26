from .serializers import TrainingModelSerializer
from .models import TrainingModel


from rest_framework import generics


class TrainingModelView(generics.ListCreateAPIView):
    queryset = TrainingModel.objects.all()
    serializer_class = TrainingModelSerializer

    # def create(self, request, *args, **kwargs):
    #     serializer = self.get_serializer_class()
    #     serializer = serializer(request.data)

    #     return super().create(request, *args, **kwargs)

# class PreviewTrainingModel()