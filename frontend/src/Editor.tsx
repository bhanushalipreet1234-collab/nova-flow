import React, { useCallback, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap
} from "reactflow";
import "reactflow/dist/style.css";

const initialNodes = [];
const initialEdges = [];

export default function Editor() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");

  // Load from env but allow manual override
  const [backendUrl, setBackendUrl] = useState(
    import.meta.env.VITE_EXECUTE_URL || "http://localhost:8000"
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData("application/reactflow");
      if (!nodeType) return;

      const position = { x: event.clientX - 250, y: event.clientY - 100 };
      const newNode = {
        id: `${+new Date()}`,
        type: "default",
        position,
        data: { label: `${nodeType} Node` }
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const runFlow = async () => {
    try {
      setIsRunning(true);
      setOutput("Running flow...");

      const res = await fetch(`${backendUrl}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, edges })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setOutput(JSON.stringify(data, null, 2));
    } catch (err) {
      setOutput(`❌ Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ height: "100vh", width: "100%", display: "flex", flexDirection: "column" }}>
      {/* Backend URL Config + Run Flow */}
      <div style={{ padding: "10px", background: "#111", color: "#fff", display: "flex", gap: "10px", alignItems: "center" }}>
        <label>Backend URL:</label>
        <input
          value={backendUrl}
          onChange={(e) => setBackendUrl(e.target.value)}
          style={{
            padding: "5px",
            width: "300px",
            borderRadius: "4px",
            border: "1px solid #555"
          }}
        />
        <button
          onClick={runFlow}
          disabled={isRunning}
          style={{
            padding: "6px 14px",
            background: isRunning ? "#555" : "#0d6efd",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: isRunning ? "not-allowed" : "pointer"
          }}
        >
          {isRunning ? "Running..." : "Run Flow"}
        </button>
      </div>

      {/* React Flow Canvas */}
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      {/* Output Console */}
      <div style={{
        background: "#000",
        color: "#0f0",
        fontFamily: "monospace",
        padding: "10px",
        height: "150px",
        overflowY: "auto",
        whiteSpace: "pre-wrap"
      }}>
        {output}
      </div>
    </div>
  );
}
