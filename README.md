# cgpa-prediction
A web application to predict student's final grade given a dataset of 100 level results.

## Steps
- User uploads a dataset containing results from courses in 100 level. Dataset should also contain the final graduating score of students, a column of values ranging from PASS to FIRST CLASS.
- User selects columns that are results from 100 level as Course Columns
- User selects the final graduating column.
- User trains the model
- User can then predict final graduating score after inputting results.

## How to set up the app locally
This is how to set up the application locally
### Requirements
- Python 3.9
- Pipenv. Install globally with `pip install pipenv`,
- NodeJS
- Yarn

### Starting the app
- Clone the repository and cd into it
- Run `pipenv shell` to start the virtual environment
- Run `pipenv install` to install dependencies
- cd to the backend folder and run `python manage.py runserver` to start up the backend server.

Meanwhile, in another terminal window...
- In another terminal window, cd to the frontend folder and run `yarn install` to install dependencies.
- Run `yarn start` to run the frontend server. Navigate to localhost:3000 to access the frontend.
