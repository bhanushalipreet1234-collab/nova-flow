# backend/security.py
import os
from cryptography.fernet import Fernet, InvalidToken
from dotenv import load_dotenv

load_dotenv()
FERNET_KEY = os.getenv("ENCRYPTION_KEY")
if not FERNET_KEY:
    raise RuntimeError("ENCRYPTION_KEY not set in environment")
fernet = Fernet(FERNET_KEY.encode())

def encrypt_text(plaintext: str) -> str:
    return fernet.encrypt(plaintext.encode()).decode()

def decrypt_text(token: str) -> str:
    try:
        return fernet.decrypt(token.encode()).decode()
    except InvalidToken:
        raise ValueError("Invalid encryption token")
