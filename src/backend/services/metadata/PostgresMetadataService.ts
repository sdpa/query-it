import { IMetadataService } from './IMetadataService';
import { PostgresMetadata } from './types';
import { IPostgresHandler } from 'src/backend/db/types';

export class PostgresMetadataService implements IMetadataService<PostgresMetadata> {
  constructor(private dbHandler: IPostgresHandler) {}

  async getMetadata(): Promise<PostgresMetadata> {
    const rows = await Promise.all([
      this.dbHandler.runSQL(`SELECT table_schema, table_name FROM information_schema.tables WHERE table_type='BASE TABLE' AND table_schema NOT IN ('pg_catalog', 'information_schema')`),
      this.dbHandler.runSQL(`SELECT table_schema, table_name FROM information_schema.views WHERE table_schema NOT IN ('pg_catalog', 'information_schema')`),
      this.dbHandler.runSQL(`SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema NOT IN ('pg_catalog', 'information_schema')`),
      this.dbHandler.runSQL(`SELECT routine_schema, routine_name FROM information_schema.routines WHERE routine_schema NOT IN ('pg_catalog', 'information_schema')`),
      this.dbHandler.runSQL(`SELECT trigger_name, event_object_table, event_manipulation FROM information_schema.triggers`)
    ]);

    return {
      tables: rows[0].map((r: any) => ({ name: r.table_name, schema: r.table_schema })),
      views: rows[1].map((r: any) => ({ name: r.table_name, schema: r.table_schema })),
      columns: rows[2].map((r: any) => ({ table: r.table_name, name: r.column_name, dataType: r.data_type })),
      procedures: rows[3].map((r: any) => ({ name: r.routine_name, schema: r.routine_schema })),
      triggers: rows[4].map((r: any) => ({ name: r.trigger_name, table: r.event_object_table, event: r.event_manipulation }))
    };
  }
}