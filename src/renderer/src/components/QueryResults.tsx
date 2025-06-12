import { useState } from "react";
import { Play, Copy, FileDown } from "lucide-react";
import { cn } from "@renderer/lib/utils";
import { Button } from "@renderer/components/ui/button";
import { ScrollArea } from "@renderer/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@renderer/components/ui/tabs";

interface QueryResultsProps {
  query: string;
}

// Sample data - in a real app this would come from API response
const SAMPLE_RESULTS = [
  { id: "uuid-1", name: "John Doe", email: "john@example.com" },
  { id: "uuid-2", name: "Jane Smith", email: "jane@example.com" },
  { id: "uuid-3", name: "Robert Johnson", email: "robert@example.com" },
  { id: "uuid-4", name: "Lisa Brown", email: "lisa@example.com" },
  { id: "uuid-5", name: "Michael Davis", email: "michael@example.com" },
];

export const QueryResults = ({ query }: QueryResultsProps) => {
  const [results, setResults] = useState<Record<string, any>[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeQuery = () => {
    setIsLoading(true);
    setError(null);

    // In a real app, this would be an API call to execute the query
    setTimeout(() => {
      try {
        // Simple logic to determine what sample data to show based on the query
        if (query.toLowerCase().includes("select") && query.toLowerCase().includes("users")) {
          setResults(SAMPLE_RESULTS);
        } else if (query.toLowerCase().includes("select") && query.toLowerCase().includes("product")) {
          setResults([
            { id: "prod-1", name: "Laptop", price: 1299.99, category: "Electronics" },
            { id: "prod-2", name: "Headphones", price: 149.99, category: "Electronics" },
            { id: "prod-3", name: "Coffee Maker", price: 89.99, category: "Kitchen" },
          ]);
        } else if (query.toLowerCase().includes("join")) {
          setResults([
            { id: "order-1", name: "John Doe", total: 129.99, status: "Delivered" },
            { id: "order-2", name: "Jane Smith", total: 249.99, status: "Processing" },
            { id: "order-3", name: "Lisa Brown", total: 89.99, status: "Shipped" },
          ]);
        } else {
          setResults([]);
        }
        setIsLoading(false);
      } catch (err) {
        setError("An error occurred while executing the query.");
        setIsLoading(false);
      }
    }, 800);
  };

  const copyQuery = () => {
    navigator.clipboard.writeText(query);
  };

  const downloadCsv = () => {
    if (!results || results.length === 0) return;
    
    const headers = Object.keys(results[0]);
    const csvContent = [
      headers.join(","),
      ...results.map(row => 
        headers.map(header => JSON.stringify(row[header])).join(",")
      )
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "query_results.csv");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="query" className="flex-1 flex flex-col">
        <div className="border-b px-2">
          <TabsList className="h-10">
            <TabsTrigger value="query">Query</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="query" className="flex-1 flex flex-col p-0 m-0">
          <div className="flex items-center justify-between p-2 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                onClick={executeQuery} 
                disabled={!query.trim() || isLoading}
                className="h-8"
              >
                <Play className="h-3 w-3 mr-1" /> Run
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={copyQuery} 
                className="h-8"
                disabled={!query.trim()}
              >
                <Copy className="h-3 w-3 mr-1" /> Copy
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <pre className="text-sm font-mono whitespace-pre-wrap bg-muted/30 p-4 rounded-md">
              {query || "// Your SQL query will appear here"}
            </pre>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="results" className="flex-1 flex flex-col p-0 m-0">
          <div className="flex items-center justify-between p-2 border-b bg-muted/30">
            <div>
              {results ? (
                <span className="text-xs text-muted-foreground">
                  {results.length} {results.length === 1 ? "row" : "rows"}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  No results yet
                </span>
              )}
            </div>
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={downloadCsv} 
              disabled={!results || results.length === 0}
              className="h-8"
            >
              <FileDown className="h-3 w-3 mr-1" /> Export CSV
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-pulse h-2 w-20 bg-muted-foreground/20 rounded-full mx-auto mb-3"></div>
                  <p className="text-sm text-muted-foreground">Executing query...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-4 text-destructive text-sm">
                {error}
              </div>
            ) : results ? (
              results.length > 0 ? (
                <div className="p-1">
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50 border-b">
                          {Object.keys(results[0]).map((key) => (
                            <th 
                              key={key} 
                              className="p-2 text-xs font-medium text-muted-foreground text-left uppercase"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((row, i) => (
                          <tr 
                            key={i} 
                            className={cn(
                              "border-b last:border-0",
                              i % 2 === 0 ? "bg-background" : "bg-muted/20"
                            )}
                          >
                            {Object.values(row).map((value, j) => (
                              <td key={j} className="p-2">
                                {String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">No results found</p>
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">Run a query to see results</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QueryResults;