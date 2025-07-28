from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import uuid

app = FastAPI()

# Allow frontend connection (adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store (for dev)
workflows = {}

class Workflow(BaseModel):
    name: str
    graph: Dict[str, Any]

@app.post("/api/workflows")
def save_workflow(workflow: Workflow):
    workflow_id = str(uuid.uuid4())
    workflows[workflow_id] = workflow
    return {"id": workflow_id}

@app.get("/api/workflows/{workflow_id}")
def get_workflow(workflow_id: str):
    if workflow_id not in workflows:
        return {"error": "Workflow not found"}
    return workflows[workflow_id]

@app.post("/api/workflows/{workflow_id}/execute")
def execute_workflow(workflow_id: str):
    if workflow_id not in workflows:
        return {"error": "Workflow not found"}

    workflow = workflows[workflow_id]
    graph = workflow.graph
    nodes = graph.get("nodes", [])
    edges = graph.get("edges", [])

    execution_log = []
    for node in nodes:
        node_type = node["data"]["label"]
        node_id = node["id"]
        execution_log.append(f"Executed node {node_id} of type {node_type}")

    return {
        "status": "success",
        "workflow_id": workflow_id,
        "log": execution_log
    }