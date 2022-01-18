import { FunctionComponent } from "react";

export enum FeatureSelectionAlgorithm {
    rfe = 'Recursive Feature Elimination',
    pearson = 'Pearson\'s correlation'
}

export enum TrainingAlgorithm {
    decision_tree = 'Decision Tree Classifier',
    random_forest = 'Random Forest',
    naive_bayes = 'Naive Bayes',
    k_nearest_neighbours = 'K Nearest Neighbours',
    support_vector = 'Support Vector Machine'
}

export enum TrainingAlgorithmColor {
    decision_tree = 'bg-blue-400 hover:bg-blue-600 text-white',
    random_forest = 'bg-yellow-400 hover:bg-yellow-600 text-white',
    naive_bayes = 'bg-green-400 hover:bg-green-600 text-white',
    k_nearest_neighbours = 'bg-pink-400 hover:bg-pink-600 text-white',
    support_vector = 'bg-red-400 hover:bg-red-600 text-white',
    fallback = ''
}

export type Page = {
    Component: FunctionComponent,
    route: string,
    exact?: boolean
}

export type FeatureSelectionAlgorithmStrings = keyof typeof FeatureSelectionAlgorithm;

export type TrainingAlgorithmStrings = keyof typeof TrainingAlgorithm

export type CreateTrainingModel = {
    dataset: File,
    title: string
}

export type ColumnsModel = {
    feature_columns: string,
    target_column: string,
}

export type ListTrainingModel = CreateTrainingModel & ColumnsModel & {
    uuid: string,
    feature_selection_algorithm: FeatureSelectionAlgorithmStrings,
    training_algorithm: TrainingAlgorithmStrings
    trained_model: URL,
    created: string,
    last_updated: string
}

export type ListTrainingModelWithHeader = ListTrainingModel & {
    dataset: { [key: string]: { [key: string]: string } }
}

export type FeatureSelectionModel = {
    feature_selection_algorithm: FeatureSelectionAlgorithmStrings,
    target_column: string
}

export type TrainModel = {
    training_algorithm: TrainingAlgorithmStrings
}

export type TrainedModel = {
    uuid: string,
    title: string
    training_algorithm: TrainingAlgorithmStrings,
    accuracy: number
}

export type PredictionModel = {
    fields: object,
    prediction_result: string
}

export type AllowedColumnValues = {
    uuid: string,
    columns: Record<string, Array<string>>
}