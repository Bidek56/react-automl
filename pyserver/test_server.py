import unittest
import os, json
from urllib import response

from app import app

class TestApp(unittest.TestCase):

    def setUp(self):
        self.ctx = app.app_context()
        self.ctx.push()
        self.client = app.test_client()

    def tearDown(self):
        self.ctx.pop()

    def test_not_found(self):
        response = self.client.get('/foo')

        # print(response.get_json())
        # print(response.status_code)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.get_json(), 'Route not found')

    def test_root(self):
        response = self.client.get('/')
        # print(f"Res: {response}")
        # print(response.get_json())

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), ['sample'])

    def test_upload_csv(self):
        folder = "datasets"
        file = "sample.csv"
        data = dict(file= (open(os.path.join( folder, file ), 'rb'), file) )

        response = self.client.post('/uploader', data=data, 
                                    follow_redirects=True,
                                    content_type='multipart/form-data', )

        self.assertEqual(response.status_code, 200)
        # print(f"Res: {response}")

        self.assertEqual(response.get_data(as_text=True), "file uploaded successfully")

        # Clean up uploaded file    
        os.remove(file)

    def test_dataset(self):
        response = self.client.get('/datasets/sample')
        # print(f"Res: {response.text}")

        self.assertEqual(response.status_code, 200)
        expected = '{"a":{"0":1},"b":{"0":2},"c":{"0":3}}'
        self.assertEqual(response.get_json(), expected)

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