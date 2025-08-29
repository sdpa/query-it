export interface PostgresConfig {
  host: string
  port: string
  database: string
  user: string
  password: string
}

export interface MongoConfig {
  host: string
  port: string
  database: string
  username: string
  password: string
  authSource?: string
}

export interface DynamoDBConfig {
  region: string
  accessKeyId: string
  secretAccessKey: string
  endpoint?: string
}

export interface AllDBConfigs {
  postgresql: PostgresConfig
  mongodb: MongoConfig
  dynamodb: DynamoDBConfig
}

export type DatabaseType = keyof AllDBConfigs

export interface IDatabaseHandler {
  connect(config: any): Promise<{ success: boolean; message?: string }>
  disconnect(): Promise<void>
}

export interface IPostgresHandler extends IDatabaseHandler {
  runSQL(sql: string): Promise<any>
}

export interface IDynamoHandler extends IDatabaseHandler {
  listTables(): Promise<string[]>
  describeTable(tableName: string): Promise<any>
}
