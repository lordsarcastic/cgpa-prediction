import { useFormik } from "formik";
import { useContext, useEffect, useMemo, useState } from "react"
import { FaArrowRight, FaTimes } from "react-icons/fa";
import * as Yup from "yup";
import { DetailAxiosContext } from "..";
import { ErrorContext } from "../../../App"
import Loader from "../../../Loader"
import Modal from "../../../Modal"
import { setColumns } from "../../../requests";
import { Tab } from "../../../Tab";
import { Table, TableContext } from "../../TableSelection"

const Header = () => {
    return (
        <h1>Manual column selection</h1>
    )
}

const schema = Yup.object({
    feature_columns: Yup.string()
        .required("You must set at least one course column"),
    target_column: Yup.string()
        .required("You must set a grade column")
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
        error && setError({ message: error?.message })
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
                {data && <div className="flex flex-col gap-y-10">
                    <div className="flex flex-col gap-y-4">
                        <h2 className="text-2xl font-bold">Click on a course title to select course column <FaArrowRight className="text-white inline text-xl" /></h2>
                        <div className="flex flex-col gap-y-4 overflow-x-auto">
                            <Table data={data.dataset} />
                            {formik.touched.feature_columns && formik.errors.feature_columns ? <p className="text-red-300 font-bold text-xl">{formik.errors.feature_columns}  <FaTimes className="inline" /></p> : null}
                            <input id="feature_columns" className="hidden" {...formik.getFieldProps('feature_columns')} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-y-4">
                        <h2 className="text-2xl font-bold">Select grade column</h2>
                        <div className="flex flex-col gap-y-4">
                            <div className="container">
                                {[...restColumns].map((col) => (
                                    <span
                                        key={col}
                                        className={`py-1 px-3 ${col === targetColumn ? 'bg-green-500' : 'bg-purple-500'} float-left cursor-pointer mr-4 my-4 rounded`}
                                        onClick={() => handleSetTargetColumn(col)}
                                    >
                                        {col}
                                    </span>
                                ))}
                            </div>
                            <input id="target_column" className="hidden" {...formik.getFieldProps('target_columns')} />
                            {formik.touched.target_column && formik.errors.target_column ? <p className="text-red-300 font-bold text-xl">{formik.errors.target_column} <FaTimes className="inline" /></p> : null}
                        </div>
                    </div>
                    {formik.isSubmitting ? <p>Submitting, please wait</p> : null}
                    <input type="submit" value="Set columns" className="bg-blue-500 hover:bg-blue-700 text-white text-xl mt-10 font-bold py-3 px-4 rounded-lg cursor-pointer" />
                </div>}

            </TableContext.Provider>
            {success && <Modal onClose={() => setSuccess(false)}>
                <h1 className="text-2xl font-bold text-green-300 mb-6 px-6">Prediction complete!</h1>
                <p className="px-6">Columns have been set, you can now train the model</p>
            </Modal>}
        </form>
    )
}

export const ManualTab: Tab = {
    Header: Header,
    Component: Main,
    trigger: 'ms'
}