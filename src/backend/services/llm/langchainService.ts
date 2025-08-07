import { ChatOpenAI } from '@langchain/openai'
import { ChatOllama } from '@langchain/community/chat_models/ollama'
import { AIMessage, HumanMessage } from '@langchain/core/messages'

export type LlmProvider = 'openai' | 'ollama'

export interface LlmMessage {
  role: 'user' | 'assistant'
  content: string
}

export const sendMessage = async (
  provider: LlmProvider,
  prompt: string,
  history: LlmMessage[] = []
): Promise<string> => {
  let chat
  if (provider === 'openai') {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured.')
    }
    chat = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-3.5-turbo'
    })
  } else if (provider === 'ollama') {
    if (!process.env.OLLAMA_URL) {
      throw new Error('Ollama URL is not configured.')
    }
    chat = new ChatOllama({
      baseUrl: process.env.OLLAMA_URL,
      model: 'llama2'
    })
  } else {
    throw new Error(`Unsupported LLM provider: ${provider}`)
  }

  const messages = [
    ...history.map((message) => {
      if (message.role === 'user') {
        return new HumanMessage(message.content)
      } else {
        return new AIMessage(message.content)
      }
    }),
    new HumanMessage(prompt)
  ]

  try {
    const response = await chat.invoke(messages)
    return response.content.toString()
  } catch (error) {
    console.error(`Error calling ${provider} API:`, error)
    throw new Error(`Failed to get response from ${provider}.`)
  }
}
