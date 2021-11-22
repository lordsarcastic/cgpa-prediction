import { createContext, useMemo } from "react"
import { useParams } from "react-router"
import { useAxios } from "use-axios-client"
import { client, ENDPOINTS, replaceUUID } from "../../../requests"
import { Tab, TabWrapper } from "../../../Tab"
import { ListTrainingModelWithHeader } from "../../../types"
import { ListingTable } from "../../DatasetList"
import { AutomaticTab } from "./Automatic"
import { ManualTab } from "./Manual"

const tabs = [
    ManualTab,
    AutomaticTab
]

const Header = () => {
    return (
        <h1>Select features for the model</h1>
    )
}

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
            {data && <div>
                <ListingTable dataset={[data]} />
                <TabWrapper tabs={tabs} />
            </div>}
        </DetailAxiosContext.Provider>
    )
}

export const SelectFeaturesTab: Tab = {
    Header: Header,
    Component: Main,
    trigger: 'sf'
}