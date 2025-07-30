// NovaFlow Frontend: Production-ready App.tsx
// Location: /frontend/src/App.tsx

import React, { useCallback, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlowInstance,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  MarkerType
} from "reactflow";
import "reactflow/dist/style.css";
import { nanoid } from "nanoid";
import { toast } from "react-hot-toast";
import AiNode from "./nodes/AiNode";
import HttpNode from "./nodes/HttpNode";
import "./index.css";

const initialNodes = [
  {
    id: "1",
    type: "input",
    data: { label: "Start" },
    position: { x: 250, y: 5 }
  }
];

const initialEdges = [];

const nodeTypes = {
  "AI Prompt": AiNode,
  "HTTP Request": HttpNode
};

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [loading, setLoading] = useState(false);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds)
      ),
    []
  );

  const addNode = (type: string) => {
    const id = nanoid();
    const newNode = {
      id,
      type,
      data: { label: type },
      position: { x: Math.random() * 400, y: Math.random() * 400 }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleSave = async () => {
    if (!reactFlowInstance) return;
    try {
      setLoading(true);
      const flow = reactFlowInstance.toObject();
      const res = await fetch("https://nova-backend.onrender.com/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "workflow-1", graph: flow })
      });
      const json = await res.json();
      toast.success("Workflow saved: " + json.id);
    } catch (err) {
      toast.error("Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!reactFlowInstance) return;
    try {
      setLoading(true);
      const flow = reactFlowInstance.toObject();
      const res = await fetch("https://nova-backend.onrender.com/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "workflow-1", graph: flow })
      });
      const json = await res.json();
      const workflowId = json.id;

      const execRes = await fetch(
        `https://nova-backend.onrender.com/api/workflows/${workflowId}/execute`,
        { method: "POST" }
      );
      const execJson = await execRes.json();
      toast.success("Execution Complete");
      console.log("Log:", execJson.log);
    } catch (err) {
      toast.error("Execution failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReactFlowProvider>
      <div className="w-full h-screen">
        <div className="flex gap-2 p-2 bg-gray-100">
          <button
            onClick={() => addNode("HTTP Request")}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            + HTTP Node
          </button>
          <button
            onClick={() => addNode("AI Prompt")}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            + AI Node
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-gray-800 text-white px-3 py-1 rounded"
          >
            💾 Save
          </button>
          <button
            onClick={handleExecute}
            disabled={loading}
            className="bg-purple-600 text-white px-3 py-1 rounded"
          >
            ⚙️ Execute
          </button>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          fitView
          nodeTypes={nodeTypes}
        >
          <MiniMap />
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}
