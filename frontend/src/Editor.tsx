import React from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

const EXECUTE_URL =
  import.meta.env.VITE_EXECUTOR_URL || "http://localhost:8000/execute";

function Editor() {
  const handleRunFlow = async () => {
    try {
      const response = await fetch(EXECUTE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ /* your flow data */ }),
      });

      const data = await response.json();
      console.log("Flow execution result:", data);
    } catch (err) {
      console.error("Error running flow:", err);
    }
  };

  return (
    <div style={{ height: "100vh" }}>
      <ReactFlow>
        <Background />
        <Controls />
      </ReactFlow>
      <button onClick={handleRunFlow}>Run Flow</button>
    </div>
  );
}

export default Editor;
