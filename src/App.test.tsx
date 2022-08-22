import React from 'react';
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { render, fireEvent, waitForElementToBeRemoved } from '@testing-library/react';
import App from './App';
import Login from './components/Login';

const server = setupServer(
  rest.post('/login', (req, res, ctx) => {
    return res(ctx.json({access_token: 'hello there'}))
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('render App comp', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/Copyright/i);
  expect(linkElement).toBeInTheDocument();
  expect(getByText('AutoML sign in')).toBeInTheDocument();
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