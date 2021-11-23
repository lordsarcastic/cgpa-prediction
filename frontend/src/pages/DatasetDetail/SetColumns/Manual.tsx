import { useFormik } from "formik";
import { useContext, useEffect, useMemo, useState } from "react"
import * as Yup from "yup";
import { DetailAxiosContext } from "..";
import { ErrorContext } from "../../../App"
import Loader from "../../../Loader"
import { FooterModal } from "../../../Modal"
import { setColumns } from "../../../requests";
import { Tab } from "../../../Tab";
import { Table, TableContext } from "../../TableSelection"

const Header = () => {
    return (
        <h1>Set feature columns</h1>
    )
}

const schema = Yup.object({
    feature_columns: Yup.string()
        .required("You must set more than one feature columns"),
    target_column: Yup.string()
        .required("You must set a target column")
})

const Main = () => {
    const { setError } = useContext(ErrorContext)
    const [featureColumns, setFeatureColumns] = useState<Set<string>>(new Set());
    const [restColumns, setRestColumns] = useState<Set<string>>(new Set());
    const [targetColumn, setTargetColumn] = useState<string | undefined>();
    const [success, setSuccess] = useState<boolean>(false);

    const formik = useFormik({
        initialValues: {
            feature_columns: "",
            target_column: "",
        },
        onSubmit: (values, { setSubmitting }) => {
            setSubmitting(true)
            data && setColumns(data.uuid, values.feature_columns, values.target_column)
            .then(() => {
                setSuccess(true)
                setTimeout(() => setSuccess(false), 5000)
                refetch()
            })
            .catch(error => console.log(error))
            .finally(() => setSubmitting(false))
        },
        validationSchema: schema
    })


    const { data, error, loading, refetch } = useContext(DetailAxiosContext)

    const handleSetTargetColumn = (col: string) => {
        setTargetColumn(col)
        formik.setFieldValue("target_column", col)
    }

    useEffect(() => {
        if (data) {
            const rest = Object.keys(data.dataset).filter((col) => !featureColumns.has(col))
            setRestColumns(new Set([...rest]))
        }
        formik.setFieldValue("feature_columns", [...featureColumns].join(","))
    }, [data, featureColumns])

    useEffect(() => {
        error && setError({message: error?.message})
    }, [error, setError])

    const value = useMemo(() => ({
        featureColumns,
        setTargetColumn,
        targetColumn,
        setFeatureColumns
    }), [featureColumns, setFeatureColumns, targetColumn, setTargetColumn])

    return (
        <form onSubmit={formik.handleSubmit}>
            <TableContext.Provider value={value}>
                <Loader {...loading} />
                {data && <>
                    <p>Select feature columns by clicking on headers or allow algorithm to select feature and target column for you</p>
                    
                    
                    <Table data={data.dataset} />
                    <input id="feature_columns" className="hidden" {...formik.getFieldProps('feature_columns')} />
                    {formik.touched.feature_columns && formik.errors.feature_columns ? <p className="text-red-500">{formik.errors.feature_columns}</p> : null}
                    
                    <h2>Select target column</h2>
                    {[...restColumns].map((col) => (
                        <span
                            key={col}
                            className={`py-0.5 px-3 ${col === targetColumn ? 'bg-green-500': 'bg-purple-500'}`}
                            onClick={() => handleSetTargetColumn(col)}
                        >{col}</span>
                    ))}
                    <input id="target_column" className="hidden" {...formik.getFieldProps('target_columns')} />
                    {formik.touched.target_column && formik.errors.target_column ? <p className="text-red-500">{formik.errors.target_column}</p> : null}
                    {formik.isSubmitting ? <p>Submitting, please wait</p> : null}
                    <input type="submit" value="Set columns" className="bg-green-400 py-0.5 px-4 rounded-sm" />
                </>}

            </TableContext.Provider>
            {success && <FooterModal message="Columns have been set, you can now train the model" />}
        </form>
    )
}

export const ManualTab: Tab = {
    Header: Header,
    Component: Main,
    trigger: 'ms'
}