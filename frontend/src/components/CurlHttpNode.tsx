// src/components/CurlHttpNode.tsx
'use client'
import { useState } from 'react'

interface CurlHttpNodeProps {
  onExecute: (curlCommand: string) => Promise<any>
  nodeId: string
}

export function CurlHttpNode({ onExecute, nodeId }: CurlHttpNodeProps) {
  const [curlCommand, setCurlCommand] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleExecute = async () => {
    setIsLoading(true)
    try {
      const result = await onExecute(curlCommand)
      setResponse(result)
    } catch (error: any) {
      setResponse({ error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-semibold">cURL HTTP Request</h3>
      
      <textarea
        value={curlCommand}
        onChange={(e) => setCurlCommand(e.target.value)}
        placeholder="Paste cURL command here..."
        className="w-full h-32 p-2 border rounded-md font-mono text-sm"
        rows={6}
      />
      
      <button
        onClick={handleExecute}
        disabled={isLoading || !curlCommand}
        className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
      >
        {isLoading ? 'Executing...' : 'Execute Request'}
      </button>

      {response && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Response:</h4>
          <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-auto max-h-64">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
