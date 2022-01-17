import { createContext, Dispatch, FunctionComponent, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router"
import { useAxios } from "use-axios-client"
import { DetailAxiosContext } from "."
import Loader from "../../Loader"
import Modal from "../../Modal"
import { getUniqueValuesForColumn, predictOutcome } from "../../requests"
import { Tab } from "../../Tab"
import { PredictionModel } from "../../types"
import { arrayfyStrings } from "../../validators"

const colors = [
    "blue",
    "pink",
    "green",
    "indigo",
    "yellow",
    "red",
    "purple"
]
const Header = () => {
    return (
        <h1>Predict</h1>
    )
}
export type CourseSelectionProps = {
    course: string,
    values: string[]
}

export type CourseSelectionContextProps = {
    fields: Record<string, string>,
    setFields: Dispatch<SetStateAction<Record<string, string>>>,
    setField: (field: string, option: string) => void
}

const CourseSelectionContext = createContext({} as CourseSelectionContextProps)

const CourseSelection: FunctionComponent<CourseSelectionProps> = ({ course, values }) => {
    const { fields, setField } = useContext(CourseSelectionContext);
    const getColor = () => colors[Math.round(colors.length * Math.random())]
    return (
        <div className="flex flex-col md:grid md:grid-cols-5 gap-x-8 gap-y-4">
            <p className="col-span-1 font-bold text-2xl">{course}</p>
            <div className="col-span-4 gap-x-4 gap-y-4">
                {values.map((letter: string, index) => (
                    <button
                        key={index}
                        onClick={() => setField(course, letter)}
                        className={`${fields[course] === letter ? 'bg-black text-white' : `bg-${getColor() || "blue"}-400`} float-left mx-2 my-2 py-0.5 px-8 rounded-lg shadow-lg`}
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
    const { uuid } = useParams<{ uuid: string }>();
    const [fieldError, setFieldError] = useState<string>();
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [showModal, setShowModal] = useState(false)
    const [result, setResult] = useState<PredictionModel>()
    const [columns, setColumns] = useState<Record<string, Array<string>>>();

    const initialValues = useCallback(() => {
        const columns: Record<string, string> = {}

        arrayfyStrings(data?.feature_columns!).forEach((field: string) => {
            columns[field] = ''
        })
        return columns
    }, [data?.feature_columns])

    const [fields, setFields] = useState<Record<string, string>>(initialValues());

    const setField = useCallback((field: string, option: string) => {
        const toSet = {
            ...fields,
        }
        toSet[field] = option
        setFields(toSet)
    }, [fields])

    const values = useMemo(() => ({
        fields,
        setField,
        setFields
    }), [fields, setFields])

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
            console.log(fields);
            predictOutcome(uuid, fields)
                .then((res) => {
                    setResult(res)
                    setShowModal(true)
                    refetch()
                })
                .catch(error => console.log(error))
                .finally(() => setSubmitting(false))

        }
    }


    useEffect(() => {
        data && setFields(initialValues())
    }, [data, initialValues])

    useEffect(() => {
        data && getUniqueValuesForColumn(data.uuid)
            .then(data => {
                setColumns(data.columns)
            })
    }, [data])

    return (
        <>
            {data?.training_algorithm
                ? <CourseSelectionContext.Provider value={values}>
                    <div className="flex flex-col gap-y-8">
                        <p className="text-3xl font-bold">Predict grade</p>
                        <div className="flex flex-col gap-y-4">
                            {columns && <div className="flex flex-col gap-y-8">
                                {Object.keys(fields).map((field) => (
                                    <CourseSelection key={field} course={field} values={columns[field]} />
                                    ))}
                                </div>
                            }
                            {fieldError && <p className="text-red-300 font-bold text-xl">{fieldError}</p>}
                        </div>
                        <button className="bg-blue-500 hover:bg-blue-700 text-white text-xl mt-10 font-bold py-3 px-4 rounded-lg cursor-pointer" onClick={() => handleSubmit()}>Submit</button>
                    </div>
                </CourseSelectionContext.Provider>
                : <p>You've not trained this model and cannot make a prediction. Head to the Train tab and train the algorithm.</p>
            }
            {showModal && <Modal onClose={() => setShowModal(false)}>
                <h1 className="text-2xl font-bold text-green-300 mb-6">Prediction complete!</h1>
                <p>Student is predicted to graduate with a {result?.prediction_result}</p>
            </Modal>}
            <Loader {...submitting} />
        </>
    )
}

export const PredictTab: Tab = {
    Header: Header,
    Component: Main,
    trigger: 'pr'
}