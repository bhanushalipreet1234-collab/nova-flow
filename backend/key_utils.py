# backend/key_utils.py
from typing import Optional
from .db import SessionLocal
from .models import APIKey

def get_user_api_key(user_id: str, service_name: str) -> Optional[str]:
    """
    Return the saved api_key for user_id + service_name or None if not present.
    This runs synchronously using SQLAlchemy session.
    """
    db = SessionLocal()
    try:
        row = db.query(APIKey).filter(APIKey.user_id == user_id, APIKey.service_name == service_name).one_or_none()
        if not row:
            return None
        return row.api_key
    finally:
        db.close()
