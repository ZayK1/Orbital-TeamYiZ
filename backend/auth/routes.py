from flask import Blueprint, request, jsonify
from werkzeug.exceptions import BadRequest
from auth.models import User
from auth.utils import hash_password, check_password

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/auth")

@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json() or {}
    username = data.get("username", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not username or not email or not password:
        raise BadRequest("username, email, and password are required")

    pw_hash = hash_password(password)

    try:
        user_id = User.create(username, email, pw_hash)
        return jsonify({"message": "User created", "user_id": user_id}), 201
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 409
    except Exception as e:
        return jsonify({"error": "Server error"}), 500

@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json() or {}
    identifier = data.get("identifier", "").strip()
    password = data.get("password", "").strip()

    if not identifier or not password:
        raise BadRequest("identifier and password are required")

    user_doc = User.find_by_username_or_email(identifier)
    if not user_doc:
        return jsonify({"error": "Invalid credentials"}), 401

    if not check_password(password, user_doc["password_hash"]):
        return jsonify({"error": "Invalid credentials"}), 401

    user_safe = {
        "_id": str(user_doc["_id"]),
        "username": user_doc["username"],
        "email": user_doc["email"]
    }
    return jsonify({"message": "Login successful", "user": user_safe}), 200
