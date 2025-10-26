import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LIMITS } from '../config/constants';

export function LoginForm({ onLogin, onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = isRegistering 
      ? await onRegister(username, password)
      : await onLogin(username, password);
    
    if (result.success) {
      navigate('/tank');
    } else {
      setError(result.error || `Failed to ${isRegistering ? 'register' : 'login'}`);
      setLoading(false);
    }
  };

  return (
    <div className="login-container flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          🐠 Aquarium V2
        </h1>
        <p className="text-center text-gray-600 mb-6">
          {isRegistering ? 'Create your account' : 'Sign in to access your tanks'}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="annabel"
              pattern="[a-z0-9_]{3,20}"
              title={`${LIMITS.usernameMinLength}-${LIMITS.usernameMaxLength} characters: lowercase letters, numbers, and underscores`}
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {LIMITS.usernameMinLength}-{LIMITS.usernameMaxLength} characters: lowercase letters, numbers, and underscores only
            </p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength="8"
              maxLength="100"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              At least 8 characters
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Loading...' : (isRegistering ? 'Create Account' : 'Sign In')}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
              disabled={loading}
            >
              {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

