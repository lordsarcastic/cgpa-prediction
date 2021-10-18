from .serializers import ListTrainingModelSerializer, SetColumnsSerializer, TrainingModelSerializer
from .models import TrainingModel


from rest_framework import generics


class TrainingModelView(generics.ListCreateAPIView):
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
    

# set feature columns
# set target column
# do feature selection
# train
# predict