# main.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any
import uuid
import httpx
import openai
import os

app = FastAPI()

# Simulated DB
WORKFLOWS: Dict[str, Dict[str, Any]] = {}

# ENV: Set your keys here
openai.api_key = os.getenv("OPENAI_API_KEY")


class WorkflowRequest(BaseModel):
    name: str
    graph: Dict[str, Any]


@app.post("/api/workflows")
def save_workflow(req: WorkflowRequest):
    workflow_id = str(uuid.uuid4())
    WORKFLOWS[workflow_id] = {
        "id": workflow_id,
        "name": req.name,
        "graph": req.graph
    }
    return {"id": workflow_id}


@app.post("/api/workflows/{workflow_id}/execute")
async def execute_workflow(workflow_id: str):
    if workflow_id not in WORKFLOWS:
        raise HTTPException(status_code=404, detail="Workflow not found")

    graph = WORKFLOWS[workflow_id]["graph"]
    nodes = {node["id"]: node for node in graph["nodes"]}
    edges = graph["edges"]
    results = {}
    visited = set()
    log = []

    # Build adjacency map
    adj_map = {node_id: [] for node_id in nodes}
    for edge in edges:
        source = edge["source"]
        target = edge["target"]
        adj_map[source].append(target)

    # Start from input node (type: input)
    start_node = next((n for n in nodes.values() if n["type"] == "input"), None)
    if not start_node:
        raise HTTPException(status_code=400, detail="No start node found")

    async def execute_node(node_id, context):
        if node_id in visited:
            return
        visited.add(node_id)

        node = nodes[node_id]
        node_type = node["type"]
        data = node.get("data", {})
        result = None

        try:
            if node_type == "HTTP Request":
                method = data.get("method", "GET").upper()
                url = data.get("url")
                if not url:
                    raise ValueError("Missing URL")

                async with httpx.AsyncClient() as client:
                    if method == "GET":
                        response = await client.get(url)
                    elif method == "POST":
                        response = await client.post(url, json=context)
                    else:
                        raise ValueError("Unsupported method")
                    result = response.text

            elif node_type == "AI Prompt":
                prompt = data.get("prompt", "")
                if not prompt:
                    raise ValueError("Missing prompt")

                response = await openai.ChatCompletion.acreate(
                    model="gpt-4",
                    messages=[{"role": "user", "content": prompt}]
                )
                result = response.choices[0].message["content"]

            log.append(f"{node_type} Node ({node_id}): Success")
            results[node_id] = result

            for neighbor in adj_map[node_id]:
                await execute_node(neighbor, result)

        except Exception as e:
            log.append(f"{node_type} Node ({node_id}): Failed - {str(e)}")

    await execute_node(start_node["id"], {})

    return {
        "status": "executed",
        "results": results,
        "log": log
    }
