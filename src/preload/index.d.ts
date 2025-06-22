import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      connectDB: (dbConfig: any, credentials: any) => Promise<{ success: boolean; message: string; error?: string }>};
    }
}