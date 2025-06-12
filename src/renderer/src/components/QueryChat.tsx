import { useState, useRef, useEffect } from 'react'
import { Send, User, Bot } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { Button } from '@renderer/components/ui/button'
import { Textarea } from '@renderer/components/ui/textarea'
import { ScrollArea } from '@renderer/components/ui/scroll-area'

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

    // In a real app, this would be an API call to a language model
    // For now, we'll simulate a response with some sample queries
    setTimeout(() => {
      let response = ''

      if (input.toLowerCase().includes('users') && input.toLowerCase().includes('email')) {
        response =
          "Here's a query to get all users with their email addresses:\n\n```sql\nSELECT id, name, email FROM public.users;\n```"
      } else if (input.toLowerCase().includes('product') && input.toLowerCase().includes('price')) {
        response =
          "Here's a query to get all products sorted by price:\n\n```sql\nSELECT id, name, price, category FROM public.products\nORDER BY price DESC;\n```"
      } else if (
        input.toLowerCase().includes('join') ||
        (input.toLowerCase().includes('order') && input.toLowerCase().includes('user'))
      ) {
        response =
          "Here's a query to join orders with users:\n\n```sql\nSELECT o.id, u.name, o.total, o.status\nFROM public.orders o\nJOIN public.users u ON o.user_id = u.id\nORDER BY o.created_at DESC;\n```"
      } else {
        response =
          "I'll help you write a SQL query for that. Could you provide more details about the tables and fields you want to query?"
      }

      const assistantMessage: Message = {
        id: generateId(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)

      // Extract SQL query if present and send it to the parent component
      const sqlMatch = response.match(/```sql\n([\s\S]*?)\n```/)
      if (sqlMatch && sqlMatch[1]) {
        onQueryGenerated(sqlMatch[1])
      }
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-card">
      <div className="p-3 border-b bg-muted/50">
        <h3 className="font-semibold text-sm">AI Query Assistant</h3>
        <p className="text-xs text-muted-foreground">
          Describe the data you want to query in natural language
        </p>
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
