import { IDynamoHandler } from "./types";
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export class DynamoHandler implements IDynamoHandler {
  async disconnect(): Promise<void> {
    if (this.client) {
      // There is no explicit disconnect for DynamoDBClient, but we can clean up the reference.
      this.client.destroy?.();
      this.client = undefined;
    }
  }

  private client?: DynamoDBClient;

  
  async listTables(): Promise<string[]> {
    try {
      if (!this.client) {
        throw new Error("DynamoDB client is not connected. Call connect() first.");
      }
      const { ListTablesCommand } = await import('@aws-sdk/client-dynamodb');
      const command = new ListTablesCommand({});
      const response = await this.client.send(command);
      return response.TableNames || [];
    } catch (error) {
      console.error('Error listing tables:', error);
      throw error;
    }
  }

  async describeTable(tableName: string): Promise<any> {
    try {
      if (!this.client) {
        throw new Error("DynamoDB client is not connected. Call connect() first.");
      }
      const { DescribeTableCommand } = await import('@aws-sdk/client-dynamodb');
      const command = new DescribeTableCommand({ TableName: tableName });
      const response = await this.client.send(command);
      return response.Table;
    } catch (error) {
      console.error(`Error describing table ${tableName}:`, error);
      throw error;
    }
  }

  async connect(config: any): Promise<{ success: boolean; message?: string }> {
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
      this.client = client;
      return { success: true }
    } catch (error) {
      console.error('DynamoDB connection error:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
