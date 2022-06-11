import unittest
import asyncio
import websockets
import json

class TestServer(unittest.TestCase):

    async def hello(self):

        json_data = { "action": "doLogout", "logout": { "user": "frank" } }
        async with websockets.connect('ws://127.0.0.1:6789/ws/') as websocket:
            await websocket.send(json.dumps(json_data))

            async for message in websocket:
                print(message)

    def test_websocket(self):
        asyncio.get_event_loop().run_until_complete(self.hello())

@unittest.skip("demonstrating skipping")
class TestStringMethods(unittest.TestCase):

    @unittest.skip("demonstrating skipping")
    def test_upper(self):
        self.assertEqual('foo'.upper(), 'FOO')

    def test_isupper(self):
        self.assertTrue('FOO'.isupper())
        self.assertFalse('Foo'.isupper())

    def test_split(self):
        s = 'hello world'
        self.assertEqual(s.split(), ['hello', 'world'])
        # check that s.split fails when the separator is not a string
        with self.assertRaises(TypeError):
            s.split(2)

if __name__ == '__main__':
    unittest.main()