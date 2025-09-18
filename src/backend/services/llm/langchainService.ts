import { ChatOpenAI } from '@langchain/openai'
import { ChatOllama } from '@langchain/ollama'
import { AIMessage, HumanMessage } from '@langchain/core/messages'

export type LlmProvider = 'openai' | 'ollama' | 'openrouter'

export interface LlmMessage {
  role: 'user' | 'assistant'
  content: string
}

export const sendMessage = async (
  provider: LlmProvider,
  prompt: string,
  history: LlmMessage[] = [],
  modelName?: string,
  apiKey?: string,
  metadata?: string | null
): Promise<string> => {
  let chat
  if (provider === 'openai') {
    const key = apiKey || process.env.OPENAI_API_KEY
    if (!key) {
      throw new Error('OpenAI API key is not configured.')
    }
    chat = new ChatOpenAI({
      apiKey: key,
      modelName: 'gpt-3.5-turbo'
    })
  } else if (provider === 'ollama') {
    console.log('Ollama URL: ', process.env.OLLAMA_URL)
    if (!process.env.OLLAMA_URL) {
      throw new Error('Ollama URL is not configured.')
    }
    chat = new ChatOllama({
      baseUrl: process.env.OLLAMA_URL,
      model: 'llama3.2'
    })
  } else if (provider === 'openrouter') {
    const key = apiKey || process.env.OPENROUTER_API_KEY
    if (!key) {
      throw new Error('OpenRouter API key is not configured.')
    }
    chat = new ChatOpenAI({
      apiKey: key,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1'
      },
      modelName: modelName || 'google/gemma-7b-it'
    })
  } else {
    throw new Error(`Unsupported LLM provider: ${provider}`)
  }


  // Create system message with database context
  const systemMessage = new HumanMessage(
      `You are a SQL query assistant. You help users generate SQL queries based on their natural language requests. 
      
      The schema of the database is as follows:
      ${metadata}

      When generating SQL queries:
      1. Use the exact table and column names from the schema above
      2. Include proper JOINs when querying related tables
      3. Use appropriate WHERE clauses for filtering
      4. Format your response with SQL code blocks using \`\`\`sql
      5. Explain what the query does in plain English

      *** IMPORTANT ***
      Do not use tables or columns that are not in the schema above. Schema that is provided should be the only source of truth.

      User's request: ${prompt}`
  )

  const messages = [
    ...history.map((message) => {
      if (message.role === 'user') {
        return new HumanMessage(message.content)
      } else {
        return new AIMessage(message.content)
      }
    }),
    systemMessage
  ]

  console.log('Messages: ', messages)

  try {
    const response = await chat.invoke(messages)
    // console.log('Response: ', response)
    // console.log('Response: ', response.content.toString())
    return response.content.toString()
  } catch (error) {
    // console.error(`Error calling ${provider} API:`, error)
    throw new Error(`Failed to get response from ${provider}.`)
  }
}
