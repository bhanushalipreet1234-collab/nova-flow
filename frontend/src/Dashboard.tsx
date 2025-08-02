// Location: /frontend/src/Dashboard.tsx

import React from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="p-4 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Welcome to Nova Flow</h2>

      <p className="text-gray-600">
        Build and automate flows visually. Get started by creating your first node flow.
      </p>

      <div className="bg-white p-6 rounded-md shadow-md">
        <h3 className="text-xl font-semibold mb-2">Quick Actions</h3>
        <div className="space-x-4">
          <Link
            to="/editor"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Open Editor
          </Link>
          <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
            View Docs
          </button>
        </div>
      </div>
    </div>
  );
}
