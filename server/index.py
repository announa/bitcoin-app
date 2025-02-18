import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

import os

load_dotenv()

API_KEY = os.getenv('API_KEY')
BASE_URL = os.getenv('BASE_URL')
ALLOWED_ORIGIN = os.getenv('ALLOWED_ORIGIN')

app = Flask(__name__)

CORS(app, supports_credentials=True, origins=[ALLOWED_ORIGIN])

class RequestException(Exception):

    def __init__(self, message, status):
        super().__init__(message)
        self.status = status


@app.route("/", methods=["GET"])

def fetch_data():
        url_params = request.query_string
        print("Query parameters:", url_params or "no parameters")
        request_params= ""

        if url_params:
            decoded_params = url_params.decode("utf-8")
            request_params = f"{decoded_params}&api_key={API_KEY}"
        else:
            request_params = f"api_key={API_KEY}"
            
        url = f"{BASE_URL}?{request_params}"

        try:
            response = requests.get(url)
            status = response.status_code
            data = response.json()

            print("Data: ", str(data)[:500] + "...")

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

