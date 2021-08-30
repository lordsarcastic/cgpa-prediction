# -*- coding: utf-8 -*-

import pickle, os
import pandas as pd
from typing import List, Dict
from pandas.core.frame import DataFrame
# from sklearn.externals import joblib
from sklearn.tree import DecisionTreeClassifier as DCF
from sklearn.model_selection import train_test_split
from sklearn import metrics

print(os.listdir('.'))

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

FEATURE_COLUMNS = [
    'MATNO',
    'MTH101',
    'GST101',
    'MTH103',
    'STA101',
    'CSC102',
    'MTH102',
    'PHY101',
    'PHY103'
]

TARGET_COLUMN = [
    'FGRADE'
]

COLUMNS = [
    *FEATURE_COLUMNS,
    *TARGET_COLUMN
]

DATA_FILE = '../results.xlsx'

TEST_SIZE = 0.8

RANDOM_STATE = 1

ALLOWED_EXTENSIONS = {
    'xlsx': pd.read_excel,
    'csv': pd.read_csv
}

def transform_col(value: str, mappings: Dict[str, int], default: int) -> int:
    return mappings.get(value.upper(), default)

def read_file_data(dataset: str, extension: str) -> pd.DataFrame:
    if extension not in ALLOWED_EXTENSIONS.keys():
        raise ValueError(f'Expected value of type {ALLOWED_EXTENSIONS}, found {extension}')
    
    loaded_dataset = ALLOWED_EXTENSIONS[extension](dataset)

    return loaded_dataset


def produce_dataframe(file_data: pd.DataFrame, columns: List[str]=None) -> pd.DataFrame:
    data_frame = pd.DataFrame(file_data, columns=columns)

    if not data_frame:
        raise ValueError(f"Column(s) '{columns}' not found in dataframe")
    return data_frame

def normalize_dataframe(feature_cols: List[str], target_col: str, data: DataFrame, grade_value: Dict[str, int]=GRADE_VALUE, gp_value: Dict[str, int]=GP_VALUE):
    data = produce_dataframe(
        data,
        [*feature_cols, target_col]
    ).fillna('').applymap(lambda value: value.strip())

    data[target_col] = data[target_col].apply(lambda cell: transform_col(cell, gp_value, 1))
    for feature in feature_cols:
        data[feature] = data[feature].apply(lambda cell: transform_col(cell, grade_value, 1))
    return data


def split_dataset(features: List[str], target: str, test_size=TEST_SIZE, random_state=RANDOM_STATE) -> list:
    splitted_data = train_test_split(
        features,
        target,
        test_size=test_size,
        random_state=random_state
    )
    
    return splitted_data

def train(splitted_dataset):
    feature_train, feature_test, target_train, target_test = splitted_dataset
    clf = DCF(criterion="entropy", max_depth=3)
    clf.fit(feature_train, target_train)
    target_prediction = clf.predict(feature_test)
    results = {
        'target_prediction': target_prediction,
        'target_test': target_test,
        'clf': clf
    }
    return results

# def pickle_trained_model(model, file_name):
#     joblib.dump(model, file_name)

# def load_trained_model(file_name):
#     model = joblib.load(file_name)
#     return model

# pickle_trained_model(trained['clf'], 'decision_tree.joblib')



def main(
    file_data: str,
    file_data_extension: str,
    feature_col: List[str],
    target_col: str,
    grade_value: Dict[str, int]=GRADE_VALUE,
    gp_value: Dict[str, int]=GP_VALUE,
    test_size: float=TEST_SIZE,
    random_state: int=RANDOM_STATE
):
    excel_data = read_file_data(file_data, file_data_extension)
    processed_data = normalize_dataframe(feature_col, target_col, excel_data, grade_value, gp_value)
    feature = processed_data[feature_col]
    target = processed_data[target_col]
    train_data = split_dataset(feature, target, test_size, random_state)
    trained = train(train_data)
    print(f"Accuracy: {metrics.accuracy_score(trained['target_prediction'], trained['target_test'])}")

    return trained
# main(DATA_FILE, 'xlsx', ['asdf'], TARGET_COLUMN[0])
