import axios from "axios";
import { ColumnsModel, CreateTrainingModel, FeatureSelectionAlgorithmStrings, ListTrainingModel, PredictionModel, TrainedModel, TrainingAlgorithmStrings } from "./types";

export const client = axios.create({
    baseURL: 'http://localhost:8000/prediction'
})

const ENDPOINTS = {
    listDatasets: '/',
    createDataset: '/',
    datasetDetail: '/?uuid/',
    setColumns: '/?uuid/set-columns/',
    selectFeatures: '/?uuid/select-features/',
    train: '/?uuid/train/',
    predict: '/?uuid/predict/'
}


const replaceUUID = (endpoint: string, uuid: string): string => {
    return endpoint.replace('?uuid', uuid);
}

export const createDataset = async (dataset: CreateTrainingModel): Promise<ListTrainingModel> => {
    console.log("Seter")
    const form = new FormData();
    form.append("title", dataset.title)
    form.append("dataset", dataset.dataset)
    const response = await client.post(
        ENDPOINTS.createDataset,
        form
    )
    console.log(response.statusText)
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

export const setColumns = async (uuid: string, featureColumns: Array<string>, targetColumn: string): Promise<ColumnsModel> => {
    const response = await client.put(
        replaceUUID(ENDPOINTS.setColumns, uuid),
        {
            feature_columns: featureColumns.join(', '),
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