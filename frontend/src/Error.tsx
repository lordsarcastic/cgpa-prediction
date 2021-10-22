import { FunctionComponent } from "react"

export const Error: FunctionComponent<{code: number | undefined}> = ({ code }) => {
    return (
        <div className="flex flex-col justify-center items-center text-indigo-700 h-screen w-full">
            <h1 className="text-4xl">Error {code || ''}</h1>
            <p>Something went wrong</p>
        </div>
    )
}