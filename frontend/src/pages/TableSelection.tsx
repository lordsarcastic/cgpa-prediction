import { createContext, Dispatch, FunctionComponent, SetStateAction, useContext, useEffect, useState } from "react"

export type HighLightedColumnProps = {
    featureColumns: Set<string>,
    setFeatureColumns: Dispatch<SetStateAction<Set<string>>>
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
    const { featureColumns, setFeatureColumns, targetColumn } = useContext(TableContext)
    const [selected, setSelected] = useState<boolean>(false);

    const handleSetSelected = () => {
        !(name === targetColumn) && setSelected(!selected)
    }

    useEffect(() => {
        if (!(name === targetColumn)) {
            const columns = new Set([...featureColumns])
            selected
                ? columns.add(name)
                : columns.has(name) && columns.delete(name)
            
            setFeatureColumns(new Set([...columns]))
        }
    }, [selected])

    return (
        <div>
            <p onClick={() => handleSetSelected()} className="font-bold text-md">{name}</p>
            <div className={`${selected && 'bg-blue-400 opacity-25'} grid grid-rows-5`}>
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