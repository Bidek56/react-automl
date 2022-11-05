import React from 'react';
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { render, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import Login from './components/Login';
import NewDataSet from './components/NewDataSet';
import ModelGrid from './components/ModelGrid';
import ProfileGrid from './components/ProfileGrid';
import UploadFile from './components/UploadFile'
import SetView, {IDictionary} from './components/SetView';

const server = setupServer(
  rest.post('http://localhost:5000/login', (req, res, ctx) => {
    return res(ctx.json({access_token: 'hello there'}))
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('render App comp', async () => {
  const { getByText, getByTestId } = render(<App />);
  const linkElement = getByText(/Copyright/i);
  expect(linkElement).toBeInTheDocument();
  expect(getByText('AutoML sign in')).toBeInTheDocument();

  const user = getByTestId("userInput");
  const pass = getByTestId("passwordInput")
  const signButton = getByTestId("signButton")

  expect(user).toBeInTheDocument()
  expect(pass).toBeInTheDocument()
  expect(signButton).toBeInTheDocument()

  fireEvent.change(user, {
    target: { value: "admin" },
  });

  fireEvent.change(pass, {
    target: { value: "admin" },
  });

  fireEvent.click(signButton);

  // wait for the word Menu to show in the html
  const menuText = await waitFor(() => getByText('Menu')) 
  expect(menuText).toBeInTheDocument();
});

test('render Login comp', async () => {

  const setToken = jest.fn();
  const { getByText, getByTestId } = render(<Login setToken={setToken} />);

  const linkElement = getByText(/Copyright/i);
  expect(linkElement).toBeInTheDocument();

  const user = getByTestId("userInput");
  const pass = getByTestId("passwordInput")
  const signButton = getByTestId("signButton")

  expect(user).toBeInTheDocument()
  expect(pass).toBeInTheDocument()
  expect(signButton).toBeInTheDocument()

  fireEvent.change(user, {
    target: { value: "admin" },
  });

  fireEvent.change(pass, {
    target: { value: "admin" },
  });

  fireEvent.click(signButton);
});

test('render Model grid comp', async () => {

  const { getByText, getByTestId } = render(<ModelGrid selectedSet={'class1.csv'} columns={['test1', 'test2', 'test3']} />);

  const modelElement = getByText(/Model options/);
  expect(modelElement).toBeInTheDocument();
})

test('render New Data set grid comp', async () => {

  const { getByText, getByTestId } = render(<NewDataSet selectedSet={'class1.csv'} columns={['test1', 'test2', 'test3']} />);

  const modelElement = getByText(/Preprocessing options/);
  expect(modelElement).toBeInTheDocument();
})

test('render Profile grid comp', async () => {

  const dataSet: IDictionary<string>[] = [{ 'a': '1'}]
  const { getByText } = render(<ProfileGrid dataSet={dataSet}/>);

  const modelElement = getByText(/Columns/);
  expect(modelElement).toBeInTheDocument();
})

test('render Upload comp', async () => {
  const { getByText } = render(<UploadFile/>)

  const dragElement = getByText("Drag 'n' drop some files here, or click to select files")
  expect(dragElement).toBeInTheDocument();
})

test('render SetView file comp', async () => {
  const { getByText } = render(<SetView/>)

  const deleteElement = getByText("Delete")
  expect(deleteElement).toBeInTheDocument();
})