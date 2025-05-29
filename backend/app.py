from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from config import OPENAI_API_KEY 
from services.plan_service import generate_30_day_plan 

app = Flask(__name__)
CORS(app)

@app.route("/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/generate-plan", methods=["POST"])
def generate_plan():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
            
        skill = data.get("skill_name", "").strip()
        if not skill:
            return jsonify({"error": "skill_name is required"}), 400

        plan = generate_30_day_plan(skill)
        
        
        return jsonify({
            "skill": skill,
            "plan": plan  
        }), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Unexpected error in generate_plan: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(debug=True)