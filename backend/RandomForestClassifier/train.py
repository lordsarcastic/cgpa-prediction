from sklearn.ensemble import RandomForestClassifier as RFC
from sklearn import metrics

from train_function import (
    X,
    y,
    split_dataset
)

def train():
    train_data = split_dataset(
        X, y
    )
    feature_train, feature_test, target_train, target_test = train_data
    clf = RFC(n_estimators=100)
    clf = clf.fit(feature_train, target_train)
    target_prediction = clf.predict(feature_test)
    results = {
        'target_prediction': target_prediction,
        'target_test': target_test,
        'clf': clf
    }
    return results

trained = train()
print(f"Accuracy for Random Forest: {metrics.accuracy_score(trained['target_prediction'], trained['target_test'])}")