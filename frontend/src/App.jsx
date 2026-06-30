import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from './hooks/useSession';

const LoginForm = lazy(() => import('./components/LoginForm').then(module => ({ default: module.LoginForm })));
const TankPage = lazy(() => import('./pages/TankPage').then(module => ({ default: module.TankPage })));
const LakePage = lazy(() => import('./pages/LakePage').then(module => ({ default: module.LakePage })));
const ClosetPage = lazy(() => import('./pages/ClosetPage').then(module => ({ default: module.ClosetPage })));
const ShopPage = lazy(() => import('./pages/ShopPage').then(module => ({ default: module.ShopPage })));

function LoadingScreen({ text = 'Loading...' }) {
  return (
    <div className="fullscreen-center bg-ocean">
      <div className="text-xl text-white font-medium">{text}</div>
    </div>
  );
}

function App() {
  const { username, loading, authenticate, isAuthenticated } = useSession();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
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
          
          {/* Default route - start everyone at the lake */}
          <Route
            path="/"
            element={<Navigate to="/lake" replace />}
          />
          
          {/* Legacy redirects */}
          <Route path="/guest" element={<Navigate to="/lake" replace />} />
          <Route path="/aquarium" element={<Navigate to="/lake" replace />} />
          <Route path="/tanks/:tankId" element={<Navigate to="/tank" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
