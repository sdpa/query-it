import { IDatabaseHandler } from '../IDatabaseHandler';
import { MongoClient, Db } from 'mongodb';

export class MongoHandler implements IDatabaseHandler {
  async connect(config: { uri: string; dbName: string }): Promise<Db> {
    try {
      const client = new MongoClient(config.uri);
      await client.connect();
      console.log('Connected to MongoDB');
      return client.db(config.dbName);
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
}
