import { useState } from 'react'
import { ChevronRight, ChevronDown, Database, Table, KeyRound, Columns } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { Button } from '@renderer/components/ui/button'
import { ScrollArea } from '@renderer/components/ui/scroll-area'

// Types for database schema
interface Column {
  name: string
  type: string
  isPrimary: boolean
}

interface Table {
  name: string
  schema: string
  columns: Column[]
}

interface Schema {
  name: string
  tables: Table[]
}

// Sample data - in a real app this would come from an API
const SAMPLE_DATA: Schema[] = [
  {
    name: 'public',
    tables: [
      {
        name: 'users',
        schema: 'public',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'email', type: 'varchar', isPrimary: false },
          { name: 'name', type: 'varchar', isPrimary: false },
          { name: 'created_at', type: 'timestamp', isPrimary: false }
        ]
      },
      {
        name: 'products',
        schema: 'public',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'name', type: 'varchar', isPrimary: false },
          { name: 'price', type: 'decimal', isPrimary: false },
          { name: 'category', type: 'varchar', isPrimary: false },
          { name: 'in_stock', type: 'boolean', isPrimary: false }
        ]
      },
      {
        name: 'orders',
        schema: 'public',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'user_id', type: 'uuid', isPrimary: false },
          { name: 'status', type: 'varchar', isPrimary: false },
          { name: 'total', type: 'decimal', isPrimary: false },
          { name: 'created_at', type: 'timestamp', isPrimary: false }
        ]
      }
    ]
  },
  {
    name: 'auth',
    tables: [
      {
        name: 'users',
        schema: 'auth',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'role', type: 'varchar', isPrimary: false },
          { name: 'permissions', type: 'jsonb', isPrimary: false }
        ]
      }
    ]
  }
]

export const SchemaExplorer = (): React.JSX.Element => {
  const [schemas] = useState<Schema[]>(SAMPLE_DATA)
  const [expandedSchemas, setExpandedSchemas] = useState<Record<string, boolean>>({
    public: true
  })
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({})

  const toggleSchema = (schemaName: string): void => {
    setExpandedSchemas((prev) => ({
      ...prev,
      [schemaName]: !prev[schemaName]
    }))
  }

  const toggleTable = (tableId: string): void => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableId]: !prev[tableId]
    }))
  }

  const getTableId = (schema: string, table: string): string => `${schema}.${table}`

  return (
    <div className="h-full border-r bg-card p-2">
      <div className="flex items-center p-2 mb-2">
        <Database className="h-5 w-5 mr-2 text-primary" />
        <h3 className="font-semibold">Database Explorer</h3>
      </div>

      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="space-y-1">
          {schemas.map((schema) => (
            <div key={schema.name} className="text-sm">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'w-full justify-start px-2 font-normal',
                  expandedSchemas[schema.name] && 'bg-muted'
                )}
                onClick={() => toggleSchema(schema.name)}
              >
                {expandedSchemas[schema.name] ? (
                  <ChevronDown className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1" />
                )}
                <span className="ml-1">{schema.name}</span>
              </Button>

              {expandedSchemas[schema.name] && (
                <div className="ml-4 mt-1 space-y-1">
                  {schema.tables.map((table) => {
                    const tableId = getTableId(schema.name, table.name)
                    return (
                      <div key={tableId}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            'w-full justify-start px-2 font-normal',
                            expandedTables[tableId] && 'bg-muted'
                          )}
                          onClick={() => toggleTable(tableId)}
                        >
                          {expandedTables[tableId] ? (
                            <ChevronDown className="h-4 w-4 mr-1" />
                          ) : (
                            <ChevronRight className="h-4 w-4 mr-1" />
                          )}
                          <Table className="h-4 w-4 mr-1" />
                          <span>{table.name}</span>
                        </Button>

                        {expandedTables[tableId] && (
                          <div className="ml-6 mt-1 space-y-1">
                            {table.columns.map((column) => (
                              <div
                                key={`${tableId}.${column.name}`}
                                className="flex items-center px-2 py-1 text-xs"
                              >
                                {column.isPrimary ? (
                                  <KeyRound className="h-3 w-3 mr-1 text-yellow-500" />
                                ) : (
                                  <Columns className="h-3 w-3 mr-1 text-muted-foreground" />
                                )}
                                <span className={column.isPrimary ? 'font-medium' : ''}>
                                  {column.name}
                                </span>
                                <span className="ml-auto text-muted-foreground">{column.type}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

export default SchemaExplorer
