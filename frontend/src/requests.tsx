import axios from "axios";
import { ColumnsModel, CreateTrainingModel, FeatureSelectionAlgorithmStrings, ListTrainingModel, PredictionModel, TrainedModel, TrainingAlgorithmStrings } from "./types";

export const client = axios.create({
    baseURL: 'http://localhost:8000/prediction'
})

export const BASE_URL = 'http://localhost:8000/prediction/';

export const ENDPOINTS = {
    listDatasets: '/',
    createDataset: '/',
    datasetDetail: '/?uuid/',
    setColumns: '/?uuid/set-columns/',
    selectFeatures: '/?uuid/select-features/',
    train: '/?uuid/train/',
    predict: '/?uuid/predict/'
}


export const replaceUUID = (endpoint: string, uuid: string): string => {
    return endpoint.replace('?uuid', uuid);
}

export type useRequestProps<S, T> = {
    data: S,
    request: Promise<T>,
    params: object
}

export const createDataset = async (dataset: CreateTrainingModel): Promise<ListTrainingModel> => {
    const form = new FormData();
    form.append("title", dataset.title)
    form.append("dataset", dataset.dataset)
    const response = await client.post(
        ENDPOINTS.createDataset,
        form
    )
    return response.data;
}

export const getListOfDataset = async (): Promise<ListTrainingModel[]> => {
    const response = await client.get(ENDPOINTS.listDatasets)

    return response.data;
}

export const getDatasetDetail = async (uuid: string): Promise<ListTrainingModel> => {
    const response = await client.get(
        replaceUUID(ENDPOINTS.datasetDetail, uuid)
    )

    return response.data
}

export const setColumns = async (uuid: string, featureColumns: string, targetColumn: string): Promise<ColumnsModel> => {
    const response = await client.put(
        replaceUUID(ENDPOINTS.setColumns, uuid),
        {
            feature_columns: featureColumns,
            target_column: targetColumn
        }
    )

    return response.data;
}

export const performFeatureSelection = async (uuid: string, algorithm: FeatureSelectionAlgorithmStrings, targetColumn: string): Promise<ColumnsModel> => {
    const response = await client.put(
        replaceUUID(ENDPOINTS.selectFeatures, uuid),
        {
            feature_selection_algorithm: algorithm,
            target_column: targetColumn
        }
    )

    return response.data;
}

export const trainModel = async (uuid: string, algorithm: TrainingAlgorithmStrings): Promise<TrainedModel> => {
    const response = await client.put(
        replaceUUID(ENDPOINTS.train, uuid),
        {
            training_algorithm: algorithm
        }
    )

    return response.data;
}

export const predictOutcome = async (uuid: string, columns: object): Promise<PredictionModel> => {
    const response = await client.put(
        replaceUUID(ENDPOINTS.predict, uuid),
        {
            fields: columns
        }
    )

    return response.data;
}