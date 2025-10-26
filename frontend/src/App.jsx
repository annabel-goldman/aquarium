import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from './hooks/useSession';
import { LoginForm } from './components/LoginForm';
import { AquariumPage } from './pages/AquariumPage';
import { TankPage } from './pages/TankPage';

function App() {
  const { username, loading, login, register, logout, isAuthenticated } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/aquarium" replace />
            ) : (
              <LoginForm onLogin={login} onRegister={register} />
            )
          }
        />
        <Route
          path="/aquarium"
          element={
            isAuthenticated ? (
              <AquariumPage username={username} onLogout={logout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/tanks/:tankId"
          element={
            isAuthenticated ? (
              <TankPage username={username} onLogout={logout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* Redirect old /tank route to new /aquarium route */}
        <Route path="/tank" element={<Navigate to="/aquarium" replace />} />
        <Route path="/" element={<Navigate to="/aquarium" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

