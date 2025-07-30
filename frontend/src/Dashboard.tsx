import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [workflows, setWorkflows] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://nova-backend.onrender.com/api/workflows")
      .then((res) => res.json())
      .then((data) => setWorkflows(data))
      .catch(console.error);
  }, []);

  const handleExecute = async (id: string) => {
    await fetch(`https://nova-backend.onrender.com/api/workflows/${id}/execute`, {
      method: "POST"
    });
    alert("Workflow executed!");
  };

  const handleDelete = async (id: string) => {
    await fetch(`https://nova-backend.onrender.com/api/workflows/${id}`, {
      method: "DELETE"
    });
    setWorkflows((prev) => prev.filter((w: any) => w.id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🚀 Nova Flow Dashboard</h1>
      <button
        className="mb-4 bg-green-600 text-white px-4 py-2 rounded"
        onClick={() => navigate("/editor")}
      >
        + New Workflow
      </button>
      <div className="grid gap-4">
        {workflows.map((wf: any) => (
          <div
            key={wf.id}
            className="p-4 border rounded shadow flex justify-between items-center"
          >
            <div>
              <h2 className="text-lg font-semibold">{wf.name}</h2>
              <p className="text-sm text-gray-600">{wf.createdAt}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/editor/${wf.id}`)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleExecute(wf.id)}
                className="bg-purple-600 text-white px-3 py-1 rounded"
              >
                ▶️ Execute
              </button>
              <button
                onClick={() => handleDelete(wf.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}