import * as Yup from "yup"
import { Constant } from "./data"
import { createDataset } from "../../requests"
import { useFormik } from "formik"
import { useState } from "react"

export type AddDatasetProps = {
    title: string,
    dataset: any
}

const schema = Yup.object({
    title: Yup.string().required("Dataset must have a title"),
    dataset: Yup.mixed()
        .required()
})

export const AddDatasetForm = () => {
    const [file, setFile] = useState<File | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        const reader = new FileReader()
        const uploadedFile = e.target!.files![0];
        console.log({"uploadedfile": uploadedFile})
        if (uploadedFile) {
            reader.onloadend = () => {
                setFile(uploadedFile);
                formik.setFieldValue('dataset', e.target.value);
            }
            reader.readAsDataURL(uploadedFile)
        }
    }

    const validateFile = () => {
        const invalid = file!.size  > Constant.fileSize * 1024 * 1024 
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
            validateFile() && createDataset({title: values.title, dataset:file!})
                .then((data) => {
                    console.log(data)
                })
                .catch(err => {
                    console.log(err)
                })
                .finally(() => setSubmitting(false))
        },
        validationSchema: schema
    })

    return (
        <form onSubmit={formik.handleSubmit}>
            {formik.isSubmitting ? <p>Submitting, please wait</p> : null}
            <div className="flex flex-col gap-y-6">
                <input id="title" className="py-2 px-4 rounded-lg outline-none border focus:border-purple-400 bg-purple-200" {...formik.getFieldProps('title')} />
                {formik.touched.title && formik.errors.title ? (<p className="text-red-500">{formik.errors.title}</p>) : null}

                <input
                    id="dataset"
                    type="file"
                    accept="text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    {...formik.getFieldProps('dataset')}
                    onChange={(e) => handleFileChange(e)}
                 />
                {formik.touched.dataset && formik.errors.dataset ? (<p className="text-red-500">{formik.errors.dataset}</p>) : null}
            </div>

            <input type="submit" />

        </form>
    )
}