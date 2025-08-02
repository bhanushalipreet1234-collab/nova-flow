// NovaFlow Frontend: Editor.tsx (enhanced layout like n8n)
import React, { useCallback, useState } from "react";
import { BackgroundVariant } from 'reactflow';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  Node,
  Edge,
  Connection,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

const initialNodes: Node[] = [
  {
    id: "1",
    type: "default",
    position: { x: 100, y: 100 },
    data: { label: "Start" },
  },
];

const initialEdges: Edge[] = [];

const availableNodes = [
  { type: "default", label: "Default Node" },
  { type: "ai", label: "AI Node" },
  { type: "http", label: "HTTP Node" },
  { type: "delay", label: "Delay Node" },
];

export default function Editor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [id, setId] = useState(2);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("application/reactflow");
    const position = (e.target as HTMLDivElement).getBoundingClientRect();
    const newNode = {
      id: `${id}`,
      type: "default",
      position: {
        x: e.clientX - position.left,
        y: e.clientY - position.top,
      },
      data: { label: `${type} Node` },
    };
    setNodes((nds) => [...nds, newNode]);
    setId((prev) => prev + 1);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top Navbar */}
      <div className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
        <div className="text-xl font-semibold">NovaFlow</div>
        <div className="space-x-4">
          <button className="bg-gray-700 px-3 py-1 rounded">Editor</button>
          <button className="bg-gray-700 px-3 py-1 rounded">Executions</button>
          <button className="bg-blue-600 px-3 py-1 rounded">Save</button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-2">Nodes</h2>
          {availableNodes.map((node) => (
            <div
              key={node.type}
              draggable
              onDragStart={(e) =>
                e.dataTransfer.setData("application/reactflow", node.type)
              }
              className="cursor-move bg-blue-100 hover:bg-blue-200 p-2 rounded mb-2 text-sm text-center"
            >
              {node.label}
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div
          className="flex-1 relative bg-gray-50"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <MiniMap />
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>

        {/* Right Panel */}
        <div className="w-72 bg-white border-l p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-3">What happens next?</h2>
          <ul className="text-sm space-y-2">
            <li className="font-medium">🤖 AI: Build autonomous agents</li>
            <li className="font-medium">⚙️ Action: Trigger apps like Google, Slack</li>
            <li className="font-medium">🧠 Transform: Format or validate data</li>
            <li className="font-medium">🔁 Flow: Loops, branches, conditions</li>
            <li className="font-medium">👨‍💼 Human: Approvals or manual review</li>
            <li className="font-medium">⏱ Trigger: Start the flow</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
