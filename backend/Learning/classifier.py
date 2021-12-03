from typing import List, Dict

from sklearn.ensemble import RandomForestClassifier as RFC
from sklearn.tree import DecisionTreeClassifier as DCF

from .utils import prepare_dataset


def decision_tree_classifier(file_data: str, feature_columns: List[str], target_column: str) -> Dict:
    splitted_dataset = prepare_dataset(
        file_data,
        feature_columns,
        target_column
    )
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


def random_forest_classifier(file_data: str, feature_columns: List[str], target_column: str) -> Dict:
    splitted_dataset = prepare_dataset(
        file_data,
        feature_columns,
        target_column
    )
    feature_train, feature_test, target_train, target_test = splitted_dataset
    clf = RFC(n_estimators=100)
    clf = clf.fit(feature_train, target_train)
    target_prediction = clf.predict(feature_test)
    results = {
        'target_prediction': target_prediction,
        'target_test': target_test,
        'clf': clf
    }
    return results

# trained = random_forest_classifier()
# print(f"Accuracy for Random Forest: {metrics.accuracy_score(trained['target_prediction'], trained['target_test'])}")
