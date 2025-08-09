import os
import asyncio
from typing import List, Dict, Any
from collections import defaultdict, deque
from .db import SessionLocal
from .models import UserKey
from .security import decrypt_text
from .utils import get_logger

logger = get_logger("Executor")

# Simple registry placeholder
from .nodes.weather import WeatherNode
from .nodes.http_request import HTTPRequestNode

async def fetch_user_key(user_id: str, service: str):
    db = SessionLocal()
    try:
        row = db.query(UserKey).filter(UserKey.user_id == user_id, UserKey.service == service).one_or_none()
        if not row:
            return None
        return decrypt_text(row.encrypted_key)
    finally:
        db.close()

NODE_REGISTRY = {
    "weatherNode": WeatherNode,  # class (we will instantiate per-run with user key)
    "httpRequest": HTTPRequestNode
}

async def execute_graph(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]], user_id: str):
    # build graph
    adj = defaultdict(list)
    indeg = {n["id"]: 0 for n in nodes}
    for e in edges:
        src = e["source"]
        tgt = e["target"]
        adj[src].append(tgt)
        indeg[tgt] = indeg.get(tgt, 0) + 1

    q = deque([nid for nid, d in indeg.items() if d == 0])
    order = []
    while q:
        cur = q.popleft()
        order.append(cur)
        for nb in adj[cur]:
            indeg[nb] -= 1
            if indeg[nb] == 0:
                q.append(nb)

    if len(order) != len(nodes):
        return {"error": "graph cycle or disconnected"}

    node_map = {n["id"]: n for n in nodes}
    outputs = {}

    for nid in order:
        node = node_map[nid]
        ntype = node.get("type")
        data = node.get("data", {}) or {}

        preds = [e["source"] for e in edges if e["target"] == nid]
        input_payload = {}
        if len(preds) == 1:
            input_payload["input"] = outputs.get(preds[0])
        elif len(preds) > 1:
            input_payload["inputs"] = {p: outputs.get(p) for p in preds}
        input_payload.update(data)

        logger.info(f"Running node {nid} type {ntype}")

        Impl = NODE_REGISTRY.get(ntype)
        if not Impl:
            outputs[nid] = {"error": "no_impl"}
            continue

        # If node needs a user key (e.g., OpenAI), try to fetch and pass into ctor
        if ntype == "weatherNode":
            # weather uses OPENWEATHER key; prefer user-supplied
            user_key = await fetch_user_key(user_id, "openweather")
            api_key = user_key or os.getenv("OPENWEATHER_API_KEY")
            impl = Impl(api_key)
        elif ntype == "httpRequest":
            impl = Impl()
        else:
            impl = Impl()

        try:
            result = await impl.run(input_payload)
            outputs[nid] = result
        except Exception as e:
            logger.exception("node failed")
            outputs[nid] = {"error": str(e)}

    return outputs