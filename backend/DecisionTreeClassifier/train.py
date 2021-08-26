# -*- coding: utf-8 -*-

import pickle, os
import pandas as pd
from typing import List, Dict
# from sklearn.externals import joblib
from sklearn.tree import DecisionTreeClassifier as DCF
from sklearn.model_selection import train_test_split
from sklearn import metrics

from .normalize import (
    column_mapping,
    map_columns,
    GP_VALUE,
    GRADE_VALUE,
    uppercase
)

print(os.listdir('.'))

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

TEST_SIZE = 0.5

RANDOM_STATE = 1

# file_data = pd.read_excel(DATA_FILE)

def read_file_data(dataset: str) -> pd.DataFrame:
    return pd.read_excel(dataset)


def produce_dataframe(file_data: pd.DataFrame, columns: List[str]=None) -> pd.DataFrame:
    data_frame = pd.DataFrame(file_data, columns=columns)
    return data_frame

def normalize_dataframe(feature_cols, target_col, data, grade_value=GRADE_VALUE, gp_value=GP_VALUE):
    data = produce_dataframe(data, [*feature_cols, target_col])
    data = map_columns(data, feature_cols, grade_value)
    data[target_col] = data[target_col].fillna('').map(uppercase).map(lambda x: x.strip())
    data = column_mapping(data, target_col, gp_value).fillna(0)
    return data

def split_dataset(features, target, test_size=TEST_SIZE, random_state=RANDOM_STATE) -> list:
    splitted_data = train_test_split(
        features,
        target,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE
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
    feature_col: List[str],
    target_col: str,
    grade_value: Dict[str, int]=GRADE_VALUE,
    gp_value: Dict[str, int]=GP_VALUE,
    test_size: float=TEST_SIZE,
    random_state: int=RANDOM_STATE
):
    excel_data = read_file_data(file_data)
    processed_data = normalize_dataframe(feature_col, target_col, excel_data, grade_value, gp_value)
    feature = processed_data[feature_col]
    target = processed_data[target_col]
    train_data = split_dataset(feature, target, test_size, random_state)
    trained = train(train_data)
    print(f"Accuracy: {metrics.accuracy_score(trained['target_prediction'], trained['target_test'])}")

    return trained
# main(DATA_FILE, FEATURE_COLUMNS[1:], TARGET_COLUMN[0])