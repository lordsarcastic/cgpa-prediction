import { FunctionComponent } from "react"

export type ErrorProps = {
    code?: number,
    message?: string
}
export const Error: FunctionComponent<ErrorProps> = ({ code, message }) => {
    return (
        <div className="absolute flex flex-col justify-center items-center text-indigo-700 h-screen w-full">
            <h1 className="text-4xl">Error {code || ''}</h1>
            <p>{message || 'Something went wrong'}</p>
        </div>
    )
}