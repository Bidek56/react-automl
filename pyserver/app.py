from flask import Flask, render_template, request, jsonify, redirect
import os, datetime, traceback
import pandas as pd
from flask_socketio import SocketIO, emit
from flask_cors import CORS

from flask_jwt_extended import (
    JWTManager, jwt_required, get_jwt, create_access_token,
    get_jwt_identity, set_access_cookies, unset_jwt_cookies
)

from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = "please-remember-to-change-me"
app.config['JWT_COOKIE_CSRF_PROTECT'] = True
app.config["JWT_TOKEN_LOCATION"] = ['headers']
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(hours=0.5)

UPLOAD_FOLDER = "./datasets"

jwt = JWTManager(app)

socketio = SocketIO(app, cors_allowed_origins=['http://localhost:3000'])

def datasetList():
    datasets = [x.split('.')[0] for f in ['datasets', 'preprocessed'] for x in os.listdir(f)]
    extensions = [x.split('.')[1] for f in ['datasets', 'preprocessed'] for x in os.listdir(f)]
    folders = [f for f in ['datasets', 'preprocessed'] for x in os.listdir(f)]
    return datasets, extensions, folders

# Load Dataset
def loadDataset(dataset):
    datasets, extensions, folders = datasetList()
    if dataset in datasets:
        extension = extensions[datasets.index(dataset)]
        if extension == 'txt':
            df = pd.read_table(os.path.join(folders[datasets.index(dataset)], dataset + '.txt'))
        elif extension == 'csv':
            df = pd.read_csv(os.path.join(folders[datasets.index(dataset)], dataset + '.csv'))
        return df

@app.route('/upload')
@jwt_required()
def upload():
   return render_template('upload.html')
	
@app.route('/uploader', methods = ['POST'])
@jwt_required()
def upload_file():
   if request.method == 'POST':
      if 'file' in request.files:

         if not os.path.isdir(UPLOAD_FOLDER):
            os.mkdir(UPLOAD_FOLDER)

         f = request.files['file']
         if (f):
            f.save(os.path.join(UPLOAD_FOLDER, secure_filename(f.filename)))

         return {"msg": "file uploaded successfully"}, 200
      else:
         return {"msg": "file not found"}, 200

@app.route('/', methods = ['GET'])
@jwt_required()
def index():
   if request.method == 'POST':
      return 'post not implemented'

   if request.method == 'GET':
      datasets,_,folders = datasetList()
      originalds = []
      featuresds = []
      for i in range(len(datasets)):
         if folders[i] == 'datasets': originalds += [datasets[i]]
         else: featuresds += [datasets[i]]	

      return jsonify(originalds)

@app.route('/datasets/')
@jwt_required()
def datasets():
    return redirect('/')

@app.route('/datasets/<dataset>')
@jwt_required()
def dataset(description = None, head = None, dataset = None):
   if not dataset:
      return jsonify(exception="missing data set")

   df = loadDataset(dataset)
   try:
      # description = df.describe().round(2)
      head = df.head(5)
      return jsonify(head.to_json(orient='records'))

   except Exception as e:
      print(e)
      return jsonify(exception=traceback.format_exc())

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

@app.route('/profile')
@jwt_required()
def my_profile():
   response_body = {
      "name": "Nagato",
      "about" :"Hello! I'm a full stack developer that loves python and javascript"
   }

   return response_body


@socketio.on('connect')
def test_connect():
   print("Connected")
   emit('after connect',  {'data':'Lets dance'})

if __name__ == '__main__':
   app.secret_key = os.urandom(24)
   app.run(debug = True)


# if __name__ == '__main__':
#     socketio.run(app)