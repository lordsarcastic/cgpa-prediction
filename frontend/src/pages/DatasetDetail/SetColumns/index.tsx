import { Tab, TabWrapper } from "../../../Tab"
import { AutomaticTab } from "./Automatic"
import { ManualTab } from "./Manual"

const tabs = [
    ManualTab,
    AutomaticTab
]

const Header = () => {
    return (
        <h1>Assign columns</h1>
    )
}

const Main = () => {
    return (
        <div className="flex flex-col gap-y-10">
            <p className="whitespace-pre-line leading-loose">
                To begin the prediction process, you have to select <span className="py-0.5 px-4 bg-pink-500 font-bold mx-0.5">course columns</span> that should be used as <span className="py-0.5 px-4 bg-pink-700 font-bold mx-0.5">columns</span> for the courses.
                These <span className="py-0.5 px-4 bg-pink-700 font-bold mx-0.5">columns</span> are those which you think have an effect on the final grade. You can either select them manually,
                or allow an algorithm select them for you.

                The <span className="py-0.5 px-4 bg-pink-700 font-bold mx-0.5">columns</span> are expected to contain values between A - F. Any other type of data will be interpreted as an F.

                Next, you select the <span className="py-0.5 px-4 bg-pink-900 font-bold mx-0.5">grade column</span>. This is supposed to be the column containing the final grade with expected values
                ranging between PASS and FIRST CLASS. Any unexpected data will be interpreted as a PASS.
            </p>
            <TabWrapper tabs={tabs} />
        </div>
    )
}

export const SelectFeaturesTab: Tab = {
    Header: Header,
    Component: Main,
    trigger: 'sf'
}