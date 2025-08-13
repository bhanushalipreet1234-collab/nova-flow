import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useReactFlow
} from "reactflow";
import "reactflow/dist/style.css";
import "./NodeEditor.css";

const initialNodesList = [
  { type: "httpRequest", label: "HTTP Request" },
  { type: "openai", label: "OpenAI GPT" },
  { type: "weatherNode", label: "Weather" },
];

let id = 1;
const getId = () => `node_${id++}`;

function NodeEditor() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeApiKey, setNodeApiKey] = useState("");
  const [savingKey, setSavingKey] = useState(false);
  const reactFlowWrapperRef = useRef(null);
  const reactFlowInstanceRef = useRef(null);
  const userId = "demo_user_1"; // replace with real auth user id

  // used to access reactFlowInstance.project during drop
  const onInit = (rfInstance) => {
    reactFlowInstanceRef.current = rfInstance;
  };

  const onNodesChange = useCallback((newNodes) => setNodes(newNodes), []);
  const onEdgesChange = useCallback((newEdges) => setEdges(newEdges), []);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const reactFlowBounds = reactFlowWrapperRef.current.getBoundingClientRect();
    const type = event.dataTransfer.getData("application/reactflow");
    if (!type) return;

    const position = reactFlowInstanceRef.current.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    const newNode = {
      id: getId(),
      type: "default",
      position,
      data: { label: `${type} Node` },
      draggable: true,
    };
    setNodes((nds) => nds.concat(newNode));
    // deselect current selection and select new node
    setSelectedNode(newNode);
    setNodeApiKey("");
  }, []);

  // Fix: allow node dragging and persist node position in state
  const onNodeDragStop = useCallback((event, node) => {
    setNodes((nds) => nds.map((n) => (n.id === node.id ? { ...n, position: node.position } : n)));
  }, []);

  // Node click -> open right sidebar and fetch existing node key
  const onNodeClick = useCallback(async (event, node) => {
    setSelectedNode(node);
    setNodeApiKey("");
    // try to fetch existing key for this node
    try {
      const res = await fetch(`http://localhost:8000/node-keys/get/${encodeURIComponent(node.id)}`, {
        headers: { "X-User-Id": userId },
      });
      if (res.ok) {
        const data = await res.json();
        setNodeApiKey(data.api_key || "");
      } else {
        // no key saved — ignore
      }
    } catch (err) {
      console.error("fetch node key error", err);
    }
  }, []);

  const saveNodeKey = useCallback(async () => {
    if (!selectedNode) return;
    setSavingKey(true);
    try {
      const res = await fetch("http://localhost:8000/node-keys/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Id": userId },
        body: JSON.stringify({
          node_id: selectedNode.id,
          service_name: selectedNode.data?.label || "custom",
          api_key: nodeApiKey,
        }),
      });
      if (!res.ok) {
        const e = await res.text();
        alert("Save failed: " + e);
      } else {
        alert("Node key saved");
      }
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setSavingKey(false);
    }
  }, [selectedNode, nodeApiKey]);

  const filteredNodes = initialNodesList.filter((n) => n.label.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="node-editor-wrapper">
      <aside className="sidebar">
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="node-list">
          {filteredNodes.map((n) => (
            <div
              key={n.type}
              className="node-item"
              onDragStart={(event) => onDragStart(event, n.type)}
              draggable
            >
              {n.label}
            </div>
          ))}
        </div>
      </aside>

      <div className="canvas-area" ref={reactFlowWrapperRef}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onInit={onInit}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeDragStop={onNodeDragStop}
            onNodeClick={onNodeClick}
            fitView
            nodesDraggable={true}
            nodesConnectable={true}
          >
            <MiniMap />
            <Controls />
            <Background gap={16} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      {/* Right sidebar: node properties + API key editor */}
      <div className="right-panel">
        {selectedNode ? (
          <>
            <h3>Node: {selectedNode.id}</h3>
            <p><strong>Type:</strong> {selectedNode.data?.label || "unknown"}</p>
            <label>API Key for this node</label>
            <input
              type="password"
              value={nodeApiKey}
              onChange={(e) => setNodeApiKey(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 8 }}
            />
            <button onClick={saveNodeKey} disabled={savingKey} style={{ padding: "8px 12px" }}>
              {savingKey ? "Saving..." : "Save Key to Node"}
            </button>

            <hr />
            <button onClick={() => { setSelectedNode(null); setNodeApiKey(""); }}>Close</button>
          </>
        ) : (
          <div style={{ padding: 12 }}>Select a node to see properties</div>
        )}
      </div>
    </div>
  );
}

export default NodeEditor;
