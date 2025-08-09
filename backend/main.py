from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import os
from .db import Base, engine
from .routes import settings
from .executor import execute_graph

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(settings.router, prefix="/api/settings")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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