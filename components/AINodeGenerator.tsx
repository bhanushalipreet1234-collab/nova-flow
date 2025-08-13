'use client'
import { useState } from 'react'
import { useCompletion } from 'ai/react'
import { SettingsModal } from './SettingsModal'

export function AINodeGenerator({ onAddNode }: { onAddNode: (node: any) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showChat, setShowChat] = useState(false)

  const { completion, input, handleInputChange, handleSubmit } = useCompletion({
    api: '/api/generate-node',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  })

  const handleSaveKey = (key: string) => {
    setApiKey(key)
    localStorage.setItem('openai-key', key)
    setIsOpen(false)
    setShowChat(true)
  }

  useEffect(() => {
    const savedKey = localStorage.getItem('openai-key')
    if (savedKey) setApiKey(savedKey)
  }, [])

  useEffect(() => {
    if (completion) {
      try {
        const newNode = JSON.parse(completion)
        onAddNode({
          ...newNode,
          position: { x: Math.random() * 500, y: Math.random() * 500 }
        })
      } catch (e) {
        console.error('Failed to parse AI response', e)
      }
    }
  }, [completion])

  return (
    <div className="ai-generator-container">
      {!showChat ? (
        <button 
          className="floating-ai-button"
          onClick={() => apiKey ? setShowChat(true) : setIsOpen(true)}
        >
          🧠 Generate Node
        </button>
      ) : (
        <div className="ai-chat-window">
          <button className="close-chat" onClick={() => setShowChat(false)}>×</button>
          <form onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="🔮 Create a Gmail node with email retrieval..."
            />
            <button type="submit">Generate</button>
          </form>
        </div>
      )}
      
      <SettingsModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSaveKey}
      />
    </div>
  )
}
