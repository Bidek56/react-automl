import unittest, os, json

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

    def test_alogin(self):

        data = {"user":"admin", "pass":"admin"}
        response = self.client.post('/login', data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)

        # print(f"Res: {response.get_json()}")
        resp_json = response.get_json()

        self.assertTrue("access_token" in response.get_json())

        # print(f"Token: {resp_json['access_token']}")

        self.__class__.token = resp_json['access_token']

    def test_root(self):

        # print(f"Root token: {self.__class__.token}")

        response = self.client.get('/', headers={"Authorization": f"Bearer {self.__class__.token}"})

        # print(f"Res: {response}")
        # print(response.get_json())

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), ['sample', 'boston_house_prices'])

    def test_upload_csv(self):
        folder = "datasets"
        file = "sample.csv"
        data = dict(file= (open(os.path.join( folder, file ), 'rb'), file) )

        response = self.client.post('/uploader', data=data, 
                                    follow_redirects=True,
                                    content_type='multipart/form-data', headers={"Authorization": f"Bearer {self.__class__.token}"})

        self.assertEqual(response.status_code, 200)
        # print(f"Res: {response}")

        expected = {"msg": "file uploaded successfully"}
        self.assertEqual(response.get_json(), expected)

    def test_dataset(self):
        response = self.client.get('/datasets/sample', headers={"Authorization": f"Bearer {self.__class__.token}"})
        # print(f"Res: {response.text}")
        # print(f"Res: {response.get_json()}")

        self.assertEqual(response.status_code, 200)

        res = response.get_json()

        if "head" in res:
            self.assertEqual(res['head'], '[{\"a\":1,\"b\":2,\"c\":3},{\"a\":4,\"b\":5,\"c\":6}]')

    def test_logout(self):

        response = self.client.post('/logout', headers={"Authorization": f"Bearer {self.__class__.token}"})
        self.assertEqual(response.status_code, 200)

        # print(f"Res: {response.get_json()}")

        expected = {"msg": "logout successful"}
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