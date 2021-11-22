import { TabWrapper } from "../../Tab";
import { Page } from "../../types"
import { PredictTab } from "./Predict";
import { SelectFeaturesTab } from "./SetColumns";
import { TrainModelTab } from "./TrainModel";

const tabs = [
    SelectFeaturesTab,
    TrainModelTab,
    PredictTab
]

const Main = () => {
    return (
        <div>
            <h1>The model we are woking with</h1>
            <TabWrapper tabs={tabs} />
        </div>
    )
}

export const DatasetDetail: Page = {
    Component: Main,
    route: '/:uuid',
    exact: true
}