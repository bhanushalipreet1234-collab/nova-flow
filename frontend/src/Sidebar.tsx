// Sidebar.tsx - NovaFlow Sidebar Component
// Location: /frontend/src/components/Sidebar.tsx

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, PenTool } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
    { name: "Editor", icon: <PenTool size={20} />, path: "/editor" },
  ];

  return (
    <div className="w-64 bg-white border-r shadow-md min-h-screen p-5">
      <h1 className="text-2xl font-bold mb-8">NovaFlow</h1>
      <ul className="space-y-4">
        {navItems.map((item) => (
          <li key={item.name}>
            <Link
              to={item.path}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors text-sm font-medium hover:bg-gray-100 ${
                location.pathname === item.path ? "bg-gray-200 text-blue-600" : "text-gray-700"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
