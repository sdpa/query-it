import { IDatabaseHandler } from '../IDatabaseHandler';
import { Client } from 'pg';

export class PostgresHandler implements IDatabaseHandler {
  async connect(config: any): Promise<Client> {
    try {
      const client = new Client(config);
      await client.connect();
      console.log('Connected to PostgreSQL');
      return client;
    } catch (error) {
      console.error('PostgreSQL connection error:', error);
      throw error;
    }
  }
}
