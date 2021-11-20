import { FunctionComponent, useMemo, useState, useContext, useEffect, Dispatch, SetStateAction, createContext } from "react";


export enum CURRENT_SELECTION {
    manual = 'MANUAL',
    auto = 'FEATURE_SELECTION'
}

export type HighLightedColumnProps = {
    featureColumns: Set<string>,
    setFeatureColumns: Dispatch<SetStateAction<Set<string>>>
    targetColumn: string | undefined,
    setTargetColumn: Dispatch<SetStateAction<string | undefined>>
    currentSelection: CURRENT_SELECTION
    setCurrentSelection: Dispatch<SetStateAction<CURRENT_SELECTION>>
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
    const { featureColumns, setFeatureColumns } = useContext(TableContext)
    const [selected, setSelected] = useState<boolean>(false);

    useEffect(() => {
        const columns = new Set([...featureColumns])
        selected
            ? columns.add(name)
            : columns.has(name) && columns.delete(name)

        setFeatureColumns(new Set([...columns]))
    }, [selected])

    return (
        <div>
            <p onClick={() => setSelected(!selected)} className="font-bold text-md">{name}</p>
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

const SetColumnsManually: FunctionComponent<{data: object}> = ({ data }) => {
    const [featureColumns, setFeatureColumns] = useState<Set<string>>(new Set());
    const [targetColumn, setTargetColumn] = useState<string | undefined>(undefined);
    const [currentSelection, setCurrentSelection] = useState<CURRENT_SELECTION>(CURRENT_SELECTION.manual);

    const value = useMemo(() => ({
        featureColumns,
        setFeatureColumns,
        targetColumn,
        setTargetColumn,
        currentSelection,
        setCurrentSelection,
    }), [featureColumns, targetColumn, currentSelection]);

    return (
        <TableContext.Provider value={value}>
            <Table data={data} />
        </TableContext.Provider>
    )
}