import * as Yup from "yup"
import { Constant } from "./data"
import { createDataset } from "../../requests"
import { useFormik } from "formik"
import { Dispatch, SetStateAction, useState } from "react"

export type AddDatasetProps = {
    title: string,
    dataset: any
}

const schema = Yup.object({
    title: Yup.string().required("Dataset must have a title"),
    dataset: Yup.mixed()
        .required("Dataset is a required field")
})

export const AddDatasetForm = ({ showForm }: { showForm: Dispatch<SetStateAction<boolean>> }) => {
    const [file, setFile] = useState<File | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        const reader = new FileReader()
        const uploadedFile = e.target!.files![0];
        if (uploadedFile) {
            reader.onloadend = () => {
                setFile(uploadedFile);
                formik.setFieldValue('dataset', e.target.value);
            }
            reader.readAsDataURL(uploadedFile)
        }
    }

    const validateFile = () => {
        const invalid = file!.size > Constant.fileSize * 1024 * 1024
        invalid && formik.setFieldError('dataset', "File must be at most 4 MB in size")
        return !invalid
    }

    const formik = useFormik({
        initialValues: {
            title: "",
            dataset: undefined
        },
        onSubmit: (values, { setSubmitting }) => {
            setSubmitting(true)
            validateFile() && createDataset({ title: values.title, dataset: file! })
                .then((data) => {
                    showForm(false)
                })
                .catch(err => {
                    console.log(err)
                })
                .finally(() => setSubmitting(false))
        },
        validationSchema: schema
    })

    return (
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-y-10">
            {formik.isSubmitting ? <p>Submitting, please wait</p> : null}
            <div className="flex flex-col gap-y-6">
                <div className="flex flex-col gap-y-2">
                    <label className="text-xl font-bold block" htmlFor="title">Title Of Dataset</label>
                    <input id="title" className={`py-2 px-4 rounded outline-none ${formik.touched.title && formik.errors.title ? 'border-red-300 focus:border-red-300' : 'border-gray-500 focus:border-gray-600'} border bg-gray-700`} {...formik.getFieldProps('title')} />
                    {formik.touched.title && formik.errors.title ? (<p className="text-red-300 font-bold">{formik.errors.title}</p>) : null}
                </div>
                <div className="flex flex-col gap-y-2">
                    <label className="text-xl font-bold block" htmlFor="dataset">Dataset File</label>
                    <input
                        className={` pl-2 pr-4 block w-full cursor-pointer outline-none bg-gray-700 border border-gray-700 rounded ${formik.touched.dataset && formik.errors.dataset ? 'border-red-300 focus:border-red-300' : 'border-gray-500 focus:border-gray-600'}`}
                        id="dataset"
                        type="file"
                        accept="text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        {...formik.getFieldProps('dataset')}
                        onChange={(e) => handleFileChange(e)}
                    />
                    {formik.touched.dataset && formik.errors.dataset ? (<p className="text-red-300 font-bold">{formik.errors.dataset}</p>) : null}
                </div>
            </div>

            <input className="cursor-pointer outline-none border-none bg-blue-700 py-2 px-8 w-full hover:bg-blue-900 font-bold" type="submit" />

        </form>
    )
}