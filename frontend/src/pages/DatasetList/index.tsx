import { FunctionComponent, useContext, useEffect, useState } from 'react'
import { FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ErrorContext } from '../../App';
// import { Error } from '../../Error';
import Loader from '../../Loader';
import Modal from '../../Modal';
import { getListOfDataset } from '../../requests';
import { ListTrainingModel, Page, TrainingAlgorithm, TrainingAlgorithmColor } from '../../types'
import { AddDatasetForm } from './AddDatasetForm';

const ListingItem: FunctionComponent<ListTrainingModel> = ({uuid, title, trained_model, created, last_updated, feature_columns, target_column, training_algorithm}) => {
    return (
        <tr className="w-full">
            <td><Link to={`/${uuid}`}>{uuid}</Link></td>
            <td>{title}</td>
            <td>{Boolean(trained_model)}</td>
            <td>{created} ago</td>
            <td>{last_updated} ago</td>
            <td>{feature_columns}</td>
            <td>{target_column}</td>
            <td>
                <span
                    className={`${TrainingAlgorithmColor[training_algorithm] || TrainingAlgorithmColor.fallback} rounded-lg py-0.5 px-2`}>
                    {TrainingAlgorithm[training_algorithm] || '-'}
                </span>
            </td>
        </tr>
    )
}

export const ListingTable: FunctionComponent<{dataset: ListTrainingModel[]}> = ({dataset}) => {
    return (
        <table className="table-auto w-full">
                    <thead>
                        <tr className="w-full">
                            <td>UUID</td>
                            <td>Title</td>
                            <td>Trained</td>
                            <td>Created</td>
                            <td>Updated</td>
                            <td>Feature Columns</td>
                            <td>Target Columns</td>
                            <td>Training Algorithm</td>
                        </tr>
                    </thead>
                    {<tbody>
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

    const loadDataset = () => {
        setLoading(true);

        getListOfDataset()
            .then((data) => setDataset(data))
            .catch((err) => {
                setError(err)
            })
            .finally(() => setLoading(false))
    }
    
    const handleAddDataSet = () => {
        setShowForm(true)
    }

    useEffect(() => {
        loadDataset()
    }, [showForm])

    return (
        <div className="rounded-lg shadow-lg p-4 bg-white w-full">
            {showForm && <Modal onClose={() => setShowForm(false)}>
                <AddDatasetForm />
            </Modal>}
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold justify-self-center">Dataset List</h1>
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