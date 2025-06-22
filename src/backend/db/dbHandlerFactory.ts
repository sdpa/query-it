import { IDatabaseHandler } from './types';
import { PostgresHandler } from './postgresHandler';
import { DynamoHandler } from './dynamoHandler';
import { DatabaseType } from './types';

export function getHandler(type: DatabaseType): IDatabaseHandler {
  console.log("Creating handler for type:", type);
  switch (type) {
    case 'postgresql':
      return new PostgresHandler();
    case 'dynamodb':
      return new DynamoHandler();
    default:
      throw new Error(`No handler found for type: ${type}`);
  }
}