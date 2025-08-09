import os
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any
from fastapi.middleware.cors import CORSMiddleware
from backend.executor import execute_graph

app = FastAPI(title="Nova Flow Executor")

# Allow your frontend origin; for local dev use http://localhost:3000 or your deployed domain
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "*"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
async def execute(payload: GraphPayload):
    result = await execute_graph([n.dict() for n in payload.nodes], [e.dict() for e in payload.edges])
    return {"outputs": result}
