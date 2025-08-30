import React from "react";

interface HelloNodeProps {
  data: { label: string };
}

export default function HelloNode({ data }: HelloNodeProps) {
  return (
    <div className="p-2 border rounded bg-green-100">
      <strong>{data.label}</strong>
      <p>?? Hello Node active!</p>
    </div>
  );
}
