from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route("/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/generate-plan", methods=["POST"])
def generate_plan():
    data = request.get_json()
    skill = data.get("skill_name", "")
    # TODO: call OpenAI here
    return jsonify([])

if __name__ == "__main__":
    app.run(debug=True)
