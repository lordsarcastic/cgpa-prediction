export const transformFeatureColumnsToArray = (featureColumns: string): Array<string> => {
    return featureColumns.replace(new RegExp("[],\"'"), ' ').split(' ')
}

export const mask = (value: any, fallback: '-' | any) => {
    return value || fallback
}