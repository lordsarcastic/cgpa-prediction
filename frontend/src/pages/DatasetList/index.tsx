import { FunctionComponent, useCallback, useContext, useEffect, useState } from 'react'
import { FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ErrorContext } from '../../App';
import Loader from '../../Loader';
import Modal from '../../Modal';
import { getListOfDataset } from '../../requests';
import { ListTrainingModel, Page, TrainingAlgorithm, TrainingAlgorithmColor } from '../../types'
import { AddDatasetForm } from './AddDatasetForm';

const ListingItem: FunctionComponent<ListTrainingModel> = ({uuid, title, trained_model, created, last_updated, feature_columns, target_column, training_algorithm}) => {
    return (
        <tr className="w-full bg-gray-700">
            <td className="p-3"><Link className="text-green-200 font-bold" to={`/${uuid}`}>{uuid}</Link></td>
            <td className="p-3">{title}</td>
            <td className="p-3">{created} ago</td>
            <td className="p-3">{last_updated} ago</td>
            <td className="p-3">{feature_columns}</td>
            <td className="p-3">{target_column}</td>
            <td className="p-3">
                <span
                    className={`${TrainingAlgorithmColor[training_algorithm] || TrainingAlgorithmColor.fallback} py-1 px-2`}>
                    {TrainingAlgorithm[training_algorithm] || '-'}
                </span>
            </td>
        </tr>
    )
}

export const ListingTable: FunctionComponent<{dataset: ListTrainingModel[]}> = ({dataset}) => {
    return (
        <table className="table border-separate space-y-6 text-sm w-full text-white">
            <thead className="bg-gray-700 font-bold text-xl">
                <tr>
                    <td className="p-3">UUID</td>
                    <td className="p-3 text-left">Title</td>
                    <td className="p-3 text-left">Created</td>
                    <td className="p-3 text-left">Updated</td>
                    <td className="p-3 text-left">Feature Columns</td>
                    <td className="p-3 text-left">Target Columns</td>
                    <td className="p-3 text-left">Training Algorithm</td>
                </tr>
            </thead>
            {<tbody className="gap-y-8">
                {dataset.map(data => (
                    <ListingItem key={data.uuid} {...data} />
                ))}
            </tbody>}
    </table>
    )
}

export const Listing = () => {
    const [dataset, setDataset] = useState<ListTrainingModel[]>([]);
    const {error, setError } = useContext(ErrorContext)
    const [loading, setLoading] = useState<boolean>(false);
    const [showForm, setShowForm] = useState(false)

    const loadDataset = useCallback(
        () => {
            setLoading(true);

            getListOfDataset()
                .then((data) => setDataset(data))
                .catch((err) => {
                    setError(err)
                })
                .finally(() => setLoading(false))
        },
        [setError],
    )
    
    const handleAddDataSet = () => {
        setShowForm(true)
    }

    useEffect(() => {
        loadDataset()
    }, [showForm, loadDataset])

    return (
        <div className="rounded-lg shadow-lg p-4 bg-gray-900 text-white w-full h-full">
            {showForm && <Modal onClose={() => setShowForm(false)}>
                <AddDatasetForm showForm={setShowForm} />
            </Modal>}
            <div className="flex justify-between mb-8">
                <h1 className="text-5xl font-bold justify-self-center">Dataset List</h1>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg" onClick={handleAddDataSet}>
                    <FaPlus />
                </button>
            </div>
            {!error && <ListingTable dataset={dataset} />}
            <Loader {...loading} />
        </div>
    )
}

export const ListingPage: Page = {
    Component: Listing,
    route: '/',
}