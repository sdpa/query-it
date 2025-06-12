import { IDatabaseHandler } from './IDatabaseHandler';
import { PostgresHandler } from './handlers/postgresHandler';
import { MongoHandler } from './handlers/mongoHandler';
import { DynamoHandler } from './handlers/dynamoHandler';
import { DatabaseType } from './types';

export function getHandler(type: DatabaseType): IDatabaseHandler {
  console.log("Creating handler for type:", type);
  switch (type) {
    case 'postgresql':
      return new PostgresHandler();
    case 'mongodb':
      return new MongoHandler();
    case 'dynamodb':
      return new DynamoHandler();
    default:
      throw new Error(`No handler found for type: ${type}`);
  }
}