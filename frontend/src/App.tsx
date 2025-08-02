// NovaFlow Frontend: App.tsx
// Location: /frontend/src/App.tsx

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Dashboard from "./Dashboard";
import Editor from "./Editor";
import Sidebar from "./Sidebar";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-sans flex">
        {/* Sidebar Navigation */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 p-4">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/editor" element={<Editor />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
