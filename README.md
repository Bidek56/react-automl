### The purpose of this project is to create a modern UI using React which connects to Python Flask server
  
The client of this project was bootstrapped with [Vite](https://vitejs.dev) and it uses [MUI](https://mui.com/)

To install MUI with React 18, please `npm i --legacy-peer-deps` until MUI fixes it's support for React 18

### React client

In the main project directory, you can run:

1. #### `npm dev`

    Runs the client app in the development mode.<br />
    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

    The page will reload if you make edits.<br />
    You will also see any lint errors in the console.

2. #### `npm test`

    Launches the test runner in the interactive watch mode.<br />
    See the section about [running tests](https://vitest.dev) for more information.

3. #### `npm run build`

    Builds the app for production to the `build` folder.<br />
    It correctly bundles React in production mode and optimizes the build for the best performance.

    The build is minified and the filenames include the hashes.<br />
    Your app is ready to be deployed!

    See the section about [deployment](https://vitejs.dev/guide/static-deploy.html) for more information.

### Python server

Python server is using Flask, Socket-IO and Python 3.11

To run the Python server:
1. cd to the pyserver dir: `cd pyserver`
2. Create local virtual env: `python -m venv venv`
3. Activate local virtual env: `./venv/bin/activate`
4. Install pip libraries: `pip install -r requirements.txt`
5. Start the Flask server: `python app.py`

Or start it using nodemon

1. `npm i -g nodemon`
2. `nodemon --exec python app.py`
