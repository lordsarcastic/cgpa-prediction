from .train import load_trained_model

model = load_trained_model('decision_tree.joblib')
result = model.predict([[]])