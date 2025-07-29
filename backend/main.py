# backend/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import httpx
import openai
import os
import uuid

# Load API Key securely
from dotenv import load_dotenv
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (use a database in production)
WORKFLOWS = {}

class NodeData(BaseModel):
    label: str

class Node(BaseModel):
    id: str
    type: str
    data: NodeData
    position: Dict[str, float]

class Edge(BaseModel):
    id: str = None
    source: str
    target: str

class Workflow(BaseModel):
    name: str
    graph: Dict[str, Any]  # contains 'nodes' and 'edges'

@app.post("/api/workflows")
def save_workflow(workflow: Workflow):
    workflow_id = str(uuid.uuid4())
    WORKFLOWS[workflow_id] = workflow.graph
    return {"id": workflow_id}

@app.post("/api/workflows/{workflow_id}/execute")
async def execute_workflow(workflow_id: str):
    graph = WORKFLOWS.get(workflow_id)
    if not graph:
        raise HTTPException(status_code=404, detail="Workflow not found")

    nodes = {node["id"]: node for node in graph["nodes"]}
    edges = graph.get("edges", [])
    execution_log = []

    # Build execution order based on edges
    visited = set()
    def dfs(node_id):
        if node_id in visited:
            return
        visited.add(node_id)
        for edge in edges:
            if edge["source"] == node_id:
                dfs(edge["target"])
        execution_order.append(node_id)

    execution_order = []
    start_nodes = [n for n in nodes.values() if n["type"] == "input"]
    for n in start_nodes:
        dfs(n["id"])
    execution_order.reverse()

    context = {}  # Store outputs from each node
    for node_id in execution_order:
        node = nodes[node_id]
        label = node["data"].get("label", "")
        result = None

        if label == "HTTP Request":
            try:
                url = node["data"].get("url", "https://api.github.com")
                method = node["data"].get("method", "GET")
                async with httpx.AsyncClient() as client:
                    resp = await client.request(method, url)
                    result = resp.text
                    execution_log.append(f"[HTTP] {method} {url} → {resp.status_code}")
            except Exception as e:
                result = str(e)
                execution_log.append(f"[HTTP] Error: {str(e)}")

        elif label == "AI Prompt":
            try:
                prompt = node["data"].get("prompt", "Say hello!")
                response = openai.ChatCompletion.create(
                    model="gpt-4",
                    messages=[{"role": "user", "content": prompt}]
                )
                result = response.choices[0].message["content"]
                execution_log.append(f"[AI] Prompt → {result[:60]}...")
            except Exception as e:
                result = str(e)
                execution_log.append(f"[AI] Error: {str(e)}")

        else:
            execution_log.append(f"[{label}] Skipped or unknown type")

        context[node_id] = result

    return {"log": execution_log, "outputs": context}
