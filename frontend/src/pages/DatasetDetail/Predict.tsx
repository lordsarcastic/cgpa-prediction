import { Tab } from "../../Tab"

const Header = () => {
    return (
        <h1>Predict</h1>
    )
}

const Main = () => {
    return (
        <p>Predict the model here</p>
    )
}

export const PredictTab: Tab = {
    Header: Header,
    Component: Main,
    trigger: 'pr'
}