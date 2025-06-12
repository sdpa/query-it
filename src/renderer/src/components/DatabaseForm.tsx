import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@renderer/components/ui/card";
import { Button } from "@renderer/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@renderer/components/ui/select";
import { Input } from "@renderer/components/ui/input";
import { Label } from "@renderer/components/ui/label";
import { Checkbox } from "@renderer/components/ui/checkbox";
import { Database } from "lucide-react";

// Define field types
type FieldType = "string" | "number" | "boolean" | "array" | "password" | "optional";

// Define field configuration
interface FieldConfig {
  type: FieldType;
  label: string;
  placeholder?: string;
  defaultValue?: any;
  optional?: boolean;
}

// Field configurations for each database type
const DATABASE_CONFIGS: Record<string, Record<string, FieldConfig>> = {
  postgresql: {
    host: { type: "string", label: "Host", placeholder: "localhost", defaultValue: "" },
    port: { type: "number", label: "Port", placeholder: "5432", defaultValue: "5432" },
    database: { type: "string", label: "Database Name", placeholder: "my_database", defaultValue: "" },
    user: { type: "string", label: "Username", placeholder: "postgres", defaultValue: "" },
    password: { type: "password", label: "Password", defaultValue: "" },
    ssl: { type: "boolean", label: "Use SSL", defaultValue: true }
  },
  mysql: {
    host: { type: "string", label: "Host", placeholder: "localhost", defaultValue: "" },
    port: { type: "number", label: "Port", placeholder: "3306", defaultValue: "3306" },
    database: { type: "string", label: "Database Name", placeholder: "my_database", defaultValue: "" },
    user: { type: "string", label: "Username", placeholder: "root", defaultValue: "" },
    password: { type: "password", label: "Password", defaultValue: "" }
  },
  sqlite: {
    filepath: { type: "string", label: "File Path", placeholder: "/path/to/database.sqlite", defaultValue: "" }
  },
  mongodb: {
    host: { type: "string", label: "Host", placeholder: "localhost", defaultValue: "" },
    port: { type: "number", label: "Port", placeholder: "27017", defaultValue: "27017" },
    database: { type: "string", label: "Database Name", placeholder: "my_database", defaultValue: "" },
    username: { type: "string", label: "Username", placeholder: "", defaultValue: "" },
    password: { type: "password", label: "Password", defaultValue: "" },
    authSource: { type: "string", label: "Auth Source", placeholder: "admin", defaultValue: "", optional: true }
  },
  dynamodb: {
    region: { type: "string", label: "Region", placeholder: "us-east-1", defaultValue: "" },
    accessKeyId: { type: "string", label: "Access Key ID", placeholder: "", defaultValue: "" },
    secretAccessKey: { type: "password", label: "Secret Access Key", defaultValue: "" },
    endpoint: { type: "string", label: "Endpoint (optional)", placeholder: "http://localhost:8000", defaultValue: "", optional: true }
  },
  redis: {
    host: { type: "string", label: "Host", placeholder: "localhost", defaultValue: "" },
    port: { type: "number", label: "Port", placeholder: "6379", defaultValue: "6379" },
    password: { type: "password", label: "Password (optional)", defaultValue: "", optional: true },
    db: { type: "number", label: "Database Index (optional)", placeholder: "0", defaultValue: "0", optional: true }
  },
  mssql: {
    host: { type: "string", label: "Host", placeholder: "localhost", defaultValue: "" },
    port: { type: "number", label: "Port", placeholder: "1433", defaultValue: "1433" },
    database: { type: "string", label: "Database Name", placeholder: "my_database", defaultValue: "" },
    user: { type: "string", label: "Username", placeholder: "sa", defaultValue: "" },
    password: { type: "password", label: "Password", defaultValue: "" },
    encrypt: { type: "boolean", label: "Encrypt Connection", defaultValue: true, optional: true }
  },
  oracle: {
    host: { type: "string", label: "Host", placeholder: "localhost", defaultValue: "" },
    port: { type: "number", label: "Port", placeholder: "1521", defaultValue: "1521" },
    serviceName: { type: "string", label: "Service Name", placeholder: "ORCL", defaultValue: "" },
    user: { type: "string", label: "Username", placeholder: "system", defaultValue: "" },
    password: { type: "password", label: "Password", defaultValue: "" }
  },
  cassandra: {
    contactPoints: { type: "string", label: "Contact Points", placeholder: "localhost", defaultValue: "" },
    localDataCenter: { type: "string", label: "Local Data Center", placeholder: "datacenter1", defaultValue: "" },
    keyspace: { type: "string", label: "Keyspace", placeholder: "my_keyspace", defaultValue: "" },
    user: { type: "string", label: "Username (optional)", placeholder: "", defaultValue: "", optional: true },
    password: { type: "password", label: "Password (optional)", defaultValue: "", optional: true }
  },
  firebase: {
    projectId: { type: "string", label: "Project ID", placeholder: "my-project", defaultValue: "" },
    clientEmail: { type: "string", label: "Client Email", placeholder: "", defaultValue: "" },
    privateKey: { type: "password", label: "Private Key", defaultValue: "" },
    databaseURL: { type: "string", label: "Database URL", placeholder: "https://my-project.firebaseio.com", defaultValue: "" }
  }
};

// Map display names to database types
const DATABASE_DISPLAY_NAMES: Record<string, string> = {
  postgresql: "PostgreSQL",
  mysql: "MySQL",
  sqlite: "SQLite",
  mongodb: "MongoDB",
  dynamodb: "DynamoDB",
  redis: "Redis",
  mssql: "Microsoft SQL Server",
  oracle: "Oracle",
  cassandra: "Cassandra",
  firebase: "Firebase"
};

// Define credentials interface
interface DatabaseCredentials {
  type: string;
  [key: string]: any;
}

export const DatabaseForm = () => {
  const navigate = useNavigate();
  const [dbType, setDbType] = useState<string>("postgresql");
  const [credentials, setCredentials] = useState<DatabaseCredentials>({
    type: "postgresql",
    ...Object.fromEntries(
      Object.entries(DATABASE_CONFIGS.postgresql).map(([key, config]) => [key, config.defaultValue])
    )
  });

  // Update credentials when database type changes
  useEffect(() => {
    setCredentials({
      type: dbType,
      ...Object.fromEntries(
        Object.entries(DATABASE_CONFIGS[dbType] || {}).map(([key, config]) => [key, config.defaultValue])
      )
    });
  }, [dbType]);

  const handleChange = (field: string, value: any) => {
    setCredentials((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConnect = () => {
    // In a real app, we would validate and store the connection details
    console.log("Connecting with:", credentials);
    localStorage.setItem("dbCredentials", JSON.stringify(credentials));
    navigate("/query");
  };
  
  // Render individual form field based on type
  const renderField = (fieldName: string, config: FieldConfig) => {
    const value = credentials[fieldName] ?? config.defaultValue;
    const fieldId = `${dbType}-${fieldName}`;
    
    switch (config.type) {
      case "boolean":
        return (
          <div key={fieldId} className="flex items-center space-x-2">
            <Checkbox
              id={fieldId}
              checked={!!value}
              onCheckedChange={(checked) => handleChange(fieldName, !!checked)}
            />
            <Label
              htmlFor={fieldId}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {config.label}
            </Label>
          </div>
        );
        
      case "password":
        return (
          <div key={fieldId} className="space-y-2">
            <Label htmlFor={fieldId}>{config.label}</Label>
            <Input
              id={fieldId}
              type="password"
              value={value || ""}
              placeholder={config.placeholder || ""}
              onChange={(e) => handleChange(fieldName, e.target.value)}
            />
          </div>
        );
        
      case "number":
        return (
          <div key={fieldId} className="space-y-2">
            <Label htmlFor={fieldId}>{config.label}</Label>
            <Input
              id={fieldId}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={value || ""}
              placeholder={config.placeholder || ""}
              onChange={(e) => handleChange(fieldName, e.target.value)}
            />
          </div>
        );
        
      default: // string and other types
        return (
          <div key={fieldId} className="space-y-2">
            <Label htmlFor={fieldId}>{config.label}</Label>
            <Input
              id={fieldId}
              value={value || ""}
              placeholder={config.placeholder || ""}
              onChange={(e) => handleChange(fieldName, e.target.value)}
            />
          </div>
        );
    }
  };

  // Group fields that should be displayed side by side (like host and port)
  const getGroupedFields = () => {
    const fieldConfig = DATABASE_CONFIGS[dbType] || {};
    const fieldEntries = Object.entries(fieldConfig);
    const groupedFields: React.ReactNode[][] = [];
    
    // Host and port are commonly paired
    const hostIndex = fieldEntries.findIndex(([field]) => field === 'host');
    const portIndex = fieldEntries.findIndex(([field]) => field === 'port');
    
    if (hostIndex !== -1 && portIndex !== -1) {
      // Create a pair
      groupedFields.push([
        renderField('host', fieldConfig.host),
        renderField('port', fieldConfig.port)
      ]);
      
      // Remove these fields from our list
      fieldEntries.splice(Math.max(hostIndex, portIndex), 1);
      fieldEntries.splice(Math.min(hostIndex, portIndex), 1);
    }
    
    // Render the remaining fields normally
    const remainingFields = fieldEntries.map(([fieldName, config]) => 
      renderField(fieldName, config)
    );
    
    return { groupedFields, remainingFields };
  };

  const { groupedFields, remainingFields } = getGroupedFields();

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center space-x-2">
          <Database className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl">Connect Database</CardTitle>
        </div>
        <CardDescription>
          Enter your database credentials to connect
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="type">Database Type</Label>
          <Select
            value={dbType}
            onValueChange={(value) => setDbType(value)}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Select database type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DATABASE_DISPLAY_NAMES).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {groupedFields.map((group, index) => (
          <div key={`group-${index}`} className="grid grid-cols-2 gap-4">
            {group}
          </div>
        ))}

        {remainingFields}
      </CardContent>
      <CardFooter>
        <Button onClick={handleConnect} className="w-full">
          Connect
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DatabaseForm;