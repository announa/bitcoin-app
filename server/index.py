import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

import os

load_dotenv()

API_KEY = os.getenv('API_KEY')
BASE_URL = os.getenv('BASE_URL')

app = Flask(__name__)
CORS(app)


class RequestException(Exception):

    def __init__(self, message, status):
        super().__init__(message)
        self.status = status


@app.route("/", methods=["GET"])

def fetch_data():
        request_params = request.query_string
        print(request_params)
        if not request_params:
             raise RequestException("Missing request parameters", 400)
        
        decoded_params = request.query_string.decode("utf-8")
        params = f"{decoded_params}&api_key={API_KEY}"
        url = f"{BASE_URL}?{params}"

        try:
            response = requests.get(url)
            status = response.status_code
            data = response.json()

            print("Data: ", data)

            if "quandl_error" in data:
                message = data["quandl_error"]["message"]
                raise RequestException(message, status)

            return jsonify(data.get("datatable", {})), 200

        except RequestException as e:
            print("Error: ", e)
            if str(e.status)[0] == "4":
                e.status = 400
            elif str(e.status)[0] == "5":
                e.status = 500

            return str(e), e.status

if __name__ == "__main__":
        app.run(debug=True)

