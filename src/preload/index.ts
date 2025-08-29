import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  connectDB: (type: 'postgres' | 'mongodb' | 'mysql', config: any) => {
    return ipcRenderer.invoke('connect-to-database', type, config)
  },
  getMetadata: () => ipcRenderer.invoke('get-metadata'),
  disconnectDB: () => ipcRenderer.invoke('disconnect-from-database'),
  sendLlmMessage: (
    provider: 'openai' | 'ollama' | 'openrouter',
    prompt: string,
    chatHistory: { role: 'user' | 'assistant'; content: string }[] = [],
    modelName?: string,
    apiKey?: string
  ) => ipcRenderer.invoke('llm-send-message', provider, prompt, chatHistory, modelName, apiKey),
  sendOllamaMessage: (
    prompt: string,
    model: string,
    chatHistory: { role: 'user' | 'assistant'; content: string }[] = []
    // Removed dbMetadata parameter from here
  ) => ipcRenderer.invoke('ollama-send-message', prompt, model, chatHistory),
  updateMetadataFileOnDesktop: (
    metadata: any // Using 'any' for now, will be typed by PostgresMetadata in .d.ts
  ) => ipcRenderer.invoke('update-metadata-file', metadata)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
