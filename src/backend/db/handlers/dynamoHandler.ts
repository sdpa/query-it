import { IDatabaseHandler } from '../IDatabaseHandler';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export class DynamoHandler implements IDatabaseHandler {
  async connect(config: any): Promise<DynamoDBClient> {
    try {
      const client = new DynamoDBClient({
        region: config.region,
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
        endpoint: config.endpoint,
      });

      // Optionally test connection with a dummy command if needed

      console.log('Connected to DynamoDB');
      return client;
    } catch (error) {
      console.error('DynamoDB connection error:', error);
      throw error;
    }
  }
}
