# backend/nodes/http_node.py
import aiohttp
import json
from typing import Dict, Any
from ..utils import get_logger
from ..utils.curl_parser import parse_curl_command

logger = get_logger("HTTPNode")

class HTTPNode:
    def __init__(self, api_key: str = None):
        self.api_key = api_key

    async def run(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute HTTP request from cURL command or direct parameters
        """
        try:
            # Check if we have a cURL command
            curl_command = params.get("curl_command")
            if curl_command:
                request_params = parse_curl_command(curl_command)
            else:
                request_params = {
                    "method": params.get("method", "GET"),
                    "url": params.get("url"),
                    "headers": params.get("headers", {}),
                    "body": params.get("body")
                }

            # Add API key to headers if provided
            headers = request_params.get("headers", {})
            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"

            async with aiohttp.ClientSession() as session:
                request_kwargs = {
                    "url": request_params["url"],
                    "headers": headers,
                }

                # Add body data appropriately
                if request_params.get("body") is not None:
                    if isinstance(request_params["body"], dict):
                        request_kwargs["json"] = request_params["body"]
                    else:
                        request_kwargs["data"] = request_params["body"]

                async with session.request(
                    method=request_params["method"],
                    **request_kwargs
                ) as response:
                    response_text = await response.text()
                    
                    try:
                        response_data = json.loads(response_text)
                    except json.JSONDecodeError:
                        response_data = response_text

                    return {
                        "status": response.status,
                        "headers": dict(response.headers),
                        "data": response_data
                    }

        except Exception as e:
            logger.exception("HTTP request failed")
            return {"error": str(e)}
