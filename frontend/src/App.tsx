// NovaFlow Frontend: Routing + Dashboard + Editor
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Dashboard from "./Dashboard";  // ✅ Correct relative path
import Editor from "./Editor"; // move current editor logic into Editor.tsx

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/editor/:id" element={<Editor />} />
      </Routes>
    </Router>
  );
}
