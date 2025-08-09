import React, { useState, useCallback } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  MiniMap,
  Controls,
  Background
} from "reactflow";
import "reactflow/dist/style.css";
import "./NodeEditor.css";

const initialNodesList = [
  { type: "httpRequest", label: "HTTP Request" },
  { type: "openai", label: "OpenAI GPT" },
  { type: "webhook", label: "Webhook" },
  { type: "database", label: "Database Query" },
  { type: "email", label: "Send Email" },
];

let id = 0;
const getId = () => `node_${id++}`;

function NodeEditor() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = event.target.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      if (!type) return;

      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode = {
        id: getId(),
        type: "default",
        position,
        data: { label: `${type} Node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const filteredNodes = initialNodesList.filter((node) =>
    node.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="node-editor-wrapper">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="node-list">
          {filteredNodes.map((node) => (
            <div
              key={node.type}
              className="node-item"
              onDragStart={(event) => onDragStart(event, node.label)}
              draggable
            >
              {node.label}
            </div>
          ))}
        </div>
      </aside>

      {/* Canvas */}
      <div className="canvas-area">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
          >
            <MiniMap />
            <Controls />
            <Background gap={16} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
}

export default NodeEditor;
