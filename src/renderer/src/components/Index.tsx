import { Card, CardContent } from '@renderer/components/ui/card'
import DatabaseForm from '@renderer/components/DatabaseForm'

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="container py-4 flex items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">Q</span>
            </div>
            <h1 className="text-xl font-bold">query.it</h1>
          </div>
          <div className="ml-auto text-sm text-muted-foreground">Database Query Playground</div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 bg-muted/20">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Connect to Your Database</h2>
          <p className="text-muted-foreground max-w-md">
            Enter your database credentials to start exploring and querying your data
          </p>
        </div>

        <Card className="w-full max-w-screen-lg">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2">
              <div className="p-8 flex items-center justify-center">
                <div className="w-full max-w-md">
                  <DatabaseForm />
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/80 to-accent/90 text-white rounded-r-lg p-8 flex flex-col justify-center">
                <h3 className="text-2xl font-semibold mb-4">Database Query Playground</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Connect to your database</p>
                      <p className="text-sm text-white/80">
                        Enter your database credentials to establish a connection
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Explore your schema</p>
                      <p className="text-sm text-white/80">
                        Browse tables, columns, and relationships
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Ask for queries in plain English</p>
                      <p className="text-sm text-white/80">
                        Our AI will help you generate SQL queries based on your needs
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 mt-0.5">
                      4
                    </div>
                    <div>
                      <p className="font-medium">Run queries and explore results</p>
                      <p className="text-sm text-white/80">
                        Execute your queries and analyze the data in a beautiful interface
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t py-4">
        <div className="container">
          <p className="text-sm text-center text-muted-foreground">
            © {new Date().getFullYear()} query.it — The Modern Database Query Playground
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Index
