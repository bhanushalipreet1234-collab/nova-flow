from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..executor import NODE_REGISTRY

router = APIRouter(prefix="/nodes", tags=["nodes"])

class NodeExecuteRequest(BaseModel):
    type: str
    params: dict = {}

@router.post("/execute")
def execute_node(request: NodeExecuteRequest):
    node_cls = NODE_REGISTRY.get(request.type)
    if not node_cls:
        raise HTTPException(status_code=404, detail=f"Node type {request.type} not found")

    node = node_cls()
    result = node.run(request.params)
    return result
