import { ipcMain } from 'electron';
import { connectToDatabase } from '../../backend/db';

ipcMain.handle('connect-to-database', async (_event, dbType: string, config: any) => {
  try {
    const db = await connectToDatabase(dbType as any, config);
    console.error('Successfully connected to database:');
    return { success: true };
  } catch (err: any) {
    console.error('IPC DB connection error:', err);
    return { success: false, message: err.message || 'Unknown error' };
  }
});