from typing import Dict, List
from pandas.core.frame import DataFrame

GRADE_VALUE = {
    'A': 6,
    'B': 5,
    'C': 4,
    'D': 3,
    'E': 2,
    'F': 1
}

GP_VALUE = {
    'PASS': 1,
    'THIRD CLASS': 2,
    'SECOND CLASS LOWER': 3,
    'SECOND CLASS UPPER': 4,
    'FIRST CLASS': 5
}

uppercase = lambda x: x.upper() or 1



def column_mapping(data: DataFrame, column: str, value_mappings: Dict[str, int]):
    data[column] = data[column].map(value_mappings)
    return data


def map_columns(data: DataFrame, columns: List[str], value_mappings: Dict[str, int]):
    for col in columns:
        data = column_mapping(data, col, value_mappings)
    return data
