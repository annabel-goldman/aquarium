import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from './hooks/useSession';
import { LoginForm } from './components/LoginForm';
import { TankPage } from './pages/TankPage';
import { LakePage } from './pages/LakePage';
import { ClosetPage } from './pages/ClosetPage';
import { ShopPage } from './pages/ShopPage';

function App() {
  const { username, loading, authenticate, isAuthenticated } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-400 via-blue-500 to-blue-700">
        <div className="text-xl text-white font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/tank" replace />
            ) : (
              <LoginForm onAuthenticate={authenticate} />
            )
          }
        />
        
        {/* Main Tank (Home) - works for both auth and unauth */}
        <Route
          path="/tank"
          element={<TankPage username={username} isAuthenticated={isAuthenticated} />}
        />
        
        {/* Fishing Lake - works for both auth and unauth */}
        <Route
          path="/lake"
          element={<LakePage username={username} isAuthenticated={isAuthenticated} />}
        />
        
        {/* Closet - works for both auth and unauth */}
        <Route
          path="/closet"
          element={<ClosetPage username={username} isAuthenticated={isAuthenticated} />}
        />
        
        {/* Shop - works for both auth and unauth */}
        <Route
          path="/shop"
          element={<ShopPage username={username} isAuthenticated={isAuthenticated} />}
        />
        
        {/* Default route - redirect to tank */}
        <Route
          path="/"
          element={<Navigate to="/tank" replace />}
        />
        
        {/* Legacy redirects */}
        <Route path="/guest" element={<Navigate to="/tank" replace />} />
        <Route path="/aquarium" element={<Navigate to="/tank" replace />} />
        <Route path="/tanks/:tankId" element={<Navigate to="/tank" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
