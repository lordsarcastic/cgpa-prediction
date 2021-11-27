import { FunctionComponent } from "react";

export enum FeatureSelectionAlgorithm {
    rfe = 'Recursive Feature Elimination',
    pearson = 'Pearson\'s correlation'
}

export enum TrainingAlgorithm {
    decision_tree = 'Decision Tree Classifier',
    random_forest = 'Random Forest'
}

export enum TrainingAlgorithmColor {
    decision_tree = 'bg-blue-500 text-white',
    random_forest = 'bg-yellow-500 text-white',
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
    dataset: {[key: string]: { [key: string]: string }}
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
