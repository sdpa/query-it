// import { Button } from '@renderer/components/ui/button'
import QueryInterface from './components/QueryInterface'
import Index from "./components/Index"
import ChatView from './components/ChatView' // Import the ChatView component
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";

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
      {/* Basic navigation links - you might want to integrate this into a proper Nav component */}
      <nav style={{ padding: '10px', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
        <Link to="/" style={{ marginRight: '10px' }}>Home/Connect</Link>
        <Link to="/query" style={{ marginRight: '10px' }}>Query Interface</Link>
        <Link to="/chat">Postgres Chat Expert</Link>
      </nav>
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
        <Route path="/chat" element={<ChatView />} /> {/* Add route for ChatView */}
      </Routes>
    </BrowserRouter>
    // </div>
  )
}

export default App
