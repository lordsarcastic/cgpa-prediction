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



const Main = () => {
    return (
        <TabWrapper tabs={tabs} />
    )
}

export const SelectFeaturesTab: Tab = {
    Header: Header,
    Component: Main,
    trigger: 'sf'
}