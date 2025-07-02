import { ElectronAPI } from '@electron-toolkit/preload'
import { PostgresMetadata } from 'src/backend/services/metadata/types';

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      connectDB: (dbConfig: any, credentials: any) => Promise<{ success: boolean; message: string; error?: string }>,
      disconnectDB: () => Promise<{ success: boolean; message?: string }>,
      getMetadata: () => Promise<PostgresMetadata>
      sendOllamaMessage: (
        prompt: string,
        model: string,
        chatHistory?: { role: 'user' | 'assistant'; content: string }[]
        // Removed dbMetadata parameter from here
      ) => Promise<string>
      updateMetadataFileOnDesktop: (
        metadata: PostgresMetadata
      ) => Promise<{ success: boolean; path?: string; error?: string }>
    },
  }
}