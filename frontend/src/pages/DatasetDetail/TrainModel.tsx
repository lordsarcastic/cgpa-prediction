import { useContext, useState } from "react"
import { useParams } from "react-router"
import { DetailAxiosContext } from "."
import Loader from "../../Loader"
import { FooterModal } from "../../Modal"
import { trainModel } from "../../requests"
import { Tab } from "../../Tab"
import { TrainedModel, TrainingAlgorithm, TrainingAlgorithmStrings } from "../../types"

const Header = () => {
    return (
        <h1>Train model</h1>
    )
}

const Main = () => {
    const { uuid } = useParams<{uuid: string}>();
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [response, setResponse] = useState<TrainedModel>();
    const [success, setSuccess] = useState<boolean>(false);
    const { data, refetch } = useContext(DetailAxiosContext)
    const handleTrainModel = (algorithm: TrainingAlgorithmStrings) => {
        setSubmitting(true)
        trainModel(uuid, algorithm)
            .then((data) => {
                setSuccess(true)
                setResponse(data)
                setTimeout(() => setSuccess(false), 5000)
                refetch()
            })
            .catch(error => console.log(error))
            .finally(() => setSubmitting(false))
    }
    return (
        <div>
            {data?.training_algorithm && <p>This model has been trained with the {TrainingAlgorithm[data?.training_algorithm]} algorithm.
            But you can still train it below</p>}
            <p>Train the model here</p>
            <Loader {...submitting} />
            {response && <div>
                Accuracy of trained model is: {response.accuracy}%. If you're not satisfied, you can set new columns and retrain the model
                <br />
                Training algorithm used: {TrainingAlgorithm[response.training_algorithm]}
            </div>}
            <div>
                <button onClick={() => handleTrainModel('decision_tree')} className="bg-green-400 py-0.5 px-4 rounded-sm">Decision Tree Classifier</button>
                <button onClick={() => handleTrainModel('random_forest')} className="bg-yellow-400 py-0.5 px-4 rounded-sm">Random Forest</button>
            </div>
            {success && <FooterModal message="Model has been trained, you can go ahead and predict results" />}
        </div>

    )
}

export const TrainModelTab: Tab = {
    Header: Header,
    Component: Main,
    trigger: 'tm'
}