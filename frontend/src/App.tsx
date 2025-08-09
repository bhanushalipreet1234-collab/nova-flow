import React from "react";
import Sidebar from "./Sidebar";
import Editor from "./Editor";

export default function App() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <Editor />
    </div>
  );
}
