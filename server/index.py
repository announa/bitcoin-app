import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

import os

load_dotenv()

API_KEY = os.getenv("API_KEY")
BASE_URL = os.getenv("BASE_URL")
ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN")

app = Flask(__name__)

CORS(app, supports_credentials=True, origins=[ALLOWED_ORIGIN])

class RequestException(Exception):

    def __init__(self, message, status):
        super().__init__(message)
        self.status = status


def check_for_error(data, status):
    if "quandl_error" in data:
        message = data["quandl_error"]["message"]
        raise RequestException(message, status)


def fetch_data(url):
    response = requests.get(url)
    status = response.status_code
    data = response.json()
    return (data, status)


def handle_error(error):
    print("Error: ", error)
    if str(error.status)[0] == "4":
        error.status = 400
    elif str(error.status)[0] == "5":
        error.status = 500
    return str(error), error.status


@app.route("/", methods=["GET"])
def fetch_bitcoin_data():
    url_params = request.query_string
    print("Query parameters:", url_params or "no parameters")
    request_params = ""

    if url_params:
        decoded_params = url_params.decode("utf-8")
        request_params = f"{decoded_params}&api_key={API_KEY}"
    else:
        request_params = f"api_key={API_KEY}"

    url = f"{BASE_URL}?{request_params}"

    try:
        (data, status) = fetch_data(url)

        print("Data: ", str(data)[:500] + "...")

        check_for_error(data, status)

        return jsonify(data.get("datatable", {})), 200

    except RequestException as e:
        return handle_error(e)


@app.route("/metadata", methods=["GET"])
def fetch_metadata():
    try:
        url = f"{BASE_URL}/metadata?api_key={API_KEY}"
        (data, status) = fetch_data(url)
        check_for_error(data, status)

        return jsonify(data.get("datatable", {})), 200
    except RequestException as e:
        return handle_error(e)


if __name__ == "__main__":
    app.run(debug=True)
