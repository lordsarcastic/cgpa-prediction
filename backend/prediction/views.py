from rest_framework.response import Response
from rest_framework import status
from .serializers import FeatureSelectionSerializer, ListTrainingModelSerializer, PredictionSerializer, SetColumnsSerializer, TrainModelSerializer, TrainingModelSerializer
from .models import TrainingModel


from rest_framework import generics


class ListOrCreateTrainingModelView(generics.ListCreateAPIView):
    """
    Creates a dataset:
        Expects:
            dataset: A csv or excel file containing a dataset of grades
                and CGPA grade
            title: A title for the dataset
        Returns:
            dataset: A csv or excel file containing a dataset of grades
                and CGPA grade
            title: A title for the dataset

    List datasets:
        Returns:
            uuid: UUID of the dataset
            title: Title of the dataset
            dataset: A csv or excel file containing a dataset of grades
                and CGPA grade
            feature_selection_algorithm: A string specifying an algorithm
                to use for feature selection. Choices are:
                - rfe: Recursive Feature Elimination
                - pearson: Pearson's correlation
            training_algorithm: A string specifying an algorithm
                to use for training the model. Choices are:
                - decision_tree: Decision Tree Classifier
                - random_forest: Random Forest
            feature_columns: A string of comma-separated column names
            target_column: A string specifying a target column
            trained_model: A path to the pickled trained model
            created: When the dataset was created
            last_updated: When last an operation was performed on the dataset
    """
    queryset = TrainingModel.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ListTrainingModelSerializer
        return TrainingModelSerializer


class TrainingModelDetailView(generics.RetrieveAPIView):
    """
    Returns detail of a dataset
    """
    queryset = TrainingModel
    serializer_class = TrainingModelSerializer
    lookup_field = 'uuid'

class SetColumnsView(generics.UpdateAPIView):
    """
    Expects:
        feature_columns: A string of comma-separated column names
        target_column: A string specifying a target column
    
    Returns:
        feature_columns: A stringified array of columns
        target_column: A string containing the target column
    """
    queryset = TrainingModel.objects.all()
    serializer_class = SetColumnsSerializer
    lookup_field = 'uuid'


class FeatureSelectionView(generics.UpdateAPIView):
    """
    Expects:
        feature_selection_algorithm: A string specifying an algorithm
            to use for feature selection. Choices are:
            - rfe: Recursive Feature Elimination
            - pearson: Pearson's correlation
        target_column: A string containing the target column which is
            exluded from the feature selection
    
    Returns:
        feature_columns: A stringified array of columns
        target_column: A string containing the target column
    """
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
    """
    Expects:
        training_algorithm: A string specifying an algorithm
            to use for training the model. Choices are:
            - decision_tree: Decision Tree Classifier
            - random_forest: Random Forest
    
    Returns:
        uuid: UUID of the dataset
        title: Title of the dataset
        training_algorithm: The training algorithm used
        accuracy: The accuracy of the training process
    """
    queryset = TrainingModel
    serializer_class = TrainModelSerializer
    lookup_field = 'uuid'

    def put(self, request, *args, **kwargs):
        training_model = self.get_object()
        serializer = self.serializer_class(training_model, data=request.data)
        if serializer.is_valid():
            instance, training_results = serializer.save()
            return Response({
                "uuid": instance.uuid,
                "title": instance.title,
                "training_algorithm": instance.training_algorithm,
                "accuracy": f"{training_results}%"
            }, status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PredictionView(generics.UpdateAPIView):
    """
    Expects:
        fields: A JSON of key: column name, value: grade value; pair
            containing scores to be used to predict value for target
            column. Grade value must be one of letters A up to F
    """
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
