// src/types/nodes.ts
export interface HttpNodeData {
  label: string;
  curlCommand: string;
  onExecute: (curlCommand: string) => Promise<any>;
}

export type NodeTypes = {
  httpNode: HttpNodeData;
  // ... your other node types
};
