from typing import List, Dict

import numpy as np
import pandas as pd
from sklearn.feature_selection import RFE
from sklearn.linear_model import LinearRegression

from backend.Learning.utils import GP_VALUE, GRADE_VALUE, normalize_dataframe, prepare_dataset, read_file_data

def pearson_feature_selection(
    file_data: str,
    feature_col: List[str],
    target_col: str,
    grade_value: Dict[str, int]=GRADE_VALUE,
    gp_value: Dict[str, int]=GP_VALUE,
):
    excel_data = read_file_data(file_data)
    processed_data = normalize_dataframe(feature_col, target_col, excel_data, grade_value, gp_value)
    cor = processed_data.corr()
    cor_target = abs(cor[target_col])
    relevant_features = cor_target[cor_target > 0.5]
    return list(relevant_features.index)

def rfe_feature_selection(
    file_data: str,
    feature_col: List[str],
    target_col: str,
    grade_value: Dict[str, int]=GRADE_VALUE,
    gp_value: Dict[str, int]=GP_VALUE,
):
    excel_data = read_file_data(file_data)
    processed_data = normalize_dataframe(feature_col, target_col, excel_data, grade_value, gp_value)
    splitted_dataset = prepare_dataset(file_data, feature_col, target_col, grade_value, gp_value)
    number_of_features_list = np.arange(1, len(feature_col))
    high_score = 0
    number_of_features = 0
    optimum_features = []
    for n in range(len(number_of_features_list)):
        feature_train, feature_test, target_train, target_test = splitted_dataset
        model = LinearRegression()
        rfe = RFE(model, n_features_to_select=number_of_features_list[n])
        feature_train_rfe = rfe.fit_transform(X=feature_train, y=target_train)
        feature_test_rfe = rfe.transform(feature_test)
        model.fit(feature_train_rfe, target_train)
        score = model.score(feature_test_rfe, target_test)
        optimum_features.append(score)
        if score > high_score:
            high_score = score
            number_of_features = number_of_features_list[n]

    model = LinearRegression()
    rfe = RFE(model, n_features_to_select=number_of_features)
    feature_rfe = rfe.fit_transform(processed_data[feature_col], processed_data[target_col])
    model.fit(feature_rfe, processed_data[target_col])
    temp = pd.Series(rfe.support_, index=feature_col)
    selected_features_rfe = temp[temp == True].index
    return list(selected_features_rfe)