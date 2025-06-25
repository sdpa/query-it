import React, { useState } from 'react'

interface MessageInputProps {
  onSendMessage: (text: string) => void
  isLoading: boolean
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!inputValue.trim()) return
    onSendMessage(inputValue)
    setInputValue('')
  }

  // Basic styling
  const formStyle: React.CSSProperties = {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #ccc',
    backgroundColor: '#f8f9fa'
  }

  const inputStyle: React.CSSProperties = {
    flexGrow: 1,
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '20px',
    marginRight: '10px',
    fontSize: '1em'
  }

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '1em'
  }

  const buttonDisabledStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#aaa',
    cursor: 'not-allowed'
  }

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type your message..."
        style={inputStyle}
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading} style={isLoading ? buttonDisabledStyle : buttonStyle}>
        {isLoading ? 'Sending...' : 'Send'}
      </button>
    </form>
  )
}

export default MessageInput
