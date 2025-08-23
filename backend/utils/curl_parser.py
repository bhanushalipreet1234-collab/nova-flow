# backend/utils/curl_parser.py
import re
import json
from typing import Dict, Any

def parse_curl_command(curl_command: str) -> Dict[str, Any]:
    """
    Parse cURL command into request parameters
    """
    # Extract HTTP method
    method_match = re.search(r'-X\s+(\w+)', curl_command)
    method = method_match.group(1).upper() if method_match else "GET"

    # Extract URL
    url_match = re.search(r"'(https?://[^']+)'", curl_command) or re.search(r'"(https?://[^"]+)"', curl_command)
    if not url_match:
        url_match = re.search(r'https?://[^\s]+', curl_command)
    url = url_match.group(0) if url_match else None

    if not url:
        raise ValueError("No URL found in cURL command")

    # Extract headers
    headers = {}
    header_matches = re.findall(r"-H\s+'([^']+)'", curl_command) + re.findall(r'-H\s+"([^"]+)"', curl_command)
    for header in header_matches:
        if ':' in header:
            key, value = header.split(':', 1)
            headers[key.strip()] = value.strip()

    # Extract body data
    body = None
    data_match = re.search(r"-d\s+'([^']+)'", curl_command) or re.search(r'--data\s+\'([^\']+)\'', curl_command)
    if data_match:
        try:
            body = json.loads(data_match.group(1))
        except json.JSONDecodeError:
            body = data_match.group(1)

    return {
        "method": method,
        "url": url,
        "headers": headers,
        "body": body
    }
