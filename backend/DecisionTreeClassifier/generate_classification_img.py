from sklearn.tree import export_graphviz
from six import StringIO
from IPython.display import Image
import pydotplus

from train import (
    train,
    FEATURE_COLUMNS
)

trained = train()
dot_data = StringIO()
export_graphviz(
    trained['clf'],
    out_file=dot_data,
    filled=True,
    rounded=True,
    special_characters=True,
    feature_names=FEATURE_COLUMNS,
    class_names=[
        '1',
        '2',
        '3',
        '4',
        '5'
    ]
)

graph = pydotplus.graph_from_dot_data(dot_data.getvalue())  
graph.write_png('./images/data.png')
Image(graph.create_png())