// Location: /frontend/src/Editor.tsx

import React from "react";

export default function Editor() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">Editor</h2>

      <div className="flex space-x-3">
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Save
        </button>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Run
        </button>
        <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
          Clear
        </button>
      </div>

      <div className="border border-gray-300 rounded-md bg-white h-[500px] shadow-inner p-4">
        {/* This is your future node editor canvas */}
        <p className="text-gray-400 text-center mt-48">
          Canvas will go here.
        </p>
      </div>
    </div>
  );
}
