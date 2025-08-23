// src/utils/nodeUtils.ts
import { Node } from 'reactflow';
import { HttpNodeData } from '../types/nodes';

export const createHttpNode = (position: { x: number; y: number }): Node<HttpNodeData> => {
  return {
    id: `http-${Date.now()}`,
    type: 'httpNode',
    position,
    data: {
      label: 'HTTP Request',
      curlCommand: '',
      onExecute: async (curlCommand: string) => {
        const response = await fetch('/curl/execute', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Id': '1' // Replace with actual user ID
          },
          body: JSON.stringify({ 
            curl_command: curlCommand,
            node_id: `http-${Date.now()}`
          })
        });
        return response.json();
      }
    }
  };
};
