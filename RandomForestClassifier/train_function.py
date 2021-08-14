# -*- coding: utf-8 -*-

import pandas as pd
from sklearn.tree import DecisionTreeClassifier as DCF
from sklearn.model_selection import train_test_split
from sklearn import metrics

from normalize import (
    column_mapping,
    map_columns,
    GP_VALUE,
    GRADE_VALUE,
    uppercase
)


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

TEST_SIZE = 0.3

RANDOM_STATE = 1

file_data = pd.read_excel(DATA_FILE)

def produce_dataframe(file_data):
    data_frame = pd.DataFrame(file_data, columns=COLUMNS)
    return data_frame

def normalize_dataframe():
    data = file_data
    data = produce_dataframe(data)
    data = map_columns(data, FEATURE_COLUMNS[1:], GRADE_VALUE)
    data[TARGET_COLUMN[0]] = data[TARGET_COLUMN[0]].fillna('').map(uppercase).map(lambda x: x.strip())
    data = column_mapping(data, TARGET_COLUMN[0], GP_VALUE).fillna(0)

    return data

processed_data = normalize_dataframe()

X = processed_data[FEATURE_COLUMNS]
y = processed_data[TARGET_COLUMN[0]]

def split_dataset(features, target, split_args=dict()) -> list:
    splitted_data = train_test_split(
        features,
        target,
        test_size=split_args.get('TEST_SIZE', TEST_SIZE),
        random_state=split_args.get('RANDOM_STATE', RANDOM_STATE)
    )

    return splitted_data

def train():
    train_data = split_dataset(
        X, y
    )
    feature_train, feature_test, target_train, target_test = train_data
    clf = DCF()
    clf = clf.fit(feature_train, target_train)
    target_prediction = clf.predict(feature_test)
    results = {
        'target_prediction': target_prediction,
        'target_test': target_test,
        'clf': clf
    }
    return results

if __name__ == '__main__':
    trained = train()
    print(f"Accuracy: {metrics.accuracy_score(trained['target_prediction'], trained['target_test'])}")