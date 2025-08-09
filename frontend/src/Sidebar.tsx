import React, { useState } from "react";
import { nodeTypesList } from "./nodes/nodetype";
export default function Sidebar() {
  const [search, setSearch] = useState("");

  const filtered = nodeTypesList.filter(node =>
    node.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside style={{ width: 250, padding: 10, borderRight: "1px solid #ccc", background: "#fafafa" }}>
      <input
        style={{ width: "100%", marginBottom: 10, padding: 5 }}
        placeholder="Search nodes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {filtered.map((node) => (
        <div
          key={node.type}
          style={{
            padding: 8,
            marginBottom: 5,
            border: "1px solid #ddd",
            borderRadius: 4,
            cursor: "grab",
            background: "#fff"
          }}
          draggable
          onDragStart={(e) => e.dataTransfer.setData("application/reactflow", node.type)}
        >
          {node.label}
        </div>
      ))}
    </aside>
  );
}
