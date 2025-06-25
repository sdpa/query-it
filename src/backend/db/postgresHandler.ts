import { Client } from 'pg'
import { IPostgresHandler } from './types';

export class PostgresHandler implements IPostgresHandler {
  private client: Client | null = null;

  async runSQL(sql: string): Promise<any> {
    if (!this.client) {
      throw new Error('Database client is not connected.');
    }
    try {
      const result = await this.client.query(sql);
      return result.rows;
    } catch (error) {
      console.error('Error executing SQL:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.end();
      this.client = null;
    }
  }

  async connect(config: any): Promise<{ success: boolean; message?: string }>  {
  
    if (this.client) {
      return { success: true }; 
    }
    this.client = new Client(config);
    try {
      await this.client.connect();
      return { success: true };
    } catch (error: any) {
      this.client = null;
      return { success: false, message: error.message };
    }
  }
}
