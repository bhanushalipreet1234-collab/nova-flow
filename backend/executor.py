# backend/executor.py
import os
import asyncio
from typing import List, Dict, Any
from collections import defaultdict, deque
from .utils import get_logger

# Import key helper
from .key_utils import get_user_api_key

logger = get_logger("Executor")

# Import node classes (example)
from .nodes.weather import WeatherNode       # expects (api_key) in ctor
from .nodes.http_request import HTTPRequestNode
from .nodes.openai_node import OpenAINode    # expects (api_key) in ctor

# Registry maps node type -> class
NODE_REGISTRY = {
    "weatherNode": WeatherNode,
    "httpRequest": HTTPRequestNode,
    "openai": OpenAINode,
    # add more node types here...
}

async def execute_graph(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]], user_id: str):
    """
    nodes: [{ id, type, data }]
    edges: [{ id, source, target }]
    user_id: str (from X-User-Id header)
    returns: dict mapping node_id -> output
    """
    # Build adjacency and indegree
    adj = defaultdict(list)
    indeg = {n["id"]: 0 for n in nodes}
    for e in edges:
        src = e["source"]
        tgt = e["target"]
        adj[src].append(tgt)
        indeg[tgt] = indeg.get(tgt, 0) + 1

    # Kahn's algorithm
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
        logger.error("Graph has cycles or disconnected components")
        return {"error": "graph has cycles or disconnected components", "order_len": len(order), "nodes_len": len(nodes)}

    node_map = {n["id"]: n for n in nodes}
    outputs = {}

    for nid in order:
        node = node_map[nid]
        ntype = node.get("type")
        data = node.get("data", {}) or {}

        # Build input payload from predecessors
        preds = [e["source"] for e in edges if e["target"] == nid]
        input_payload = {}
        if len(preds) == 1:
            input_payload["input"] = outputs.get(preds[0])
        elif len(preds) > 1:
            input_payload["inputs"] = {p: outputs.get(p) for p in preds}
        # merge node.data (explicit params)
        input_payload.update(data)

        logger.info(f"Running node {nid} type {ntype} with keys: {list(input_payload.keys())}")

        ImplClass = NODE_REGISTRY.get(ntype)
        if not ImplClass:
            logger.warning(f"No implementation for node type '{ntype}'")
            outputs[nid] = {"error": f"no_impl_for_{ntype}"}
            continue

        # ===== Instantiate implementation with per-user keys if needed =====
        impl = None
        try:
            if ntype == "weatherNode":
                # Look for user-provided openweather key first
                user_key = get_user_api_key(user_id, "openweather")
                api_key = user_key or os.getenv("OPENWEATHER_API_KEY")
                impl = ImplClass(api_key)
            elif ntype == "openai":
                # Look for user's OpenAI key
                user_key = get_user_api_key(user_id, "openai")
                api_key = user_key or os.getenv("OPENAI_API_KEY")
                if not api_key:
                    logger.warning(f"No OpenAI key found for user {user_id}")
                impl = ImplClass(api_key)
            else:
                # default ctor (no key)
                impl = ImplClass()
        except Exception as e:
            logger.exception(f"Failed to instantiate node {nid} ({ntype})")
            outputs[nid] = {"error": f"init_failed: {str(e)}"}
            continue

        # ===== Execute node =====
        run_coro = getattr(impl, "run", None)
        if not run_coro or not asyncio.iscoroutinefunction(run_coro):
            # support sync run also
            try:
                if callable(run_coro):
                    result = run_coro(input_payload)
                else:
                    result = {"error": "node_has_no_run_method"}
            except Exception as e:
                logger.exception("Node run failed (sync)")
                result = {"error": str(e)}
            outputs[nid] = result
            continue

        try:
            result = await run_coro(input_payload)
            outputs[nid] = result
        except Exception as e:
            logger.exception("Node run failed (async)")
            outputs[nid] = {"error": str(e)}
    return outputs
