import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import "../NodeEditor.css";

function parseCurlCommand(curl: string) {
  try {
    // Tokenize while respecting quotes
    const parts = curl.trim().match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    let method = "GET";
    let url = "";
    const headers: Record<string, string> = {};
    let body: string | undefined = undefined;

    for (let i = 0; i < parts.length; i++) {
      const tok = parts[i];

      // URL can be first arg after curl or any quoted https url token
      if (tok.toLowerCase() === "curl") {
        const candidate = parts[i+1] || "";
        if (candidate) url = candidate.replace(/^["']|["']$/g, "");
      } else if (!url && /^https?:\/\//i.test(tok)) {
        url = tok.replace(/^["']|["']$/g, "");
      }

      // Method
      if (tok === "-X" || tok === "--request") {
        method = (parts[i+1] || "GET").replace(/^["']|["']$/g, "").toUpperCase();
      }

      // Headers
      if (tok === "-H" || tok === "--header") {
        const raw = (parts[i+1] || "").replace(/^["']|["']$/g, "");
        const idx = raw.indexOf(":");
        if (idx > -1) {
          const k = raw.slice(0, idx).trim();
          const v = raw.slice(idx + 1).trim();
          headers[k] = v;
        }
      }

      // Body
      if (tok === "-d" || tok === "--data" || tok === "--data-raw" || tok === "--data-binary") {
        body = (parts[i+1] || "").replace(/^["']|["']$/g, "");
      }
    }

    return { method, url, headers, body };
  } catch (e) {
    console.error("curl parse error", e);
    return { method: "GET", url: "", headers: {}, body: "" };
  }
}

export default function HttpNode({ id, data }: any) {
  const [showDialog, setShowDialog] = useState(false);
  const [curlInput, setCurlInput] = useState("");

  const applyCurl = () => {
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
        <h4>HTTP Node 🚀</h4>
        <p><strong>{data?.method || "GET"}</strong> {data?.url || "No URL set"}</p>
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
              placeholder='e.g. curl "https://api.example.com/users" -X POST -H "Content-Type: application/json" -d "{\"foo\":\"bar\"}"'
            />
            <div className="modal-actions">
              <button onClick={applyCurl}>Apply</button>
              <button onClick={() => setShowDialog(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
