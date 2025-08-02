// NovaFlow Frontend: Editor.tsx (with drag-and-drop sidebar and custom node types)
// Location: /frontend/src/Editor.tsx

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

  const onConnect = useCallback((connection: Connection) => {
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
  }, [setEdges]);

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
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r p-4">
        <h2 className="text-lg font-semibold mb-2">Nodes</h2>
        {availableNodes.map((node) => (
          <div
            key={node.type}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("application/reactflow", node.type)}
            className="cursor-move bg-blue-100 hover:bg-blue-200 p-2 rounded mb-2 text-sm text-center"
          >
            {node.label}
          </div>
        ))}
      </div>

      {/* Canvas */}
      <div className="flex-1 h-screen" onDrop={handleDrop} onDragOver={handleDragOver}>
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
    </div>
  );
}
