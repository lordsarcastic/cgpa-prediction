import { FunctionComponent, useEffect, useState } from 'react'
import { Error } from '../../Error';
import Loader from '../../Loader';
import { getListOfDataset } from '../../requests';
import { ListTrainingModel, Page, TrainingAlgorithm, TrainingAlgorithmColor } from '../../types'

const ListingItem: FunctionComponent<ListTrainingModel> = ({uuid, title, trained_model, created, last_updated, feature_columns, target_column, training_algorithm}) => {
    return(
        <tr>
            <td>{uuid}</td>
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

export const Listing = () => {
    const [dataset, setDataset] = useState<ListTrainingModel[]>([]);
    const [error, setError] = useState<any>(undefined)
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setLoading(true);

        getListOfDataset()
            .then((data) => setDataset(data))
            .catch(err => console.log(err))
            // .catch((err) => {
            //     setError(err)
            //     console.log(err)
            // })
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="rounded-lg shadow-lg p-4 bg-white">
            <h1 className="text-4xl text-indigo-700 text-center">
                Dataset listing
            </h1>
            {error
                ? <Error code={error.status} />
                : <table className="table-auto">
                    <thead>
                        <tr>
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
                    {!loading && <tbody>
                        {dataset.map(dataset => (
                            <ListingItem key={dataset.uuid} {...dataset} />
                        ))}
                    </tbody>}
            </table>
            }
            <>{loading && <Loader />}</>
        </div>
    )
}

export const ListingPage: Page = {
    Component: Listing,
    route: '/',
}