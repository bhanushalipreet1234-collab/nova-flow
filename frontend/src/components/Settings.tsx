'use client'
import { useState } from 'react'

export function SettingsModal({ 
  isOpen, 
  onClose,
  onSave
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (key: string) => void
}) {
  const [apiKey, setApiKey] = useState('')

  return (
    <div className={`modal ${isOpen ? 'open' : ''}`}>
      <div className="modal-content">
        <h3>Configure OpenAI API</h3>
        <input
          type="password"
          placeholder="Enter your OpenAI API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={() => onSave(apiKey)}>Save</button>
        </div>
      </div>
    </div>
  )
}
