from dotenv import load_dotenv
import os

load_dotenv()  
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/skillplan_db")
BCRYPT_ROUNDS = int(os.getenv("BCRYPT_ROUNDS", 12))

if not OPENAI_API_KEY:
    raise RuntimeError("Missing OPENAI_API_KEY in environment")
