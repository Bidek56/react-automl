from typing import List
from flask import Flask, request, jsonify, redirect
import os, io, datetime, traceback, base64
import pandas as pd
from flask_socketio import SocketIO, emit
from flask_cors import CORS

from flask_jwt_extended import (
    JWTManager, jwt_required, get_jwt, create_access_token,
    get_jwt_identity, set_access_cookies, unset_jwt_cookies
)

import matplotlib.pyplot as plt
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from matplotlib.figure import Figure

from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # , resources={r"/*": {"origins": "http://localhost:3000"}})

app.config["JWT_SECRET_KEY"] = "please-remember-to-change-me"
app.config['JWT_COOKIE_CSRF_PROTECT'] = True
app.config["JWT_TOKEN_LOCATION"] = ['headers']
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(hours=0.5)

ORIGINAL_FOLDER = "original"
PROCESS_FOLDER = "processed"

jwt = JWTManager(app)

socketio = SocketIO(app, cors_allowed_origins=['http://localhost:3000'])

def getDatasetList() -> List:

   datasets = []

   for folder in [ ORIGINAL_FOLDER, PROCESS_FOLDER ]:
      if os.path.exists(folder):
         datasets.extend( [ f"{folder}/{x}" for f in [folder] for x in os.listdir(f) ] )

   return datasets

# Load Dataset
def loadDataset(source, dataset, nrows=None):
   fullPath = os.path.join(source, dataset)

   # print(f"Full path: {fullPath}")

   if (os.path.exists(fullPath)):
      return pd.read_csv(fullPath, nrows=nrows)
   else:
      return None
	
@app.route('/uploader', methods = ['POST'])
@jwt_required()
def upload_file():
   if request.method == 'POST':
      if 'file' in request.files:

         if not os.path.isdir(ORIGINAL_FOLDER):
            os.mkdir(ORIGINAL_FOLDER)

         f = request.files['file']
         if (f):
            f.save(os.path.join(ORIGINAL_FOLDER, secure_filename(f.filename)))

         return {"msg": "file uploaded successfully"}, 200
      else:
         return {"msg": "file not found"}, 200

@app.route('/datasets/<source>/<dataset>/delete', methods = ['GET'])
@jwt_required()
def delete(source = None, dataset = None):
   if not dataset:
      return jsonify(exception="missing data set")

   fullPath = os.path.join(source, dataset)

   try:
      os.remove(fullPath)
      return jsonify({"msg": "delete successful"})
   except Exception as e:
      # print(e)
      return jsonify(exception=traceback.format_exc()), 404

def create_figure(df: pd.DataFrame):
   fig = Figure()
   ax = fig.subplots(len(df.columns))

   fig.suptitle('Vertically stacked subplots')
   fig.patch.set_facecolor('#E8E5DA')

   for ind, column in enumerate(df.columns):
      ax[ind].set_title(f'Histogram for column:{column}')
      ax[ind].hist(df[column], color = "#304C89")

   fig.tight_layout()
   return fig

@app.route('/datasets/<source>/<dataset>/graph', methods = ['GET'])
@jwt_required()
def graph(source = None, dataset = None):
   if not dataset:
      return jsonify(exception="missing data set")

   df = loadDataset(source, dataset)

   if df is None:
      return jsonify(exception=f"error reading: {dataset}"), 404

   # print(f"DF:\n{df}")

   fig = create_figure(df)
   output = io.BytesIO()
   FigureCanvas(fig).print_png(output)

   imgByteArr = base64.encodebytes(output.getvalue()).decode('ascii')

   try:
      return jsonify({"msg": "graph successful", "imageBytes": imgByteArr})
   except Exception as e:
      # print(e)
      return jsonify(exception=traceback.format_exc()), 404

@app.route('/', methods = ['GET'])
@jwt_required()
def index():
   if request.method == 'POST':
      return 'post not implemented'

   if request.method == 'GET':
      datasets = getDatasetList()

      return jsonify(datasets)

@app.route('/datasets/')
@jwt_required()
def datasets():
    return redirect('/')

@app.route('/datasets/<source>/<dataset>')
@jwt_required()
def dataset(source = None, dataset = None):
   if not dataset:
      return jsonify(exception="missing data set")

   df = loadDataset(source, dataset)

   # print(f"DF: {df}")

   if df is None:
      return jsonify(exception=f"error reading: {dataset}")

   try:
      description = df.describe().reset_index().round(2)
      # print(description)
      head = df.head(5)
      return jsonify({'head': head.to_json(orient='records'),
                     'desc': description.to_json(orient='records')})

   except Exception as e:
      print(e)
      return jsonify(exception=traceback.format_exc())

@app.route('/datasets/<source>/<dataset>/columns')
@jwt_required()
def columns(source = None, dataset = None):
   if not dataset:
      return jsonify(exception="missing data set")

   df = loadDataset(source, dataset, nrows=1)

   # print(f"df: {df}")

   if df is None:
      return jsonify(exception=f"error reading: {dataset}")

   try:
      columns = df.columns
      return jsonify({'columns': pd.Series(columns).to_json(orient='records')})

   except Exception as e:
      print(e)
      return jsonify(exception=traceback.format_exc())

@app.route('/datasets/<source>/<dataset>/preprocessed_dataset/', methods=['POST'])
@jwt_required()
def preprocessed_dataset(source: str = None, dataset: str = None):

   # print(f"request.json: {request.json}")

   numFeatures = request.json.get('nfeatures')
   manualFeatures = request.json.get('manualfeatures')
   datasetName = request.json.get('newdataset')
   response = request.json.get('response')
   dropsame = request.json.get('dropsame')
   dropna = request.json.get('dropna')
    
   df = loadDataset(source, dataset)

   if dropna == 'all':
      df = df.dropna(axis=1, how='all')
   elif dropna == 'any':
      df.dropna(axis=1, how='any')
   
   filename = dataset.replace(".csv", "") + '_'
   if numFeatures and numFeatures > 0:

      try:
         nf = int(numFeatures)
         from sklearn.feature_selection import SelectKBest, chi2
         X = df.drop(str(response), axis=1)
         y = df[str(response)]
         kbest = SelectKBest(chi2, k=nf).fit(X,y)
         mask = kbest.get_support()
         # List of K best features
         best_features = []
         for bool, feature in zip(mask, list(df.columns)):
            if bool: 
               best_features.append(feature)
               # Reduced Dataset
               df = pd.DataFrame(kbest.transform(X),columns=best_features)
               df.insert(0, str(response), y)
      
         filename += f"{numFeatures}_{dropna}_{dropsame}.csv"

         # print(f"{filename=}")

      except Exception as e:
         print(e + traceback.format_exc())
         return {"exception": f"'{e}'"}, 400

   else:
      df = df[manualFeatures]
      filename += f"{datasetName}_{response}.csv"
   
   if dropsame:
      nunique = df.apply(pd.Series.nunique)
      cols_to_drop = nunique[nunique == 1].index
      df = df.drop(cols_to_drop, axis=1)
   
   df.to_csv(os.path.join(PROCESS_FOLDER, filename), index=False)

   return { "msg": f"Created: {filename}" }

@app.errorhandler(500)
def internal_error(e):
   return jsonify("Server error"), 500, {'content-type': 'application/json'}

@app.errorhandler(404)
def page_not_found(e):
   return jsonify("Route not found"), 404, {'content-type': 'application/json'}

@app.route("/login", methods=["POST"])
def login():

   user = request.json.get("user", None)
   pasd = request.json.get("pass", None)
   if user != "admin" or pasd != "admin":
      return {"msg": "Wrong user or password"}, 401

   access_token = create_access_token(identity=user)

   response = jsonify({"access_token": access_token})
   set_access_cookies(response, access_token)
   return response

# Using an `after_request` callback, we refresh any token that is within 30
# minutes of expiring. Change the timedeltas to match the needs of your application.
@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.datetime.now(datetime.timezone.utc)
        target_timestamp = datetime.datetime.timestamp(now + datetime.timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            set_access_cookies(response, access_token)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original response
        return response

@app.route("/logout", methods=["POST"])
# @jwt_required()
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response

@socketio.on('connect')
def test_connect():
   print("Connected")
   emit('after connect',  {'data':'Lets dance'})

if __name__ == '__main__':
   app.secret_key = os.urandom(24)
   app.run(debug = True)


# if __name__ == '__main__':
#     socketio.run(app)