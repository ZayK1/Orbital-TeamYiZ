from pymongo import MongoClient
from config import MONGO_URI
from werkzeug.exceptions import BadRequest
from bson.objectid import ObjectId

client = MongoClient(MONGO_URI)  
db = client.get_default_database()  

def get_users_collection():
    return db["users"]  

users_col = get_users_collection()
users_col.create_index("username", unique=True)
users_col.create_index("email", unique=True)

class User:
    @staticmethod
    def create(username: str, email: str, password_hash: str):
        try:
            result = users_col.insert_one({
                "username": username,
                "email": email,
                "password_hash": password_hash
            })
            return str(result.inserted_id)
        except Exception as e:
            if "duplicate key" in str(e).lower():
                raise ValueError("Username or email already exists")
            raise

    @staticmethod
    def find_by_username_or_email(identifier: str):
        doc = users_col.find_one({
            "$or": [
                {"username": identifier},
                {"email": identifier}
            ]
        })
        return doc

    @staticmethod
    def find_by_id(user_id: str):
        try:
            doc = users_col.find_one({"_id": ObjectId(user_id)})
            return doc
        except:
            return None
