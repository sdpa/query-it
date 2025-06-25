import axios from 'axios'

const OLLAMA_API_URL = 'http://localhost:11434/api/chat'

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OllamaRequest {
  model: string
  messages: OllamaMessage[]
  stream?: boolean
}

interface OllamaResponse {
  model: string
  created_at: string
  message: OllamaMessage
  done: boolean
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  prompt_eval_duration?: number
  eval_count?: number
  eval_duration?: number
}

// Removed: import { PostgresMetadata, PostgresColumnInfo, PostgresConstraintInfo } from '../backend/services/metadata/types'
import { readMetadataFile } from './metadataFileService' // Import the function to read the metadata file

// Default system message to make the LLM a Postgres expert
const BASE_SYSTEM_MESSAGE = `You are an expert assistant specializing in PostgreSQL.
Your knowledge is up-to-date with the latest PostgreSQL version.
When asked about PostgreSQL, provide clear, accurate, and concise explanations.
When asked to generate SQL queries, ensure they are syntactically correct and efficient for PostgreSQL.
If a user asks for a query, provide only the SQL query itself unless explicitly asked for an explanation. If the user's request for SQL is ambiguous, ask for clarification before generating the query.
If a local schema context file is available, it will be provided below. Use it to tailor your responses and SQL generation to the user's specific database structure. If no schema context is provided, answer generally about PostgreSQL.`

// Removed formatDbMetadata function as its logic moved to metadataFileService.ts

export async function getOllamaResponse(
  userPrompt: string,
  model: string,
  // Removed dbMetadata parameter
  customSystemMessage?: string,
  chatHistory: OllamaMessage[] = []
): Promise<string> {
  try {
    let systemMessageToUse = customSystemMessage || BASE_SYSTEM_MESSAGE;

    const fileMetadataContent = await readMetadataFile()
    if (fileMetadataContent) {
      // Prepend file content. The file content itself should already be formatted nicely.
      systemMessageToUse = `${fileMetadataContent}\n\n-----\n\n${systemMessageToUse}`
    } else {
      // Optionally, log that no metadata file was found or it was empty
      console.log('No metadata file content found or file does not exist. Proceeding without schema context in prompt.')
    }

    const messages: OllamaMessage[] = []

    if (systemMessageToUse) {
      messages.push({ role: 'system', content: systemMessageToUse })
    }

    // Add previous chat history
    messages.push(...chatHistory)

    // Add current user prompt
    messages.push({ role: 'user', content: userPrompt })

    const requestPayload: OllamaRequest = {
      model: model,
      messages: messages,
      stream: false // For simplicity, not using streaming for now
    }

    console.log(`Sending request to Ollama: ${JSON.stringify(requestPayload, null, 2)}`)

    const response = await axios.post<OllamaResponse>(OLLAMA_API_URL, requestPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    console.log(`Received response from Ollama: ${JSON.stringify(response.data, null, 2)}`)

    if (response.data && response.data.message && response.data.message.content) {
      return response.data.message.content
    } else {
      throw new Error('Invalid response structure from Ollama API')
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error communicating with Ollama API:', error.response?.data || error.message)
      throw new Error(
        `Failed to communicate with Ollama API: ${error.response?.status} ${error.response?.statusText}. Is Ollama running?`
      )
    } else {
      console.error('Unknown error in getOllamaResponse:', error)
      throw new Error('An unknown error occurred while fetching response from Ollama.')
    }
  }
}

// Example usage (for testing purposes, can be removed later)
/*
async function testOllama() {
  try {
    const modelToUse = 'llama3'; // Replace with your desired model, e.g., 'mistral', 'llama2'
    const prompt = "What are the benefits of using indexes in PostgreSQL?";
    // You might need to run `ollama pull llama3` or your chosen model first.
    const response = await getOllamaResponse(prompt, modelToUse);
    console.log("Ollama's response:", response);

    const sqlPrompt = "Generate a SQL query to select all users from a table named 'employees' who are older than 30.";
    const sqlResponse = await getOllamaResponse(sqlPrompt, modelToUse);
    console.log("Ollama's SQL response:", sqlResponse);

  } catch (e) {
    console.error(e);
  }
}

// testOllama();
*/
