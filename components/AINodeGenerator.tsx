"use client"
import { useCompletion } from 'ai/react'

export function AINodeGenerator({ onAddNode }: { onAddNode: (node: any) => void }) {
  const { completion, input, handleInputChange, handleSubmit } = useCompletion({
    api: '/api/generate-node',
  })

  useEffect(() => {
    if (completion) {
      const newNode = JSON.parse(completion)
      onAddNode({
        ...newNode,
        position: { x: Math.random() * 500, y: Math.random() * 500 }
      })
    }
  }, [completion])

  return (
    <div className="ai-generator">
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="🔮 Create a Gmail node..."
        />
        <button type="submit">Generate</button>
      </form>
    </div>
  )
}
