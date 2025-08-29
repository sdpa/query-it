// Define field types
type FieldType = 'string' | 'number' | 'boolean' | 'array' | 'password' | 'optional'

// Define field configuration
export interface FieldConfig {
  type: FieldType
  label: string
  placeholder?: string
  defaultValue?: any
  optional?: boolean
}
