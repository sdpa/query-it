import { getHandler } from './dbHandlerFactory';
import { DatabaseType } from './types';

export async function connectToDatabase(type: DatabaseType, config: any) {
  const handler = getHandler(type);
  return await handler.connect(config);
}
