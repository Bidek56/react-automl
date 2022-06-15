from flask import Flask, render_template, request, jsonify, redirect
import os
import pandas as pd
import traceback
from flask_socketio import SocketIO, emit
from flask_cors import CORS

from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, \
                               unset_jwt_cookies, jwt_required, JWTManager

from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = "please-remember-to-change-me"
jwt = JWTManager(app)

socketio = SocketIO(app, cors_allowed_origins=['http://localhost:3000'])

def datasetList():
    datasets = [x.split('.')[0] for f in ['datasets', 'preprocessed'] for x in os.listdir(f)]
    extensions = [x.split('.')[1] for f in ['datasets', 'preprocessed'] for x in os.listdir(f)]
    folders = [f for f in ['datasets', 'preprocessed'] for x in os.listdir(f)]
    return datasets, extensions, folders

#Load Dataset    
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
def upload():
   return render_template('upload.html')
	
@app.route('/uploader', methods = ['GET', 'POST'])
def upload_file():
   if request.method == 'POST':
      f = request.files['file']
      f.save(secure_filename(f.filename))
      return 'file uploaded successfully'

@app.route('/', methods = ['GET'])
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
def datasets():
    return redirect('/')

@app.route('/datasets/<dataset>')
def dataset(description = None, head = None, dataset = None):
   df = loadDataset(dataset)
   try:
      description = df.describe().round(2)
      head = df.head(5)
      return jsonify(head.to_json())

   except Exception as e:
      return jsonify(exception=traceback.format_exc())

@app.errorhandler(500)
def internal_error(e):
   return jsonify("Server error"), 500, {'content-type': 'application/json'}

@app.errorhandler(404)
def page_not_found(e):
   return jsonify("Route not found"), 404, {'content-type': 'application/json'}

@app.route('/token', methods=["POST"])
def create_token():
   user = request.json.get("user", None)
   pasd = request.json.get("pass", None)
   if user != "admin" or pasd != "admin":
      return {"msg": "Wrong user or password"}, 401

   access_token = create_access_token(identity=user)
   response = {"access_token":access_token}

   return response

@app.route("/logout", methods=["POST"])
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

# if __name__ == '__main__':
#    app.run(debug = True)

if __name__ == '__main__':
    socketio.run(app)