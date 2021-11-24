export const arrayfyStrings = (column: string): Array<string> => {
    return column.split(',').map(col => col.trim())
}