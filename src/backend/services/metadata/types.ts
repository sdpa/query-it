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

export interface PostgresMetadata {
  tables: PostgresTableInfo[];
  views: PostgresTableInfo[];
  columns: PostgresColumnInfo[];
  procedures: PostgresProcedureInfo[];
  triggers: PostgresTriggerInfo[];
}