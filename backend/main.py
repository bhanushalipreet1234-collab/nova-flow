# /backend/main.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from uuid import uuid4
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI()

# Allow frontend CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to your frontend domain in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store
WORKFLOWS: Dict[str, Dict] = {}

# Pydantic Models
class Node(BaseModel):
    id: str
    type: str
    data: dict
    position: Optional[dict]

class Edge(BaseModel):
    id: Optional[str]
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

class Workflow(BaseModel):
    name: str
    graph: dict  # contains "nodes" and "edges"

# Save workflow
@app.post("/api/workflows")
async def save_workflow(workflow: Workflow):
    workflow_id = str(uuid4())
    WORKFLOWS[workflow_id] = {
        "id": workflow_id,
        "name": workflow.name,
        "graph": workflow.graph,
        "log": []
    }
    return {"id": workflow_id}

# Get workflow by ID
@app.get("/api/workflows/{workflow_id}")
async def get_workflow(workflow_id: str):
    wf = WORKFLOWS.get(workflow_id)
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return wf

# Execute a workflow
@app.post("/api/workflows/{workflow_id}/execute")
async def execute_workflow(workflow_id: str):
    wf = WORKFLOWS.get(workflow_id)
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")

    nodes = {node["id"]: node for node in wf["graph"]["nodes"]}
    edges = wf["graph"]["edges"]

    execution_order = resolve_execution_order(nodes, edges)
    log = []

    for node_id in execution_order:
        node = nodes[node_id]
        if node["type"] == "HTTP Request":
            try:
                method = node["data"].get("method", "GET")
                url = node["data"].get("url", "")
                async with httpx.AsyncClient() as client:
                    resp = await client.request(method, url)
                    log.append(f"[HTTP] {method} {url} -> {resp.status_code}")
            except Exception as e:
                log.append(f"[ERROR] HTTP Request failed: {str(e)}")

        elif node["type"] == "AI Prompt":
            try:
                prompt = node["data"].get("prompt", "")
                # Simulate AI response (replace with OpenAI API later)
                response = f"Simulated response to: {prompt}"
                log.append(f"[AI] {prompt} => {response}")
            except Exception as e:
                log.append(f"[ERROR] AI Prompt failed: {str(e)}")

        else:
            log.append(f"[WARN] Unknown node type: {node['type']}")

    wf["log"] = log
    return {"log": log}

# Helper: Determine execution order from edges
def resolve_execution_order(nodes: dict, edges: list) -> List[str]:
    from collections import defaultdict, deque

    graph = defaultdict(list)
    in_degree = {node_id: 0 for node_id in nodes}

    for edge in edges:
        src = edge["source"]
        tgt = edge["target"]
        graph[src].append(tgt)
        in_degree[tgt] += 1

    queue = deque([n for n in nodes if in_degree[n] == 0])
    order = []

    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return order
