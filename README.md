# Unitary Fund web app

## Requirements for deployment:
* Node.js > 9
* Python 3

## Requirements for local development:
* Node.js > 9
* Python 3

## Local setup:
* `npm install`  This will install node modules
* `pip install -r requirements.txt` This will install pip modules

## Local start:
* `gunicorn tsp.web:api -b 0.0.0.0:5000` This will start the python API
* In separate terminal:  `npm run start:development`

## Production start:
* `npm run build` This will prepare an optimized production build
* `gunicorn tsp.web:api -b 0.0.0.0:$PORT` This will run the python server at `PORT`

# Security
* Currently access to API is protected with basic login/password
* To view the password and modify it go to `tsp/web.py` 

## Important Notes:
* To change google API KEY go to `src/config/config.js`
* To modify landing page contents go to `public/index.html`
* To modify the demo app go to `src/index.js`
* To modify the python API go to `tsp/web.py`
* To modify list of points for the demo app go to `src/data/points.json`

