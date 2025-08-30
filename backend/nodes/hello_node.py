from .base_node import BaseNode

class HelloNode(BaseNode):
    def run(self, params: dict) -> dict:
        name = params.get("name", "World")
        return {"message": f"Hello, {name}!"}
