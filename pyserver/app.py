from flask import Flask, render_template, request, jsonify, redirect
import os
import pandas as pd
import traceback

from werkzeug.utils import secure_filename

app = Flask(__name__)

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

if __name__ == '__main__':
   app.run(debug = True)