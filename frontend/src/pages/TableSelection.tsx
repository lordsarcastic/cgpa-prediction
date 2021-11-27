import { createContext, Dispatch, FunctionComponent, SetStateAction, useContext, useEffect } from "react"

export type HighLightedColumnProps = {
    featureColumns: Set<string>,
    setFeatureColumns: Dispatch<SetStateAction<Set<string>>>
    targetColumn: string | undefined,
    setTargetColumn: Dispatch<SetStateAction<string | undefined>>
}

export const TableContext = createContext({} as HighLightedColumnProps)

export const Table: FunctionComponent<{data: { [key: string]: {[key: string]: string} }}> = ({ data }) => {
    const { featureColumns, setFeatureColumns, targetColumn } = useContext(TableContext)

    const handleSetSelected = (name: string) => {
        if (!(name === targetColumn)) {
            const columns = new Set([...featureColumns])
            columns.has(name)
                ? columns.delete(name)
                : columns.add(name)
            
            setFeatureColumns(new Set([...columns]))
        }
    }

    return (
        <table className="table border-separate space-y-6 text-sm w-full text-white">
            <thead className="bg-gray-700 font-bold text-xl">
                <tr>
                    {Object.keys(data).map((name, index) => (
                        <td key={name} onClick={() => handleSetSelected(name)} className={`p-3 cursor-pointer ${featureColumns.has(name) && 'bg-blue-700 '} ${index !== 1 && 'text-left'}`}>{name}</td>
                    ))}
                </tr>
            </thead>
            <tbody>
                {["0", "1", "2", "3", "4"].map((index) => (
                    <tr key={index} className="w-full bg-gray-700">
                        {Object.keys(data).map((title) => (
                            <td
                                key={title}
                                className={`${featureColumns.has(title) && 'bg-blue-400'} p-3 text-left`}
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