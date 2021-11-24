import { useFormik } from "formik"
import { createContext, Dispatch, FunctionComponent, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router"
import * as Yup from "yup"
import { DetailAxiosContext } from "."
import Loader from "../../Loader"
import Modal, { FooterModal } from "../../Modal"
import { predictOutcome } from "../../requests"
import { Tab } from "../../Tab"
import { PredictionModel } from "../../types"
import { arrayfyStrings } from "../../validators"

const Header = () => {
    return (
        <h1>Predict</h1>
    )
}
export type CourseSelectionProps = {
    course: string,
    color: string
}

export type CourseSelectionContextProps = {
    fields: Record<string, string>,
    setFields: Dispatch<SetStateAction<Record<string, string>>>,
    setField: (field: string, option: string) => void
}

const CourseSelectionContext = createContext({} as CourseSelectionContextProps)

const CourseSelection: FunctionComponent<CourseSelectionProps> = ({ course, color }) => {
    const { fields, setField } = useContext(CourseSelectionContext);

    return (
        <div className="grid grid-cols-5 gap-x-8">
            <p className="col-span-1">{course}</p>
            <div className="col-span-4 flex gap-x-4">
                {["A", "B", "C", "D", "E", "F"].map((letter: string, index) => (
                    <button
                        key={index}
                        onClick={() => setField(course, letter)}
                        className={`${fields[course] === letter ? 'bg-black text-white' : `bg-${color}-${index + 1}00`} py-0.5 px-8 rounded-lg shadow-lg`}
                    >
                        {letter}
                    </button>
                ))}
            </div>
        </div>
    )
}

const Main = () => {
    const { data, refetch } = useContext(DetailAxiosContext);
    const { uuid } = useParams<{uuid: string}>();
    const [fieldError, setFieldError] = useState<string>();
    const [success, setSuccess] = useState<boolean>(false);
    const [ submitting, setSubmitting] = useState<boolean>(false)
    const [showModal, setShowModal] = useState(false)
    const [result, setResult] = useState<PredictionModel>()

    const initialValues = () => {
        const columns: Record<string, string> = {}

        arrayfyStrings(data?.feature_columns!).map((field: string) => {
            columns[field] = ''
        })
        return columns
    }

    const [fields, setFields] = useState<Record<string, string>>(initialValues());

    const setField = (field: string, option: string) => {
        const toSet = {
            ...fields,
        }
        toSet[field] = option
        setFields(toSet)
    }

    const values = useMemo(() => ({
        fields,
        setField,
        setFields
    }), [fields, setFields, setFields])

    const handleSubmit = () => {
        let issue = false
        for (const value of Object.values(fields)) {
            if (!value) {
                setFieldError("All courses must have a grade. Select 'F' if grade is not available")
                issue = true
                break
            }
        }
        if (!issue) {
            setFieldError("")
            predictOutcome(uuid, fields)
                .then((res) => {
                    setSuccess(true)
                    setResult(res)
                    setShowModal(true)
                    setTimeout(() => setSuccess(false), 5000)
                    refetch()
                })
                .catch(error => console.log(error))
                .finally(() => setSubmitting(false))

        }
        console.log(fields)
    }


    useEffect(() => {
        data && setFields(initialValues())
    }, [data])

    return (
        <CourseSelectionContext.Provider value={values}>
            {showModal && <Modal onClose={() => setShowModal(false)}>
                <p>Student is predicted to graduate with a {result?.prediction_result}</p>
            </Modal>}
            <p>Predict the model here</p>
            <div className="flex flex-col gap-y-8">
                {Object.keys(fields).map((field) => (
                    <CourseSelection key={field} course={field} color="blue" />
                ))}
            </div>
            {fieldError && <p className="text-red-500">{fieldError}</p>}
            <button className="mt-10 py-0.5 px-8 bg-pink-500 rounded-lg shadow-lg" onClick={() => handleSubmit()}>Submit</button>
            <Loader {...submitting} />
            {success && <FooterModal message="Columns have been set, you can now train the model" />}
        </CourseSelectionContext.Provider>
    )
}

export const PredictTab: Tab = {
    Header: Header,
    Component: Main,
    trigger: 'pr'
}