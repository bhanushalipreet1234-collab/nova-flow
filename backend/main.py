# backend/main.py
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import os

from .db import Base, engine
from .routes import api_keys   # ensure this points to your routes module name
from .executor import execute_graph

# Create DB tables (run on startup)
Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(api_keys.router)   # mount route prefix in router file

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# payload models as earlier...
class NodeModel(BaseModel):
    id: str
    type: str
    data: Dict[str, Any] = {}

class EdgeModel(BaseModel):
    id: str
    source: str
    target: str

class GraphPayload(BaseModel):
    nodes: List[NodeModel]
    edges: List[EdgeModel]

@app.post("/execute")
async def execute(payload: GraphPayload, x_user_id: str = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=400, detail="X-User-Id header required")
    result = await execute_graph([n.dict() for n in payload.nodes], [e.dict() for e in payload.edges], x_user_id)
    return {"outputs": result}
from .routes import node_keys, curl_api
app.include_router(node_keys.router)
app.include_router(curl_api.router)

