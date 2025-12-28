import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from './hooks/useSession';
import { LoginForm } from './components/LoginForm';
import { TankPage } from './pages/TankPage';
import { LakePage } from './pages/LakePage';
import { ClosetPage } from './pages/ClosetPage';
import { ShopPage } from './pages/ShopPage';
import { GuestTankPage } from './pages/GuestTankPage';

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
        
        {/* Main Tank (Home) */}
        <Route
          path="/tank"
          element={
            isAuthenticated ? (
              <TankPage username={username} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        {/* Fishing Lake */}
        <Route
          path="/lake"
          element={
            isAuthenticated ? (
              <LakePage username={username} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        {/* Closet */}
        <Route
          path="/closet"
          element={
            isAuthenticated ? (
              <ClosetPage username={username} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        {/* Shop */}
        <Route
          path="/shop"
          element={
            isAuthenticated ? (
              <ShopPage username={username} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        {/* Default route */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/tank" replace />
            ) : (
              <GuestTankPage />
            )
          }
        />
        
        {/* Legacy redirects */}
        <Route path="/guest" element={<Navigate to="/" replace />} />
        <Route path="/aquarium" element={<Navigate to="/tank" replace />} />
        <Route path="/tanks/:tankId" element={<Navigate to="/tank" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
