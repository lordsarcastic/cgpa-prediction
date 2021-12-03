import { useContext, useState } from "react"
import { FaArrowRight } from "react-icons/fa"
import { useParams } from "react-router"
import { DetailAxiosContext } from "."
import Loader from "../../Loader"
import Modal, { FooterModal } from "../../Modal"
import { trainModel } from "../../requests"
import { Tab } from "../../Tab"
import { TrainedModel, TrainingAlgorithm, TrainingAlgorithmStrings } from "../../types"

const Header = () => {
    return (
        <h1>Train model</h1>
    )
}

const Main = () => {
    const { uuid } = useParams<{ uuid: string }>();
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
        <>
            {data?.target_column
                ? <div className="flex flex-col gap-y-8">
                    <p>This model has been trained with the <span className="py-0.5 px-4 bg-pink-700 font-bold mx-0.5">{TrainingAlgorithm[data?.training_algorithm]}</span> algorithm.
                        It could be retrained using either algorithms below</p>
                    <div className="flex flex-col gap-y-4">
                        <h2 className="text-2xl font-bold">Train model <FaArrowRight className="text-white inline text-xl" /></h2>
                        <Loader {...submitting} />
                        <div className="flex gap-x-8 w-full">
                            <button
                                onClick={() => handleTrainModel('decision_tree')}
                                className="bg-green-400 hover:bg-green-600 w-full text-white text-xl mt-10 font-bold py-3 px-4 rounded-lg cursor-pointer"
                            >
                                Decision Tree Classifier
                            </button>
                            <button
                                onClick={() => handleTrainModel('random_forest')}
                                className="bg-yellow-400 hover:bg-yellow-600 w-full text-white text-xl mt-10 font-bold py-3 px-4 rounded-lg cursor-pointer"
                            >
                                Random Forest
                            </button>
                        </div>
                    </div>
                </div>
                : <p>You've not set respective <span className="py-0.5 px-4 bg-gray-500 font-bold mx-0.5">course columns</span> and <span className="py-0.5 px-4 bg-pink-900 font-bold mx-0.5">grade column</span> on this dataset. It can't be trained yet.</p>}
            {response && <Modal onClose={() => setResponse({} as TrainedModel)}>
                <h1 className="text-2xl font-bold text-green-300 mb-6">Model Trained!</h1>
                <div className="px-6">
                    <p>Accuracy of trained model is: <span className="py-0.5 px-4 bg-pink-700 font-bold mx-0.5">{response.accuracy}%</span>.
                        If you're not satisfied, you can set new columns and retrain the model or use a different training algorithm</p>
                    <p>Training algorithm used: <span className="py-0.5 px-4 bg-pink-700 font-bold mx-0.5">{TrainingAlgorithm[response.training_algorithm]}</span></p>
                </div>
            </Modal>}
            {success && <FooterModal message="Model has been trained, you can go ahead and predict results" />}
        </>
    )
}

export const TrainModelTab: Tab = {
    Header: Header,
    Component: Main,
    trigger: 'tm'
}