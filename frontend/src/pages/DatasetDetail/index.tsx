import { useFormik } from "formik";
import { useContext, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router"
// import { Link } from "react-router-dom"
import { useAxios } from "use-axios-client"
import Loader from "../../Loader"
import { TabWrapper } from "../../Tab";
import { Page } from "../../types"
import { PredictTab } from "./Predict";
import { SetColumnsTab } from "./SetColumns";
import { TrainModelTab } from "./TrainModel";

const tabs = [
    SetColumnsTab,
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