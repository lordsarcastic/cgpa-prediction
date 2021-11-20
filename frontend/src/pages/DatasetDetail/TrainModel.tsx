import { Tab } from "../../Tab"

const Header = () => {
    return (
        <h1>Train model</h1>
    )
}

const Main = () => {
    return (
        <p>Train the model here</p>
    )
}

export const TrainModelTab: Tab = {
    Header: Header,
    Component: Main,
    trigger: 'tm'
}