// import { Button } from '@renderer/components/ui/button'
import QueryInterface from './components/QueryInterface'
import Index from "./components/Index"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

const RequireConnection = ({ children }: { children: React.ReactNode }) => {
  const hasConnection = localStorage.getItem("dbCredentials");
  if (!hasConnection) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function App(): React.JSX.Element {
  return (
    // <div className="flex flex-col items-center justify-center min-h-svh">
    // <Button variant="secondary" size="lg">
    //   ShadCN Button
    // </Button>
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route 
            path="/query" 
            element={
              <RequireConnection>
                <QueryInterface />
              </RequireConnection>
            } 
          />
        </Routes>
      </BrowserRouter>
    // </div>
  )
}

export default App
