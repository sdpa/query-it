import { useState, useRef, useEffect } from 'react'
import { Send, User, Bot } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { Button } from '@renderer/components/ui/button'
import { Textarea } from '@renderer/components/ui/textarea'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { LlmProvider } from 'src/backend/services/llm/langchainService'

const openRouterModels = [
  'google/gemma-7b-it',
  'mistralai/mistral-7b-instruct',
  'anthropic/claude-3-haiku'
]

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

interface QueryChatProps {
  onQueryGenerated: (query: string) => void
}

export const QueryChat = ({ onQueryGenerated }: QueryChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: 'Hello! Ask me to help you generate SQL queries for your database.',
      role: 'assistant',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [llmProvider] = useState<LlmProvider>('openrouter')
  const [modelName, setModelName] = useState<string>('google/gemma-7b-it')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Generate a simple unique ID
  const generateId = (): string => Math.random().toString(36).substring(2, 10)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (): Promise<void> => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: generateId(),
      content: input,
      role: 'user',
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const chatHistory = messages.map((m) => ({ role: m.role, content: m.content }))
      const result = await window.api.sendLlmMessage(llmProvider, input, chatHistory, modelName)

      let response = ''
      if (result.success) {
        response = result.response ?? ''
      } else {
        response = `Error: ${result.error}`
      }

      const assistantMessage: Message = {
        id: generateId(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      }

      setMessages((prev) => [...prev, assistantMessage])

      const sqlMatch = response.match(/```sql\n([\s\S]*?)\n```/)
      if (sqlMatch && sqlMatch[1]) {
        onQueryGenerated(sqlMatch[1])
      }
    } catch (error) {
      const errorMessage: Message = {
        id: generateId(),
        content: `An error occurred: ${(error as Error).message}`,
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-card">
      <div className="p-3 border-b bg-muted/50 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">AI Query Assistant</h3>
          <p className="text-xs text-muted-foreground">
            Describe the data you want to query in natural language
          </p>
        </div>
        <Select value={modelName} onValueChange={(value) => setModelName(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            {openRouterModels.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-start gap-3 text-sm',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={cn(
                  'rounded-lg px-3 py-2 max-w-[80%]',
                  message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}
              >
                <div className="whitespace-pre-wrap">
                  {message.content.split('```').map((part, i) => {
                    // If this is an SQL code block
                    if (i % 2 === 1 && part.startsWith('sql\n')) {
                      const code = part.replace('sql\n', '')
                      return (
                        <div
                          key={i}
                          className="bg-black/10 p-2 rounded my-2 font-mono text-xs overflow-x-auto"
                        >
                          {code}
                        </div>
                      )
                    }
                    // Regular text
                    return <span key={i}>{part}</span>
                  })}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your data..."
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button
            size="icon"
            disabled={isLoading || !input.trim()}
            onClick={handleSendMessage}
            className="h-auto"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default QueryChat
