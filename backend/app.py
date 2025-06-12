import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from auth.routes import auth_bp
from services.plan_service import generate_30_day_plan
import logging
from dotenv import load_dotenv; 

load_dotenv()


def create_app():
    app = Flask(__name__)

    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/skillplan_db')


    CORS(app, origins=[
        os.getenv('FRONTEND_URL', 'http://localhost:8081'),
        'http://localhost:8081',
        'exp://192.168.0.116:8081'  
    ])


    client = MongoClient(app.config['MONGO_URI'])
    app.db = client.get_default_database()


    logging.basicConfig(level=logging.INFO)
    app.logger.setLevel(logging.INFO)

    
    app.register_blueprint(auth_bp)


    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'healthy', 'message': 'YiZ Planner API is running'}), 200

   
    @app.route('/generate-plan', methods=['POST'])
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
            app.logger.error(f"Unexpected error in generate_plan: {str(e)}")
            return jsonify({"error": "Internal server error"}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port, debug=True)