import { useEffect, useState } from 'react'
import { Database, LogOut } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@renderer/components/ui/resizable'
import { MetadataExplorer } from '@renderer/components/MetadataExplorer'
import QueryChat from '@renderer/components/QueryChat'
import QueryResults from '@renderer/components/QueryResults'
import { PostgresMetadata } from 'src/backend/services/metadata/types'
import { useNavigate } from 'react-router-dom'

const QueryInterface: React.FC = () => {
  const navigate = useNavigate();
  const [sqlQuery, setSqlQuery] = useState('')
  const [metadata, setMetadata] = useState<PostgresMetadata | null>(null)
  const [isMetadataLoading, setIsMetadataLoading] = useState<boolean>(true)

  // Get database info from localStorage (in a real app, this would be handled more securely)
  const dbCredentials = JSON.parse(localStorage.getItem('dbCredentials') || '{}')

  const handleQueryGenerated = (query: string): void => {
    setSqlQuery(query)
  }

  useEffect(() => {
    setIsMetadataLoading(true)
    window.api.getMetadata().then((metadata) => {
      setMetadata(metadata)
      setIsMetadataLoading(false)
    })
  }, [])

  const handleDisconnect = async (): Promise<void> => {
    // Clear credentials from localStorage
    await window.api.disconnectDB()
    navigate("/");
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b bg-background z-10">
        <div className="container py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">Q</span>
              </div>
              <h1 className="text-lg font-bold">query.it</h1>
            </div>

            <div className="flex items-center text-sm">
              <Database className="h-4 w-4 mr-1 text-primary" />
              <span className="font-medium">{dbCredentials.database || 'database'}</span>
              <span className="mx-1 text-muted-foreground">@</span>
              <span className="text-muted-foreground">{dbCredentials.host || 'localhost'}</span>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={handleDisconnect}>
            <LogOut className="h-4 w-4 mr-1" /> Disconnect
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-card">
            <MetadataExplorer isLoading={isMetadataLoading} metadata={metadata} />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={80}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={50} minSize={30} className="p-3">
                <QueryChat onQueryGenerated={handleQueryGenerated} />
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={50} minSize={20} className="p-3">
                <QueryResults query={sqlQuery} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  )
}

export default QueryInterface
