from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import requests
import openai
import os
import uuid

openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory DB
workflows: Dict[str, Dict[str, Any]] = {}

class Workflow(BaseModel):
    name: str
    graph: Dict[str, Any]

@app.post("/api/workflows")
def save_workflow(workflow: Workflow):
    workflow_id = str(uuid.uuid4())
    workflows[workflow_id] = workflow.graph
    return {"id": workflow_id}

@app.post("/api/workflows/{workflow_id}/execute")
def execute_workflow(workflow_id: str):
    graph = workflows.get(workflow_id)
    if not graph:
        return {"error": "Workflow not found"}

    nodes = {node['id']: node for node in graph['nodes']}
    edges = graph['edges']

    # Build dependency graph
    from collections import defaultdict, deque
    inputs = defaultdict(list)
    for edge in edges:
        inputs[edge['target']].append(edge['source'])

    # Topological sort
    visited = set()
    order = []

    def dfs(node_id):
        if node_id in visited:
            return
        visited.add(node_id)
        for parent in inputs[node_id]:
            dfs(parent)
        order.append(node_id)

    for node_id in nodes:
        dfs(node_id)

    results = {}
    logs = []

    for node_id in order:
        node = nodes[node_id]
        node_type = node['type']
        label = node['data'].get('label', '')

        if node_type == 'AI Prompt':
            prompt = label
            try:
                response = openai.ChatCompletion.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant."},
                        {"role": "user", "content": prompt}
                    ]
                )
                result = response['choices'][0]['message']['content']
            except Exception as e:
                result = f"OpenAI Error: {str(e)}"

        elif node_type == 'HTTP Request':
            try:
                res = requests.get(label)
                result = res.text[:500]
            except Exception as e:
                result = f"HTTP Error: {str(e)}"

        else:
            result = f"Unsupported node type: {node_type}"

        results[node_id] = result
        logs.append(f"{node_type} [{node_id}] -> {result[:100]}...")

    return {"log": logs, "results": results}
