import { useFormik } from "formik";
import { createContext, Dispatch, FunctionComponent, SetStateAction, useContext, useEffect, useMemo, useRef, useState } from "react"
import { FaArrowRight } from "react-icons/fa";
import { useParams } from "react-router";
import * as Yup from "yup";
import { DetailAxiosContext } from "..";
import { ErrorContext } from "../../../App";
import Loader from "../../../Loader";
import Modal from "../../../Modal";
import { performFeatureSelection } from "../../../requests";
import { Tab } from "../../../Tab";
import { FeatureSelectionAlgorithmStrings } from "../../../types";

const Header = () => {
    return (
        <h1>Feature selection</h1>
    )
}
export type HighLightedColumnProps = {
    targetColumn: string | undefined,
    setTargetColumn: Dispatch<SetStateAction<string | undefined>>
}

export const TableContext = createContext({} as HighLightedColumnProps)


export const Table: FunctionComponent<{ data: { [key: string]: { [key: string]: string } } }> = ({ data }) => {
    const { targetColumn, setTargetColumn } = useContext(TableContext)

    return (
        <table className="table border-separate space-y-6 text-sm w-full text-white">
            <thead className="bg-gray-700 font-bold text-xl">
                <tr>
                    {Object.keys(data).map((name, index) => (
                        <td key={name} onClick={() => setTargetColumn(name)} className={`p-3 cursor-pointer ${targetColumn === name && 'bg-blue-700 '} ${index !== 1 && 'text-left'}`}>{name}</td>
                    ))}
                </tr>
            </thead>
            <tbody>
                {["0", "1", "2", "3", "4"].map((index) => (
                    <tr className="w-full bg-gray-700" key={index}>
                        {Object.keys(data).map((title) => (
                            <td
                                key={title}
                                className={`${targetColumn === title && 'bg-blue-400'} p-3 text-left`}
                            >
                                {data[title][index].toString().trim()}
                            </td>

                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

const schema = Yup.object({
    targetColumn: Yup.string().required("Target column is required"),
    algorithm: Yup.string().required()
})

export const Automatic: FunctionComponent = () => {
    const { setError } = useContext(ErrorContext)
    const { uuid } = useParams<{ uuid: string }>();
    const [targetColumn, setTargetColumn] = useState<string | undefined>(undefined)
    const [success, setSuccess] = useState<boolean>(false);
    const ref = useRef<HTMLButtonElement>(null)
    const { data, error, loading, refetch } = useContext(DetailAxiosContext)
    const formik = useFormik({
        initialValues: {
            targetColumn: "",
            algorithm: "" as FeatureSelectionAlgorithmStrings
        },
        onSubmit: ({ targetColumn, algorithm }, { setSubmitting }) => {
            setSubmitting(true)
            performFeatureSelection(uuid, algorithm, targetColumn)
                .then(() => {
                    setSuccess(true)
                    setTimeout(() => setSuccess(false), 5000)
                    refetch()
                })
                .catch(error => console.log(error))
                .finally(() => setSubmitting(false))
        },
        validationSchema: schema,
        validateOnMount: false,
        validateOnChange: false
    })

    const handleSubmission = (algorithm: FeatureSelectionAlgorithmStrings) => {
        formik.setFieldValue('algorithm', algorithm)
        ref.current && ref.current.click()
    }

    useEffect(() => {
        formik.setFieldValue('targetColumn', targetColumn)
    }, [targetColumn])

    const value = useMemo(() => ({
        setTargetColumn,
        targetColumn
    }), [setTargetColumn, targetColumn])

    useEffect(() => {
        error && setError({ message: error?.message })
    }, [error, setError])

    return (
        <>
            <Loader {...loading} />
            {data && <TableContext.Provider value={value}>
                <form onSubmit={formik.handleSubmit}>
                    <div className="flex flex-col gap-y-4">
                        <h2 className="text-2xl font-bold">Click on a course title to select a grade column <FaArrowRight className="text-white inline text-xl" /></h2>
                        <div className="flex flex-col gap-y-4 overflow-x-auto">
                            <input id="targetColumn" className="hidden" {...formik.getFieldProps('targetColumn')} />
                            <Table data={data.dataset} />
                            {formik.errors.targetColumn ? <p className="text-red-300 font-bold text-xl">{formik.errors.targetColumn}</p> : null}
                        </div>
                    </div>
                    <div className="flex gap-x-8 w-full">
                        <button
                            onClick={() => handleSubmission('rfe')}
                            className="bg-green-400 hover:bg-green-600 w-full text-white text-xl mt-10 font-bold py-3 px-4 rounded-lg cursor-pointer"
                        >
                            Rercursive Feature Elimination
                        </button>
                        <button
                            onClick={() => handleSubmission('pearson')}
                            className="bg-yellow-400 hover:bg-yellow-600 w-full text-white text-xl mt-10 font-bold py-3 px-4 rounded-lg cursor-pointer"
                        >
                            Pearson's correlation
                        </button>
                        {formik.errors.algorithm ? <p className="text-red-300 font-bold text-xl">{formik.errors.algorithm}</p> : null}
                    </div>
                    <input id="algorithm" className="hidden" {...formik.getFieldProps('algorithm')} />
                    <button type="submit" className="hidden" ref={ref}>Submit</button>
                </form>
                {success && <Modal onClose={() => setSuccess(false)}>
                    <h1 className="text-2xl font-bold text-green-300 mb-6 px-6">Prediction complete!</h1>
                    <p className="px-6">Columns have been set, you can now train the model</p>
                </Modal>}
            </TableContext.Provider>}
        </>
    )
}

export const AutomaticTab: Tab = {
    Header: Header,
    Component: Automatic,
    trigger: 'ac'
}