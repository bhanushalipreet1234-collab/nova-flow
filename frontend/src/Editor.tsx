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

      const position = { x: event.clientX - 250, y: event.clientY - 100 }; // Adjust to center on mouse
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

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {/* Backend URL Config */}
      <div style={{ padding: "10px", background: "#111", color: "#fff" }}>
        <label style={{ marginRight: "10px" }}>Backend URL:</label>
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
      </div>

      {/* React Flow Canvas */}
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
  );
}
