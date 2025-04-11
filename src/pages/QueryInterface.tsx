import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Database, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import SchemaExplorer from "@/components/SchemaExplorer";
import QueryChat from "@/components/QueryChat";
import QueryResults from "@/components/QueryResults";

const QueryInterface = () => {
  const navigate = useNavigate();
  const [sqlQuery, setSqlQuery] = useState("");
  
  // Get database info from localStorage (in a real app, this would be handled more securely)
  const dbCredentials = JSON.parse(localStorage.getItem("dbCredentials") || "{}");
  
  const handleQueryGenerated = (query: string) => {
    setSqlQuery(query);
  };
  
  const handleDisconnect = () => {
    localStorage.removeItem("dbCredentials");
    navigate("/");
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b bg-background z-10">
      <div className="ml-3 mr-3 py-3 flex justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">Q</span>
              </div>
              <h1 className="text-lg font-bold">query.it</h1>
            </div>
            
            <div className="flex items-center text-sm">
              <Database className="h-4 w-4 mr-1 text-primary" />
              <span className="font-medium">{dbCredentials.database || "database"}</span>
              <span className="mx-1 text-muted-foreground">@</span>
              <span className="text-muted-foreground">{dbCredentials.host || "localhost"}</span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDisconnect}
          >
            <LogOut className="h-4 w-4 mr-1" /> Disconnect
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel 
            defaultSize={20} 
            minSize={15}
            maxSize={30}
            className="bg-card"
          >
            <SchemaExplorer />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={80}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel 
                defaultSize={50} 
                minSize={30}
                className="p-3"
              >
                <QueryChat onQueryGenerated={handleQueryGenerated} />
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              <ResizablePanel 
                defaultSize={50}
                minSize={20}
                className="p-3"
              >
                <QueryResults query={sqlQuery} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
};

export default QueryInterface;