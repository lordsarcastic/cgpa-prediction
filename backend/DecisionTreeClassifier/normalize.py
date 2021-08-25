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

uppercase = lambda x: x.upper()

def column_mapping(data, column, value_mappings):
    data[column] = data[column].map(value_mappings)
    return data


def map_columns(data, columns, value_mappings):
    for col in columns:
        data = column_mapping(data, col, value_mappings)
    return data
