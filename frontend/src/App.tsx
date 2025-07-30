const handleExecute = async () => {
  if (!reactFlowInstance) return;
  try {
    setLoading(true);
    const flow = reactFlowInstance.toObject();

    // Save the workflow first
    const res = await fetch("https://nova-backend.onrender.com/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "workflow-1", graph: flow })
    });

    const json = await res.json();
    const workflowId = json.id;

    // Then execute the workflow
    const execRes = await fetch(
      `https://nova-backend.onrender.com/api/workflows/${workflowId}/execute`,
      { method: "POST" }
    );

    const execJson = await execRes.json();
    toast.success("Execution Complete");
    console.log("Log:", execJson.log); // <-- Logs workflow output
  } catch (err) {
    toast.error("Execution failed");
  } finally {
    setLoading(false);
  }
};
