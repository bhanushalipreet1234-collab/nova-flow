export interface NodeType {
  type: string;
  label: string;
}

export const nodeTypesList: NodeType[] = [
  { type: "weatherNode", label: "Weather Node" },
  { type: "httpRequest", label: "HTTP Request" },
  { type: "dataTransform", label: "Data Transform" }
];
