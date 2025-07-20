import { app } from 'electron';
import { PostgresMetadata } from './types';
import { IPostgresHandler } from 'src/backend/db/types';
import path from 'path';
import fs from 'fs/promises';
import { BaseMetadataService } from './BaseMetadataService';

export class PostgresMetadataService extends BaseMetadataService<PostgresMetadata> {
  constructor(private dbHandler: IPostgresHandler) {
    super()
  }
  
  protected getMetadataFilePath(): string {
    const userDataPath = app.getPath('userData')
    return path.join(userDataPath, 'postgres_metadata.json')
  }

  async processMetadata(metadata: PostgresMetadata, writeToFile: boolean) : Promise<string> {

    if (!metadata) {
      return 'No database schema information available. Connect to a database and refresh schema via the app.';
    }

    let schemaString = '--\n-- PostgreSQL schema dump \n--\n\n';

    const allTablesAndViews = [...(metadata.tables || []), ...(metadata.views || [])];

    allTablesAndViews.forEach((table) => {
      const isView = metadata.views?.some(v => v.name === table.name && v.schema === table.schema);

      if (isView) {
        schemaString += `--\n-- Name: ${table.name}; Type: VIEW; Schema: ${table.schema}\n--\n`;
        schemaString += `CREATE VIEW ${table.schema}.${table.name} AS\n  -- View definition unknown\n;\n\n`;
        return;
      }

      const tableColumns = metadata.columns?.filter(col => col.table === table.name) || [];
      schemaString += `--\n-- Name: ${table.name}; Type: TABLE; Schema: ${table.schema}\n--\n`;
      schemaString += `CREATE TABLE ${table.schema}.${table.name} (\n`;

      const columnLines: string[] = [];

      tableColumns.forEach((col) => {
        let line = `  ${col.name} ${col.dataType}`;

        const pk = metadata.constraints?.find(
          c => c.table === table.name && c.column === col.name && c.type === 'PRIMARY KEY'
        );
        if (pk) line += ' PRIMARY KEY';

        const unique = metadata.constraints?.find(
          c => c.table === table.name && c.column === col.name && c.type === 'UNIQUE'
        );
        if (unique) line += ' UNIQUE';

        // CHECK constraints aren't applied per column by default, so skipped here
        columnLines.push(line);
      });

      schemaString += columnLines.join(',\n') + '\n);\n\n';

      // Add CHECK constraints (not tied to column directly)
      const checkConstraints = metadata.constraints?.filter(
        c => c.table === table.name && c.type === 'CHECK'
      ) || [];
      checkConstraints.forEach((check) => {
        schemaString += `ALTER TABLE ${table.schema}.${table.name} ADD CONSTRAINT ${check.name} CHECK (...);\n`; // definition unknown
      });

      // Add foreign key constraints
      const fkConstraints = metadata.constraints?.filter(
        c => c.table === table.name && c.type === 'FOREIGN KEY'
      ) || [];
      fkConstraints.forEach((fk) => {
        schemaString += `ALTER TABLE ${table.schema}.${table.name} ADD CONSTRAINT ${fk.name} FOREIGN KEY (${fk.column}) REFERENCES ${fk.foreignTable}(${fk.foreignColumn});\n`;
      });

      // Add triggers
      const triggers = metadata.triggers?.filter(t => t.table === table.name) || [];
      triggers.forEach((trigger) => {
        schemaString += `-- Trigger: ${trigger.name} on ${table.schema}.${table.name}\n`;
        schemaString += `CREATE TRIGGER ${trigger.name} -- Event: ${trigger.event} (definition not available)\n\n`;
      });
    });

    // Stored Procedures
    if (metadata.procedures?.length > 0) {
      schemaString += `--\n-- Stored Procedures\n--\n`;
      metadata.procedures.forEach((proc) => {
        schemaString += `CREATE PROCEDURE ${proc.schema}.${proc.name}() -- definition not available;\n`;
      });
    }

    schemaString += `\n-- End of schema\n`;

    if (writeToFile) {
      const filePath = this.getMetadataFilePath()
      await fs.writeFile(filePath, schemaString, 'utf-8')
    }
    return schemaString;

}


  async getMetadata(): Promise<PostgresMetadata> {
    const rows = await Promise.all([
      // Tables
      this.dbHandler.runSQL(`
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_type = 'BASE TABLE' 
          AND table_schema NOT IN ('pg_catalog', 'information_schema')
      `),

      // Views
      this.dbHandler.runSQL(`
        SELECT table_schema, table_name 
        FROM information_schema.views 
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      `),

      // Columns
      this.dbHandler.runSQL(`
        SELECT table_schema, table_name, column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      `),

      // Procedures / Functions
      this.dbHandler.runSQL(`
        SELECT routine_schema, routine_name, data_type, routine_type
        FROM information_schema.routines 
        WHERE routine_schema NOT IN ('pg_catalog', 'information_schema')
      `),

      // Triggers
      this.dbHandler.runSQL(`
        SELECT trigger_name, event_object_schema, event_object_table, event_manipulation, action_timing, action_statement 
        FROM information_schema.triggers 
        WHERE trigger_schema NOT IN ('pg_catalog', 'information_schema')
      `),

      // Constraints (Primary, Foreign, Unique, Check)
      this.dbHandler.runSQL(`
        SELECT 
          tc.constraint_name, 
          tc.constraint_type, 
          tc.table_schema, 
          tc.table_name, 
          kcu.column_name, 
          ccu.table_schema AS foreign_table_schema,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        LEFT JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        LEFT JOIN information_schema.constraint_column_usage AS ccu
          ON tc.constraint_name = ccu.constraint_name
          AND tc.table_schema = ccu.table_schema
        WHERE tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE', 'CHECK')
          AND tc.table_schema NOT IN ('pg_catalog', 'information_schema')
          AND (
            tc.constraint_type != 'CHECK' 
            OR (
              tc.constraint_type = 'CHECK' 
              AND tc.constraint_name NOT LIKE '_____%_not_null'
            )
          )
      `)
    ]);

    const res: PostgresMetadata = {
      tables: rows[0].map((r: any) => ({
        name: r.table_name,
        schema: r.table_schema
      })),

      views: rows[1].map((r: any) => ({
        name: r.table_name,
        schema: r.table_schema
      })),

      columns: rows[2].map((r: any) => ({
        table: r.table_name,
        schema: r.table_schema,
        name: r.column_name,
        dataType: r.data_type,
        isNullable: r.is_nullable === 'YES',
        defaultValue: r.column_default
      })),

      procedures: rows[3].map((r: any) => ({
        name: r.routine_name,
        schema: r.routine_schema,
        returnType: r.data_type,
        type: r.routine_type
      })),

      triggers: rows[4].map((r: any) => ({
        name: r.trigger_name,
        schema: r.event_object_schema,
        table: r.event_object_table,
        event: r.event_manipulation,
        timing: r.action_timing,
        action: r.action_statement
      })),

      constraints: rows[5].map((r: any) => ({
        name: r.constraint_name,
        type: r.constraint_type,
        schema: r.table_schema,
        table: r.table_name,
        column: r.column_name,
        foreignSchema: r.foreign_table_schema || null,
        foreignTable: r.foreign_table_name || null,
        foreignColumn: r.foreign_column_name || null
      }))
    };

    console.log("raw metadata: ", res);
    const formatted =  await this.processMetadata(res, false);
    console.log("formatted metadata: ", formatted);
    return res;
  }
}