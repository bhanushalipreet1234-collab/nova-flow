import React from "react";
import { Handle, Position } from "reactflow";
import "reactflow/dist/style.css";

const AiNode = ({ data }) => {
  return (
    <div className="p-4 bg-green-100 border-2 border-green-500 rounded-md shadow-md w-64">
      <Handle type="target" position={Position.Top} />
      <div className="text-green-800 font-semibold mb-2">🤖 AI Prompt</div>
      <textarea
        className="w-full p-2 text-sm border rounded"
        placeholder="Enter AI prompt here"
        defaultValue={data.prompt}
      />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default AiNode;