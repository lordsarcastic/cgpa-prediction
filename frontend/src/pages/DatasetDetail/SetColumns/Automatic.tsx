import { useFormik } from "formik";
import { createContext, Dispatch, FunctionComponent, SetStateAction, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "react-router";
import * as Yup from "yup";
import { DetailAxiosContext } from "..";
import { ErrorContext } from "../../../App";
import Loader from "../../../Loader";
import { FooterModal } from "../../../Modal";
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

export type CellProps = {
    content: string | number,
}

const Cell: FunctionComponent<CellProps> = ({ content }) => {
    
    return (
        <span>{content}</span>
    )
}

export type ColumnProps = {
    name: string
    data: object,
}

const Column: FunctionComponent<ColumnProps> = ({ name, data }) => {
    const { targetColumn, setTargetColumn } = useContext(TableContext)

    return (
        <div>
            <p onClick={() => setTargetColumn(name)} className="font-bold text-md">{name}</p>
            <div className={`${name === targetColumn && 'bg-blue-400 opacity-25'} grid grid-rows-5`}>
                {Object.entries(data).map(([key, value]) => (
                    <Cell content={value} key={key} />
                ))}
            </div>
        </div>
    )
}

export const Table: FunctionComponent<{data: object}> = ({ data }) => {
    return (
        <div className="flex gap-x-4 overflow-auto">
            {Object.entries(data).map(([name, data]) => (
                <Column name={name} data={data} key={name} />
            ))}
        </div>
    )
}

const schema = Yup.object({
    targetColumn: Yup.string().required("Target column is required"),
    algorithm: Yup.string().required()
})

export const Automatic: FunctionComponent = () => {
    const { setError } = useContext(ErrorContext)
    const { uuid } = useParams<{uuid: string}>();
    const [targetColumn, setTargetColumn] = useState<string | undefined>(undefined)
    const [success, setSuccess] = useState<boolean>(false);
    const ref = useRef<HTMLButtonElement>(null)
    const { data, error, loading, refetch } = useContext(DetailAxiosContext)
    const formik = useFormik({
        initialValues: {
            targetColumn: "",
            algorithm: "" as FeatureSelectionAlgorithmStrings
        },
        onSubmit: ({targetColumn, algorithm}, { setSubmitting }) => {
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
    })

    const handleSubmission = (algorithm: FeatureSelectionAlgorithmStrings) => {
        formik.setFieldValue('algorithm', algorithm)
        ref.current &&  ref.current.click()
    }

    useEffect(() => {
        formik.setFieldValue('targetColumn', targetColumn)
    }, [targetColumn])

    const value = useMemo(() => ({
        setTargetColumn,
        targetColumn
    }), [setTargetColumn, targetColumn])

    useEffect(() => {
        error && setError({message: error?.message})
    }, [error, setError])

    return (
        <>
        <Loader {...loading} />
        {data && <TableContext.Provider value={value}>
            <form onSubmit={formik.handleSubmit}>
                <input id="targetColumn" className="hidden" {...formik.getFieldProps('targetColumn')} />
                <Table data={data.dataset} />
                {formik.touched.targetColumn && formik.errors.targetColumn ? <p className="text-red-500">{formik.errors.targetColumn}</p> : null}
                <div className="flex gap-x-8">
                {formik.touched.algorithm && formik.errors.algorithm ? <p className="text-red-500">{formik.errors.algorithm}</p> : null}
                    <button onClick={() => handleSubmission('rfe')} className="bg-green-400 py-0.5 px-4 rounded-sm">Rercursive Feature Elimination</button>
                    <button onClick={() => handleSubmission('pearson')} className="bg-yellow-400 py-0.5 px-4 rounded-sm">Pearson's correlation</button>
                </div>
                <input id="algorithm" className="hidden" {...formik.getFieldProps('algorithm')} />
                <button className="hidden" ref={ref}>Submit</button>
            </form>
            {success && <FooterModal message="Columns have been set, you can now train the model" />}
        </TableContext.Provider>}
        </>
    )
}

export const AutomaticTab: Tab = {
    Header: Header,
    Component: Automatic,
    trigger: 'ac'
}