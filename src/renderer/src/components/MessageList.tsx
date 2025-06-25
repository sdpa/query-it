import React, { useEffect, useRef } from 'react'

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface MessageListProps {
  messages: ChatMessage[]
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(()_=> {
    scrollToBottom()
  }, [messages])

  // Basic styling
  const listStyle: React.CSSProperties = {
    flexGrow: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  }

  const messageStyle = (sender: 'user' | 'bot'): React.CSSProperties => ({
    padding: '10px 15px',
    borderRadius: '18px',
    maxWidth: '70%',
    wordWrap: 'break-word',
    alignSelf: sender === 'user' ? 'flex-end' : 'flex-start',
    backgroundColor: sender === 'user' ? '#007bff' : '#e9ecef',
    color: sender === 'user' ? 'white' : 'black',
    boxShadow: '0 1px 1px rgba(0,0,0,0.1)'
  })

  const timestampStyle: React.CSSProperties = {
    fontSize: '0.75em',
    color: '#888',
    marginTop: '5px',
    textAlign: 'right'
  }

  return (
    <div style={listStyle}>
      {messages.map((msg) => (
        <div key={msg.id} style={messageStyle(msg.sender)}>
          <div>{msg.text}</div>
          <div style={timestampStyle}>{msg.timestamp.toLocaleTimeString()}</div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList
