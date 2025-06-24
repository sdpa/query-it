import { ElectronAPI } from '@electron-toolkit/preload'
import { PostgresMetadata } from 'src/backend/services/metadata/types';

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      connectDB: (dbConfig: any, credentials: any) => Promise<{ success: boolean; message: string; error?: string }>,
      getMetadata: () => Promise<PostgresMetadata>}
    }
}