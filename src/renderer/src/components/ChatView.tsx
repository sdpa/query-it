import React, { useState, useEffect, useCallback } from 'react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

// Define the structure of a message
interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

import { PostgresMetadata } from 'src/backend/services/metadata/types' // Import metadata type

// Define the structure for Ollama message history
interface OllamaHistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [ollamaModel, setOllamaModel] = useState<string>('llama3') // Default model
  // Removed dbMetadata state
  const [metadataStatus, setMetadataStatus] = useState<string | null>(
    'No schema context file generated yet. Connect to a DB and refresh schema.'
  )
  const [metadataFilePath, setMetadataFilePath] = useState<string | null>(null)


  // Function to fetch raw metadata and then update the file on desktop
  const updateSchemaFileOnDesktop = async (isInitialLoad = false) => {
    try {
      if (window.api && window.api.getMetadata && window.api.updateMetadataFileOnDesktop) {
        setMetadataStatus(isInitialLoad ? 'Fetching schema...' : 'Refreshing schema file...')
        setMetadataFilePath(null)
        const rawMetadata = await window.api.getMetadata()

        if (rawMetadata && (rawMetadata.tables?.length > 0 || rawMetadata.views?.length > 0)) {
          const result = await window.api.updateMetadataFileOnDesktop(rawMetadata)
          if (result.success) {
            setMetadataStatus(`Schema context file updated successfully in application data folder.`)
            setMetadataFilePath(result.path || null) // Store path for console logging, but don't show in UI
            console.log('Schema context file updated:', result.path)
          } else {
            setMetadataStatus(`Failed to update schema file: ${result.error || 'Unknown error'}`)
            console.error('Failed to update schema file:', result.error)
          }
        } else {
          // Handle case where there's no actual metadata to write (e.g., not connected)
          // metadataFileService now handles writing an informative message in the file for this case.
          const result = await window.api.updateMetadataFileOnDesktop(rawMetadata || { tables: [], views: [], columns: [], constraints: [], procedures: [], triggers: [] });
          if (result.success) {
             setMetadataStatus(`Schema context file updated (no tables/views found) in application data folder.`)
             setMetadataFilePath(result.path || null);
             console.log('Schema context file updated (no tables/views found):', result.path)
          } else {
             setMetadataStatus(`Failed to write schema file (no tables/views): ${result.error || 'Unknown error'}`);
          }
          console.log('No tables or views found in metadata. An informative context file may have been written.')
        }
      } else {
        const errMessage = 'Required API functions (getMetadata or updateMetadataFileOnDesktop) not available.'
        setMetadataStatus(errMessage)
        console.warn(errMessage)
      }
    } catch (err) {
      console.error('Error processing schema update:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to process schema update.'
      setMetadataStatus(`Error: ${errorMessage}`)
    }
  }

  // Initial welcome message from the bot & initial schema file generation
  useEffect(() => {
    setMessages([
      {
        id: 'initial-bot-message',
        text: "Hello! I'm your PostgreSQL expert assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date()
      }
    ])
    updateSchemaFileOnDesktop(true) // Attempt to generate schema file on load
  }, [])

  const handleSendMessage = async (inputText: string) => {
    if (!inputText.trim()) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages((prevMessages) => [...prevMessages, userMessage])
    setIsLoading(true)
    setError(null)

    // Prepare chat history for Ollama
    const historyForOllama: OllamaHistoryMessage[] = messages
      .filter((msg) => msg.id !== 'initial-bot-message') // Exclude initial welcome
      .map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }))

    try {
      // Ensure window.api and window.api.sendOllamaMessage are available
      if (window.api && window.api.sendOllamaMessage) {
        const botResponseText = await window.api.sendOllamaMessage(
          inputText,
          ollamaModel,
          historyForOllama
          // dbMetadata is no longer passed from here
        )
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          text: botResponseText,
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages((prevMessages) => [...prevMessages, botMessage])
      } else {
        throw new Error('Ollama API not available on window object.')
      }
    } catch (err) {
      console.error('Error sending message to Ollama:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response from the bot.'
      setError(errorMessage)
      // Optionally, add an error message to the chat
      const errorBotMessage: ChatMessage = {
        id: `bot-error-${Date.now()}`,
        text: `Error: ${errorMessage}`,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages((prevMessages) => [...prevMessages, errorBotMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Simple styling for now, can be expanded or moved to CSS files
  const chatViewStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 100px)', // Example height, adjust as needed
    border: '1px solid #ccc',
    borderRadius: '8px',
    overflow: 'hidden',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '20px auto'
  }

  const errorStyle: React.CSSProperties = {
    color: 'red',
    padding: '10px',
    borderBottom: '1px solid #eee'
  }

  const metadataStatusStyle: React.CSSProperties = {
    padding: '5px 10px',
    fontSize: '0.8em',
    backgroundColor: '#f0f0f0',
    textAlign: 'center',
    color: '#555'
  }

  const metadataErrorStyle: React.CSSProperties = {
    ...metadataStatusStyle,
    color: 'red',
    backgroundColor: '#ffe0e0'
  }

  // Basic model selector (can be improved)
  const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setOllamaModel(event.target.value);
  };

  // Renamed refreshMetadata to call the new central function
  const handleRefreshSchemaFile = () => {
    updateSchemaFileOnDesktop(false); // false indicates it's not the initial load
  };


  return (
    <div style={chatViewStyle}>
      <div style={{ padding: '10px', borderBottom: '1px solid #ccc', backgroundColor: '#f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <label htmlFor="ollama-model-selector" style={{ marginRight: '10px' }}>Select Model:</label>
          <select id="ollama-model-selector" value={ollamaModel} onChange={handleModelChange}>
            <option value="llama3">Llama 3</option>
            <option value="mistral">Mistral</option>
            <option value="codellama">CodeLlama</option>
            {/* Add other models you have downloaded via `ollama pull <modelname>` */}
          </select>
        </div>
        <button onClick={handleRefreshSchemaFile} style={{padding: '5px 10px'}}>Refresh Schema File</button>
      </div>
      {metadataStatus && (
         <div style={metadataStatus.startsWith('Error:') || metadataStatus.startsWith('Failed') ? metadataErrorStyle : metadataStatusStyle}>
          {metadataStatus}
         </div>
      )}
      <MessageList messages={messages} />
      {error && <div style={errorStyle}>LLM Error: {error}</div>}
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  )
}

export default ChatView
