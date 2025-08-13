from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..db import SessionLocal
from ..models import UserKey
from ..security import encrypt_text, decrypt_text

router = APIRouter()

# Simple DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class SaveKeyIn(BaseModel):
    service: str
    key: str

@router.post("/save-key")
def save_key(payload: SaveKeyIn, db: Session = Depends(get_db), x_user_id: str = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=400, detail="X-User-Id header required")
    encrypted = encrypt_text(payload.key)
    # upsert
    row = db.query(UserKey).filter(UserKey.user_id == x_user_id, UserKey.service == payload.service).one_or_none()
    if row:
        row.encrypted_key = encrypted
    else:
        row = UserKey(user_id=x_user_id, service=payload.service, encrypted_key=encrypted)
        db.add(row)
    db.commit()
    return {"status": "ok", "service": payload.service}

@router.get("/get-key/{service}")
def get_key(service: str, db: Session = Depends(get_db), x_user_id: str = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=400, detail="X-User-Id header required")
    row = db.query(UserKey).filter(UserKey.user_id == x_user_id, UserKey.service == service).one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="key not found")
    try:
        val = decrypt_text(row.encrypted_key)
    except ValueError:
        raise HTTPException(status_code=500, detail="decryption failed")
    return {"service": service, "key": val}