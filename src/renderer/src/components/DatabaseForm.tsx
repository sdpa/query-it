import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@renderer/components/ui/card";
import { Button } from "@renderer/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@renderer/components/ui/select";
import { Input } from "@renderer/components/ui/input";
import { Label } from "@renderer/components/ui/label";
import { Checkbox } from "@renderer/components/ui/checkbox";
import { Database } from "lucide-react";
import { FieldConfig } from "./types";
import { createDatabaseConfigs } from "@renderer/lib/utils";
import { DatabaseType } from "src/backend/db/types";

// Field configurations for each database type
const DATABASE_CONFIGS = createDatabaseConfigs({
  postgresql: {
    host: { type: "string", label: "Host", placeholder: "localhost", defaultValue: "" },
    port: { type: "number", label: "Port", placeholder: "5432", defaultValue: "5432" },
    database: { type: "string", label: "Database Name", placeholder: "my_database", defaultValue: "" },
    user: { type: "string", label: "Username", placeholder: "postgres", defaultValue: "" },
    password: { type: "password", label: "Password", defaultValue: "" },
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
});

// Map display names to database types
export const DATABASE_DISPLAY_NAMES: Record<DatabaseType, string> = {
  postgresql: 'PostgreSQL',
  mongodb: 'MongoDB',
  dynamodb: 'DynamoDB'
};

// Define credentials interface
interface DatabaseCredentials {
  type: DatabaseType;
  [key: string]: any;
}

export const DatabaseForm = () => {
  const navigate = useNavigate();
  const [dbType, setDbType] = useState<DatabaseType>("postgresql");
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
        Object.entries(DATABASE_CONFIGS[dbType] || {}).map(([key, config]) => [key, (config as FieldConfig).defaultValue])
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

  const getFields = () => {
    const fieldConfig = DATABASE_CONFIGS[dbType] || {};
      return Object.entries(fieldConfig).map(([fieldName, config]) =>
        renderField(fieldName, config)
      );
  };

  const fields = getFields();

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
            onValueChange={(value) => setDbType(value as DatabaseType)}
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

        {fields}
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