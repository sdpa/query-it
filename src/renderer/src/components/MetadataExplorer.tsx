import { useState, useEffect } from 'react'
import {
  ChevronRight,
  ChevronDown,
  Database,
  Table,
  // KeyRound, // KeyRound was removed as isPrimary is not in PostgresColumnInfo
  Columns,
  FileText, // Icon for Views
  DatabaseZap, // Icon for Procedures
  AlertTriangle, // Icon for Triggers
  Loader2, // Icon for Loading Spinner
  KeyRound,
  Link2,
  ShieldCheck
} from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { Button } from '@renderer/components/ui/button'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import {
  PostgresConstraintInfo,
  PostgresMetadata,
  PostgresProcedureInfo,
  PostgresTableInfo
} from 'src/backend/services/metadata/types'

interface MetadataExplorerProps {
  isLoading: boolean
  metadata?: PostgresMetadata | null // Allow null or undefined if no data yet
}

// Helper to group data by schema - remains largely the same
// but now it must handle potentially undefined metadata
const groupDataBySchema = (
  metadata?: PostgresMetadata | null
): Record<
  string,
  {
    tables: PostgresTableInfo[]
    views: PostgresTableInfo[]
    procedures: PostgresProcedureInfo[]
    constraints: PostgresConstraintInfo[] // Optional if not used in this component
  }
> => {
  const grouped: Record<
    string,
    {
      tables: PostgresTableInfo[]
      views: PostgresTableInfo[]
      procedures: PostgresProcedureInfo[]
      constraints: PostgresConstraintInfo[] // Optional if not used in this component
    }
  > = {}

  if (!metadata) {
    return grouped
  }

  metadata.tables.forEach((table) => {
    if (!grouped[table.schema]) {
      grouped[table.schema] = { tables: [], views: [], procedures: [], constraints: [] }
    }
    grouped[table.schema].tables.push(table)
  })

  metadata.views.forEach((view) => {
    if (!grouped[view.schema]) {
      grouped[view.schema] = { tables: [], views: [], procedures: [], constraints: [] }
    }
    grouped[view.schema].views.push(view)
  })

  metadata.procedures.forEach((proc) => {
    if (!grouped[proc.schema]) {
      grouped[proc.schema] = { tables: [], views: [], procedures: [], constraints: [] }
    }
    grouped[proc.schema].procedures.push(proc)
  })

  metadata.constraints.forEach((constraint) => {
    if (!grouped[constraint.table]) {
      grouped[constraint.table] = { tables: [], views: [], procedures: [], constraints: [] }
    }
    grouped[constraint.table].constraints.push(constraint)
  })

  return grouped
}

export const MetadataExplorer = ({
  isLoading,
  metadata
}: MetadataExplorerProps): React.JSX.Element => {
  const [expandedSchemas, setExpandedSchemas] = useState<Record<string, boolean>>({})
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  // Effect to reset expanded states when metadata changes (e.g., new connection)
  // And to expand 'public' schema by default if present
  useEffect(() => {
    setExpandedSchemas({})
    setExpandedItems({})
    if (metadata) {
      const defaultSchemaToExpand = 'public' // Or determine based on available schemas
      const availableSchemas = Object.keys(groupDataBySchema(metadata))
      if (availableSchemas.includes(defaultSchemaToExpand)) {
        setExpandedSchemas((prev) => ({ ...prev, [defaultSchemaToExpand]: true }))
      } else if (availableSchemas.length > 0) {
        // Expand the first available schema if 'public' is not there
        setExpandedSchemas((prev) => ({ ...prev, [availableSchemas[0]]: true }))
      }
    }
  }, [metadata])

  const toggleExpand = (id: string): void => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleSchema = (schemaName: string): void => {
    setExpandedSchemas((prev) => ({ ...prev, [schemaName]: !prev[schemaName] }))
  }

  const getItemId = (type: string, schema: string, name: string): string =>
    `${type}:${schema}.${name}`

  if (isLoading) {
    return (
      <div className="h-full border-r bg-card p-2 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Loading metadata...</p>
      </div>
    )
  }

  if (!metadata) {
    return (
      <div className="h-full border-r bg-card p-2 flex flex-col items-center justify-center">
        <Database className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No metadata loaded.</p>
        <p className="text-xs text-muted-foreground text-center mt-1">
          Connect to a database to see its structure.
        </p>
      </div>
    )
  }

  const groupedData = groupDataBySchema(metadata)
  const schemas = Object.keys(groupedData).sort()

  if (schemas.length === 0 && metadata.columns.length === 0) {
    return (
      <div className="h-full border-r bg-card p-2 flex flex-col items-center justify-center">
        <Database className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Metadata is empty.</p>
      </div>
    )
  }

  return (
    <div className="h-full border-r bg-card p-2">
      <div className="flex items-center p-2 mb-2">
        <Database className="h-5 w-5 mr-2 text-primary" />
        <h3 className="font-semibold">Metadata Explorer</h3>
      </div>

      <ScrollArea className="h-[calc(100vh-10rem)]">
        {' '}
        {/* Adjust height as needed */}
        <div className="space-y-1">
          {schemas.map((schemaName) => {
            const schemaData = groupedData[schemaName]
            // Skip rendering schema if it has no tables, views, or procedures
            if (
              schemaData.tables.length === 0 &&
              schemaData.views.length === 0 &&
              schemaData.procedures.length === 0
            ) {
              return null
            }

            return (
              <div key={schemaName} className="text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'w-full justify-start px-2 font-normal',
                    expandedSchemas[schemaName] && 'bg-muted'
                  )}
                  onClick={() => toggleSchema(schemaName)}
                >
                  {expandedSchemas[schemaName] ? (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-1" />
                  )}
                  <span className="ml-1 font-semibold">{schemaName}</span>
                </Button>

                {expandedSchemas[schemaName] && (
                  <div className="ml-4 mt-1 space-y-1">
                    {/* Tables Section */}
                    {schemaData.tables.length > 0 && (
                      <div className="text-xs text-muted-foreground pl-2 pb-1 pt-1">TABLES</div>
                    )}
                    {schemaData.tables.map((table) => {
                      const tableId = getItemId('table', schemaName, table.name)
                      const columnsId = getItemId('columns', schemaName, table.name)
                      const constraintsId = getItemId('constraints', schemaName, table.name)

                      const tableColumns = metadata.columns.filter(
                        (col) => col.table === table.name
                      )
                      const tableTriggers = metadata.triggers.filter(
                        (trg) => trg.table === table.name
                      )
                      const tableConstraints =
                        metadata.constraints?.filter((c) => c.table === table.name) || []

                      return (
                        <div key={tableId}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              'w-full justify-start px-2 font-normal',
                              expandedItems[tableId] && 'bg-muted'
                            )}
                            onClick={() => toggleExpand(tableId)}
                          >
                            {expandedItems[tableId] ? (
                              <ChevronDown className="h-4 w-4 mr-1" />
                            ) : (
                              <ChevronRight className="h-4 w-4 mr-1" />
                            )}
                            <Table className="h-4 w-4 mr-1" />
                            <span>{table.name}</span>
                          </Button>

                          {expandedItems[tableId] && (
                            <div className="ml-6 mt-1 space-y-1">
                              {/* Columns Group */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  'w-full justify-start px-2 text-xs',
                                  expandedItems[columnsId] && 'bg-muted'
                                )}
                                onClick={() => toggleExpand(columnsId)}
                              >
                                {expandedItems[columnsId] ? (
                                  <ChevronDown className="h-3 w-3 mr-1" />
                                ) : (
                                  <ChevronRight className="h-3 w-3 mr-1" />
                                )}
                                <Columns className="h-3 w-3 mr-1 text-muted-foreground" />
                                Columns
                              </Button>
                              {expandedItems[columnsId] && (
                                <div className="ml-4 space-y-1">
                                  {tableColumns.map((column) => (
                                    <div
                                      key={`${tableId}.${column.name}`}
                                      className="flex items-center px-2 py-1 text-xs"
                                    >
                                      <span>{column.name}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Constraints Group */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  'w-full justify-start px-2 text-xs',
                                  expandedItems[constraintsId] && 'bg-muted'
                                )}
                                onClick={() => toggleExpand(constraintsId)}
                              >
                                {expandedItems[constraintsId] ? (
                                  <ChevronDown className="h-3 w-3 mr-1" />
                                ) : (
                                  <ChevronRight className="h-3 w-3 mr-1" />
                                )}
                                <KeyRound className="h-3 w-3 mr-1 text-muted-foreground" />
                                Constraints
                              </Button>
                              {expandedItems[constraintsId] && (
                                <div className="ml-4 space-y-1">
                                  {tableConstraints.map((constraint) => (
                                    <div
                                      key={`${tableId}.constraint.${constraint.name}`}
                                      className="flex items-center px-2 py-1 text-xs"
                                    >
                                      {constraint.type === 'PRIMARY KEY' ||
                                      constraint.type === 'UNIQUE' ? (
                                        <KeyRound className="h-3 w-3 mr-1 text-blue-500" />
                                      ) : constraint.type === 'FOREIGN KEY' ? (
                                        <Link2 className="h-3 w-3 mr-1 text-green-500" />
                                      ) : (
                                        <ShieldCheck className="h-3 w-3 mr-1 text-yellow-500" />
                                      )}
                                      <span>{constraint.name}</span>
                                      <span className="ml-auto text-muted-foreground">
                                        {constraint.type}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Triggers */}
                              {tableTriggers.map((trigger) => (
                                <div
                                  key={`${tableId}.trigger.${trigger.name}`}
                                  className="flex items-center px-2 py-1 text-xs"
                                >
                                  <AlertTriangle className="h-3 w-3 mr-1 text-orange-500" />
                                  <span>{trigger.name}</span>
                                  <span className="ml-auto text-muted-foreground">
                                    {trigger.event}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* Views Section */}
                    {schemaData.views.length > 0 && (
                      <div className="text-xs text-muted-foreground pl-2 pb-1 pt-2">VIEWS</div>
                    )}
                    {schemaData.views.map((view) => {
                      const viewId = getItemId('view', schemaName, view.name)
                      const viewColumns = metadata.columns.filter(
                        (col) => col.table === view.name // Assuming col.table for views refers to view name
                      )
                      return (
                        <div key={viewId}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              'w-full justify-start px-2 font-normal',
                              expandedItems[viewId] && 'bg-muted'
                            )}
                            onClick={() => toggleExpand(viewId)}
                          >
                            {expandedItems[viewId] ? (
                              <ChevronDown className="h-4 w-4 mr-1" />
                            ) : (
                              <ChevronRight className="h-4 w-4 mr-1" />
                            )}
                            <FileText className="h-4 w-4 mr-1" />
                            <span>{view.name}</span>
                          </Button>
                          {expandedItems[viewId] && (
                            <div className="ml-6 mt-1 space-y-1">
                              {viewColumns.map((column) => (
                                <div
                                  key={`${viewId}.${column.name}`}
                                  className="flex items-center px-2 py-1 text-xs"
                                >
                                  <Columns className="h-3 w-3 mr-1 text-muted-foreground" />
                                  <span>{column.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* Procedures Section */}
                    {schemaData.procedures.length > 0 && (
                      <div className="text-xs text-muted-foreground pl-2 pb-1 pt-2">PROCEDURES</div>
                    )}
                    {schemaData.procedures.map((proc) => {
                      const procId = getItemId('procedure', schemaName, proc.name)
                      return (
                        <div key={procId} className="flex items-center px-2 py-1 text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start px-2 font-normal"
                          >
                            <DatabaseZap className="h-4 w-4 mr-1" />
                            <span>{proc.name}</span>
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

export default MetadataExplorer
