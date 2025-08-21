import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import "./NodeEditor.css";

function parseCurlCommand(curl: string) {
  try {
    const parts = curl.trim().split(/\s+/);
    let method = "GET";
    let url = "";
    let headers: Record<string, string> = {};
    let body: string | undefined = undefined;

    for (let i = 0; i < parts.length; i++) {
      if (parts[i].toLowerCase() === "curl") {
        url = parts[i + 1]?.replace(/['"]/g, "") || "";
      } else if (parts[i] === "-X" || parts[i] === "--request") {
        method = parts[i + 1]?.toUpperCase() || "GET";
      } else if (parts[i] === "-H" || parts[i] === "--header") {
        const [key, ...rest] = (parts[i + 1] || "").split(":");
        headers[key.trim()] = rest.join(":").trim();
      } else if (parts[i] === "-d" || parts[i] === "--data" || parts[i] === "--data-raw") {
        body = parts[i + 1]?.replace(/['"]/g, "");
      }
    }

    return { method, url, headers, body };
  } catch (err) {
    console.error("Failed to parse curl:", err);
    return { method: "GET", url: "", headers: {}, body: "" };
  }
}

export default function HttpNode({ id, data }: any) {
  const [showDialog, setShowDialog] = useState(false);
  const [curlInput, setCurlInput] = useState("");

  const handleParse = () => {
    const parsed = parseCurlCommand(curlInput);
    data.method = parsed.method;
    data.url = parsed.url;
    data.headers = parsed.headers;
    data.body = parsed.body;
    setShowDialog(false);
  };

  return (
    <div className="node http-node">
      <Handle type="target" position={Position.Top} />
      <div className="node-content">
        <h4>HTTP Node</h4>
        <p><strong>{data.method || "GET"}</strong> {data.url || "No URL set"}</p>
        <button className="btn-small" onClick={() => setShowDialog(true)}>⚙️ Configure (curl)</button>
      </div>
      <Handle type="source" position={Position.Bottom} />

      {showDialog && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Paste curl command</h3>
            <textarea
              value={curlInput}
              onChange={(e) => setCurlInput(e.target.value)}
              rows={6}
              style={{ width: "100%" }}
              placeholder='e.g. curl -X POST "https://api.example.com" -H "Content-Type: application/json" -d "{ \"foo\": \"bar\" }"'
            />
            <div className="modal-actions">
              <button onClick={handleParse}>Apply</button>
              <button onClick={() => setShowDialog(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
