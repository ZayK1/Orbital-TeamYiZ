import os
import json
from datetime import datetime
from bson import ObjectId
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from pymongo import MongoClient
from backend.auth.routes import auth_bp
from backend.services.ai_service import AIService
import logging
from dotenv import load_dotenv

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return o.isoformat()
        return super().default(o)

load_dotenv()


def create_app():
    app = Flask(__name__)
    app.json_encoder = CustomJSONEncoder

    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/skillplan_db')


    CORS(app, origins=[
        os.getenv('FRONTEND_URL', 'http://localhost:8081'),
        'http://localhost:8081',
        'exp://192.168.0.116:8081'  
    ])


    @app.before_request
    def before_request():
        try:
            if 'db_client' not in g:
                mongo_uri = os.getenv("MONGO_URI")
                if not mongo_uri:
                    raise ValueError("MONGO_URI environment variable not set.")
                g.db_client = MongoClient(mongo_uri)
                g.db = g.db_client.get_default_database()
        except Exception as e:
            app.logger.critical(f"Could not connect to MongoDB: {e}")
            g.db = None 

    @app.teardown_request
    def teardown_request(exception):
        db_client = g.pop('db_client', None)
        if db_client is not None:
            db_client.close()

    logging.basicConfig(level=logging.INFO)
    app.logger.setLevel(logging.INFO)

    
    app.register_blueprint(auth_bp)

    from backend.api.v1.plans import v1_plans_blueprint
    app.register_blueprint(v1_plans_blueprint, url_prefix='/api/v1/plans')
    
    # Register social features blueprints
    from backend.api.v1.social import social_bp
    app.register_blueprint(social_bp, url_prefix='/api/v1/social')
    
    from backend.api.v1.discovery import discovery_bp
    app.register_blueprint(discovery_bp, url_prefix='/api/v1/discovery')


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

            import asyncio
            plan_tasks = asyncio.run(AIService.generate_structured_plan(skill))

            return jsonify({
                "skill": skill,
                "plan": {"daily_tasks": plan_tasks}
            }), 200

        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except ConnectionError as e:
            app.logger.error(f"AI Service connection error: {e}")
            return jsonify({"error": "Could not connect to AI service"}), 503
        except Exception as e:
            app.logger.error(f"Unexpected error in generate_plan: {str(e)}")
            return jsonify({"error": "Internal server error"}), 500

    return app


app = create_app()

if __name__ == '__main__':

    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port, debug=True)