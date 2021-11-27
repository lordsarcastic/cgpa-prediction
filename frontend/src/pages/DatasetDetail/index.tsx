import { createContext, useMemo } from "react";
import { useParams } from "react-router";
import { useAxios } from "use-axios-client";
import Loader from "../../Loader";
import { client, ENDPOINTS, replaceUUID } from "../../requests";
import { TabWrapper } from "../../Tab";
import { ListTrainingModelWithHeader, Page } from "../../types"
import { ListingTable } from "../DatasetList";
import { PredictTab } from "./Predict";
import { SelectFeaturesTab } from "./SetColumns";
import { TrainModelTab } from "./TrainModel";

const tabs = [
    SelectFeaturesTab,
    TrainModelTab,
    PredictTab
]
export type DetailAxiosProps = {
    loading: boolean,
    refetch: () => Promise<void>
    data?: ListTrainingModelWithHeader,
    error?: Error
}

export const DetailAxiosContext = createContext({} as DetailAxiosProps)
const Main = () => {
    const { uuid } = useParams<{uuid: string}>();
    const uuidEndpoint = replaceUUID(ENDPOINTS.datasetDetail, uuid);
    const { data, error, loading, refetch } = useAxios<ListTrainingModelWithHeader>({
        axiosInstance: client,
        url: uuidEndpoint
    })

    const value = useMemo(() => ({
        data,
        loading,
        refetch,
        error
    }), [data, loading, refetch, error])

    return (
        <DetailAxiosContext.Provider value={value}>
            <Loader {...loading} />
            {data && <div className="flex flex-col gap-y-10 text-white">
                <h1 className="text-5xl font-bold">{data.title} Dataset</h1>
                <ListingTable dataset={[data]} />
                <TabWrapper tabs={tabs} />
            </div>
            }
        </DetailAxiosContext.Provider>
    )
}

export const DatasetDetail: Page = {
    Component: Main,
    route: '/:uuid',
    exact: true
}