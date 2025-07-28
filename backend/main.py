# main.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uuid
import requests
import openai

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

workflows = {}

# === Models ===
class Workflow(BaseModel):
    name: str
    graph: dict

# === Save workflow ===
@app.post("/api/workflows")
def save_workflow(workflow: Workflow):
    workflow_id = str(uuid.uuid4())
    workflows[workflow_id] = workflow.graph
    return {"id": workflow_id}

# === Execute workflow ===
@app.post("/api/workflows/{workflow_id}/execute")
def execute_workflow(workflow_id: str):
    if workflow_id not in workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")

    graph = workflows[workflow_id]
    nodes = {node["id"]: node for node in graph["nodes"]}
    edges = graph["edges"]

    # Build adjacency list
    from collections import defaultdict, deque

    adj = defaultdict(list)
    indegree = defaultdict(int)
    for edge in edges:
        src = edge["source"]
        tgt = edge["target"]
        adj[src].append(tgt)
        indegree[tgt] += 1

    # Topological sort
    q = deque([nid for nid in nodes if indegree[nid] == 0])
    execution_log = []
    context = {}

    while q:
        current = q.popleft()
        node = nodes[current]
        node_type = node["type"]
        label = node["data"].get("label", node_type)

        log_entry = f"Executing Node {label}"

        if node_type == "HTTP Request":
            url = node["data"].get("url", "https://api.publicapis.org/entries")
            try:
                res = requests.get(url)
                log_entry += f" → HTTP {res.status_code}"
                context[current] = res.text
            except Exception as e:
                log_entry += f" → Failed: {str(e)}"

        elif node_type == "AI Prompt":
            prompt = node["data"].get("prompt", "Say hello")
            try:
                openai.api_key = "sk-..."  # Replace with actual key
                response = openai.Completion.create(
                    engine="text-davinci-003", prompt=prompt, max_tokens=100
                )
                output = response.choices[0].text.strip()
                log_entry += f" → {output}"
                context[current] = output
            except Exception as e:
                log_entry += f" → AI Error: {str(e)}"

        else:
            log_entry += " → Skipped (Unknown type)"

        execution_log.append(log_entry)

        # Queue up next nodes
        for neighbor in adj[current]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                q.append(neighbor)

    return {"log": execution_log}
