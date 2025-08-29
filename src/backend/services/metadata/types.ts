export interface PostgresTableInfo {
  name: string
  schema: string
}

export interface PostgresColumnInfo {
  table: string
  schema: string
  name: string
  dataType: string
  isNullable?: boolean
  defaultValue?: string | null
}

export interface PostgresProcedureInfo {
  name: string
  schema: string
  returnType?: string // Optional: for more detail
  type?: 'FUNCTION' | 'PROCEDURE' // optional if you distinguish them
}

export interface PostgresTriggerInfo {
  name: string
  table: string
  schema: string
  event: string
  timing: 'BEFORE' | 'AFTER' | 'INSTEAD OF'
  action: string // raw SQL body
}

export type ConstraintType = 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK'

export interface PostgresConstraintInfo {
  name: string
  type: ConstraintType
  schema: string
  table: string
  column: string
  foreignSchema?: string | null
  foreignTable?: string | null
  foreignColumn?: string | null
}

export interface PostgresIndexInfo {
  table: string
  index: string
  column: string
  isUnique: boolean
  isPrimary: boolean
}

export interface PostgresMetadata {
  tables: PostgresTableInfo[]
  views: PostgresTableInfo[]
  columns: PostgresColumnInfo[]
  procedures: PostgresProcedureInfo[]
  triggers: PostgresTriggerInfo[]
  constraints: PostgresConstraintInfo[]
  indexes?: PostgresIndexInfo[] // optional
}
