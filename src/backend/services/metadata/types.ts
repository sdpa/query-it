export interface PostgresTableInfo {
  name: string;
  schema: string;
}

export interface PostgresColumnInfo {
  table: string;
  name: string;
  dataType: string;
}

export interface PostgresProcedureInfo {
  name: string;
  schema: string;
}

export interface PostgresTriggerInfo {
  name: string;
  table: string;
  event: string;
}

export interface PostgresConstraintInfo {
  name: string;
  type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK';
  table: string;
  column: string;
  foreignTable?: string | null;
  foreignColumn?: string | null;
}

export interface PostgresMetadata {
  tables: PostgresTableInfo[];
  views: PostgresTableInfo[];
  columns: PostgresColumnInfo[];
  procedures: PostgresProcedureInfo[];
  triggers: PostgresTriggerInfo[];
  constraints: PostgresConstraintInfo[];
}