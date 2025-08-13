# backend/nodes/openai_node.py
import aiohttp
from typing import Dict, Any
from ..utils import get_logger

logger = get_logger("OpenAINode")

class OpenAINode:
    def __init__(self, api_key: str = None):
        self.api_key = api_key
        if not self.api_key:
            logger.warning("OpenAINode created without api_key; calls will likely fail or be rate-limited.")

    async def run(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        params can include:
          - model: "gpt-4o" or "gpt-4o-mini"
          - prompt or messages
          - temperature, max_tokens, etc.
        """
        if not self.api_key:
            return {"error": "no_openai_api_key"}

        model = params.get("model", "gpt-4o-mini")
        prompt = params.get("prompt") or (params.get("input") or {}).get("text") or "Hello"
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": params.get("temperature", 0.7)
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        async with aiohttp.ClientSession() as session:
            try:
                async with session.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers) as resp:
                    text = await resp.text()
                    try:
                        data = await resp.json()
                    except Exception:
                        data = {"raw": text}
                    return {"status": resp.status, "data": data}
            except Exception as e:
                logger.exception("OpenAI request failed")
                return {"error": str(e)}
