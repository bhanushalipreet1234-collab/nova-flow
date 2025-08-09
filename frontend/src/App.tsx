import React from "react";
import Sidebar from "./Sidebar";
import Editor from "./Editor";
import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";

export default function App() {
  return (
    <ReactFlowProvider>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <Editor />
      </div>
    </ReactFlowProvider>
  );
}
