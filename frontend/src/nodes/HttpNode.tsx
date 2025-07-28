import React from "react";
import { Handle, Position } from "reactflow";
import "reactflow/dist/style.css";

const HttpNode = ({ data }) => {
  return (
    <div className="p-4 bg-blue-100 border-2 border-blue-500 rounded-md shadow-md w-64">
      <Handle type="target" position={Position.Top} />
      <div className="text-blue-800 font-semibold mb-2">🌐 HTTP Request</div>
      <input
        type="text"
        className="w-full p-2 text-sm border rounded"
        placeholder="https://api.example.com"
        defaultValue={data.url}
      />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default HttpNode;