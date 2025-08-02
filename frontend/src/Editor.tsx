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
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(false);

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

  const onNodeClick = (_: any, node: Node) => {
    setSelectedNode(node);
  };

  const runExecutionPreview = () => {
    const logs = nodes.map((node, index) => `Executed node ${node.data.label} [${index + 1}]`);
    setExecutionLogs(logs);
  };

  return (
    <div className={darkMode ? "dark bg-gray-900 text-white" : "bg-white text-black"}>
      {/* Top Navbar */}
      <div className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
        <div className="text-xl font-semibold">NovaFlow</div>
        <div className="space-x-4">
          <button className="bg-blue-700 px-3 py-1 rounded">Editor</button>
          <button className="bg-gray-700 px-3 py-1 rounded">Executions</button>
          <button className="bg-green-600 px-3 py-1 rounded" onClick={runExecutionPreview}>▶ Run Preview</button>
          <button className="bg-blue-600 px-3 py-1 rounded">Save</button>
          <button className="bg-yellow-500 px-3 py-1 rounded" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-3rem)]">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r p-4 overflow-y-auto">
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
        <div className="flex-1 relative bg-gray-50" onDrop={handleDrop} onDragOver={handleDragOver}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
          >
            <MiniMap />
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>

          {/* Floating Toolbar */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
            <button className="bg-red-500 text-white px-4 py-2 rounded">Test Workflow</button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded">Undo</button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded">Redo</button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 bg-white border-l p-4 overflow-y-auto">
          {/* Node Inspector */}
          {selectedNode ? (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Node Settings</h2>
              <div className="text-sm space-y-2">
                <div>
                  <label className="block font-medium">Label:</label>
                  <input
                    className="w-full border px-2 py-1 rounded"
                    value={selectedNode.data.label}
                    onChange={(e) => {
                      const updated = nodes.map((n) =>
                        n.id === selectedNode.id
                          ? { ...n, data: { ...n.data, label: e.target.value } }
                          : n
                      );
                      setNodes(updated);
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6">
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
          )}

          {/* Execution Preview */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Execution Preview</h2>
            <ul className="text-sm list-disc ml-4 space-y-1">
              {executionLogs.map((log, index) => (
                <li key={index}>{log}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
