export interface PostgresConfig {
  host: string;
  port: string;
  database: string;
  user: string;
  password: string;
}

export interface MongoConfig {
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  authSource?: string;
}

export interface DynamoDBConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
}

export interface AllDBConfigs {
  postgresql: PostgresConfig;
  mongodb: MongoConfig;
  dynamodb: DynamoDBConfig;
}

export type DatabaseType = keyof AllDBConfigs;