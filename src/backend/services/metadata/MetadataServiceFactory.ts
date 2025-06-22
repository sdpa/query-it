import { DatabaseType, IPostgresHandler } from "src/backend/db/types"
import { IMetadataService } from "./IMetadataService"
import { PostgresMetadataService } from "./PostgresMetadataService"
import { PostgresMetadata } from "./types"

export class MetadataServiceFactory {
  static create(type: DatabaseType, handler: any): IMetadataService<any> {
    switch (type) {
      case 'postgresql':
        return new PostgresMetadataService(handler as IPostgresHandler) as IMetadataService<PostgresMetadata>
      default:
        throw new Error(`Unsupported database type: ${type}`)
    }
  }
}