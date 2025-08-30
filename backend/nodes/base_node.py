class BaseNode:
    def run(self, params: dict) -> dict:
        """Base method for all nodes"""
        raise NotImplementedError("Node must implement run()")
