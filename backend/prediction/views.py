from rest_framework.response import Response
from rest_framework import status
from .serializers import FeatureSelectionSerializer, ListTrainingModelSerializer, PredictionSerializer, SetColumnsSerializer, TrainModelSerializer, TrainingModelSerializer
from .models import TrainingModel


from rest_framework import generics


class ListOrCreateTrainingModelView(generics.ListCreateAPIView):
    queryset = TrainingModel.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ListTrainingModelSerializer
        return TrainingModelSerializer


class TrainingModelDetailView(generics.RetrieveAPIView):
    queryset = TrainingModel
    serializer_class = TrainingModelSerializer
    lookup_field = 'uuid'

class SetColumnsView(generics.UpdateAPIView):
    queryset = TrainingModel.objects.all()
    serializer_class = SetColumnsSerializer
    lookup_field = 'uuid'


class FeatureSelectionView(generics.UpdateAPIView):
    queryset = TrainingModel
    serializer_class = FeatureSelectionSerializer
    lookup_field = 'uuid'

    def put(self, request, *args, **kwargs):
        training_model = self.get_object()
        serializer = self.serializer_class(training_model, data=request.data)
        if serializer.is_valid():
            data = serializer.save()
            return Response({
                "feature_columns": data.feature_columns,
                "target_column": data.target_column
            }, status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TrainModelView(generics.UpdateAPIView):
    queryset = TrainingModel
    serializer_class = TrainModelSerializer
    lookup_field = 'uuid'


class PredictionView(generics.UpdateAPIView):
    queryset = TrainingModel
    serializer_class = PredictionSerializer
    lookup_field = 'uuid'

    def put(self, request, *args, **kwargs):
        training_model = self.get_object()
        serializer = self.serializer_class(
            data=request.data,
            context={'instance': training_model}
        )

        if serializer.is_valid():
            data = serializer.predict()
            return Response(data, status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
