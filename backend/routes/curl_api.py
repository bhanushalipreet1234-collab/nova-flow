# backend/routes/curl_api.py
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..db import SessionLocal
from ..nodes.http_node import HTTPNode
from ..executor import fetch_node_key_sync

router = APIRouter(prefix="/curl", tags=["curl"])

class CurlExecuteRequest(BaseModel):
    curl_command: str
    node_id: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/execute")
async def execute_curl(
    request: CurlExecuteRequest,
    db: Session = Depends(get_db),
    x_user_id: str = Header(None)
):
    if not x_user_id:
        raise HTTPException(status_code=400, detail="X-User-Id header required")
    
    try:
        # Get API key for this node if exists
        api_key = fetch_node_key_sync(x_user_id, request.node_id)
        
        # Create HTTP node and execute
        http_node = HTTPNode(api_key=api_key)
        result = await http_node.run({"curl_command": request.curl_command})
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to execute cURL: {str(e)}")
