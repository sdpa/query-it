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
      this.dbHandler.runSQL(`SELECT trigger_name, event_object_table, event_manipulation FROM information_schema.triggers`),
      this.dbHandler.runSQL(`
        SELECT 
          tc.constraint_name, 
          tc.constraint_type, 
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        LEFT JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_name = kcu.table_name
        LEFT JOIN information_schema.constraint_column_usage AS ccu
          ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE', 'CHECK')
          AND tc.table_schema NOT IN ('pg_catalog', 'information_schema')
          AND (
            tc.constraint_type != 'CHECK' 
            OR (
              tc.constraint_type = 'CHECK' 
              AND tc.constraint_name NOT LIKE '_____%_not_null'
            )
          );
      `)
    ]);

    console.log('Postgres metadata rows:', rows);

    return {
      tables: rows[0].map((r: any) => ({ name: r.table_name, schema: r.table_schema })),
      views: rows[1].map((r: any) => ({ name: r.table_name, schema: r.table_schema })),
      columns: rows[2].map((r: any) => ({ table: r.table_name, name: r.column_name, dataType: r.data_type })),
      procedures: rows[3].map((r: any) => ({ name: r.routine_name, schema: r.routine_schema })),
      triggers: rows[4].map((r: any) => ({ name: r.trigger_name, table: r.event_object_table, event: r.event_manipulation })),
      constraints: rows[5].map((r: any) => ({
        name: r.constraint_name,
        type: r.constraint_type,
        table: r.table_name,
        column: r.column_name,
        foreignTable: r.foreign_table_name || null,
        foreignColumn: r.foreign_column_name || null
      }))
    };
  }
}