# inside executor.py
from .db import SessionLocal
from .models import NodeKey
from .security import decrypt_text

def fetch_node_key_sync(user_id: str, node_id: str) -> str | None:
    db = SessionLocal()
    try:
        r = db.query(NodeKey).filter(NodeKey.user_id == user_id, NodeKey.node_id == node_id).one_or_none()
        if not r:
            return None
        return decrypt_text(r.encrypted_key)
    finally:
        db.close()

# when instantiating node impl inside execute_graph loop:
node_specific_key = fetch_node_key_sync(user_id, nid)  # nid is node id
if node_specific_key:
    # pass it into node impl if node supports it (check type or constructor)
    impl = ImplClass(node_specific_key)  # many nodes accept api_key as first arg in examples
else:
    # fallback to user global keys or env
    ...

from .nodes.http_node import HTTPNode

NODE_REGISTRY = {
    "http": HTTPNode,
}

