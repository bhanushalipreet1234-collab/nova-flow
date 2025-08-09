# backend/routes/node_keys.py
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..db import SessionLocal
from ..models import NodeKey
from ..security import encrypt_text, decrypt_text

router = APIRouter(prefix="/node-keys", tags=["node-keys"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class NodeKeyIn(BaseModel):
    node_id: str
    service_name: str = None
    api_key: str

@router.post("/save")
def save_node_key(payload: NodeKeyIn, db: Session = Depends(get_db), x_user_id: str = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=400, detail="X-User-Id header required")
    encrypted = encrypt_text(payload.api_key)
    row = db.query(NodeKey).filter(NodeKey.node_id == payload.node_id, NodeKey.user_id == x_user_id).one_or_none()
    if row:
        row.encrypted_key = encrypted
        row.service_name = payload.service_name or row.service_name
    else:
        row = NodeKey(node_id=payload.node_id, user_id=x_user_id, service_name=payload.service_name or "", encrypted_key=encrypted)
        db.add(row)
    db.commit()
    return {"status": "ok", "node_id": payload.node_id}

@router.get("/get/{node_id}")
def get_node_key(node_id: str, db: Session = Depends(get_db), x_user_id: str = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=400, detail="X-User-Id header required")
    row = db.query(NodeKey).filter(NodeKey.node_id == node_id, NodeKey.user_id == x_user_id).one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="node key not found")
    try:
        key = decrypt_text(row.encrypted_key)
    except Exception:
        raise HTTPException(status_code=500, detail="decryption failed")
    return {"node_id": node_id, "service_name": row.service_name, "api_key": key}
