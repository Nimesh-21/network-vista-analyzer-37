#!/usr/bin/env python3
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json, os
from pymongo import MongoClient
import copy

# Configuration
app = Flask(__name__)
CORS(app)
DATA_FILE = "/home/nimesh/network-vista-analyzer-37/backend/latest_network_data2.json"

# MongoDB setup
MONGO_URI = "mongodb://10.229.40.76:27017/"
DB_NAME = "NDR_database"
COLLECTION_NAME = "raw_data_ndr_clients"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

# In-memory storage of latest data from each host
host_data = {}

def save_to_mongo(document: dict):
    """
    Inserts a single document into the MongoDB collection.
    """
    try:
        # Ensure timestamp
        if "received_at" not in document:
            document["received_at"] = datetime.now().isoformat()
        collection.insert_one(document)
    except Exception as e:
        app.logger.error(f"Failed to insert document into MongoDB: {e}")

@app.route("/upload", methods=["POST"])
def upload():
    payload = request.get_json()
    if not payload or "hostname" not in payload:
        return jsonify({"error": "invalid or missing hostname"}), 400

    # Add received timestamp to the payload stored in-memory
    payload["received_at"] = datetime.now().isoformat()
    hostname = payload["hostname"]
    host_data[hostname] = payload

    # Overwrite the data file with all current host data (clean of any Mongo-specific fields)
    try:
        # Remove any internal MongoDB identifiers if present
        clean_data = {h: {k: v for k, v in data.items() if k not in ("_id", "id")} for h, data in host_data.items()}
        with open(DATA_FILE, "w") as f:
            json.dump(clean_data, f, indent=2)
    except Exception as e:
        app.logger.error(f"Error writing to data file: {e}")
        return jsonify({"error": "failed to write data file"}), 500

    # Save the new data to MongoDB using a deep copy so host_data remains JSON-serializable
    save_to_mongo(copy.deepcopy(payload))

    return jsonify({"status": "ok"}), 200

@app.route("/latest", methods=["GET"])
def latest():
    # Return only JSON-serializable host_data
    return jsonify(host_data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
