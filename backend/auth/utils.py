import bcrypt
from config import BCRYPT_ROUNDS

def hash_password(plaintext_password: str) -> str:

    salt = bcrypt.gensalt(BCRYPT_ROUNDS)
    hashed = bcrypt.hashpw(plaintext_password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def check_password(plaintext_password: str, password_hash: str) -> bool:

    try:
        return bcrypt.checkpw(
            plaintext_password.encode("utf-8"),
            password_hash.encode("utf-8")
        )
    except:
        return False
