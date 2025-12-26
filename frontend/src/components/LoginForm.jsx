import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LIMITS } from '../config/constants';
import { Button, Input, Label } from './ui';
import { getStoredGuestFish } from '../hooks/useGuestTank';
import '../styles/pages/login.css';

export function LoginForm({ onAuthenticate }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const navigate = useNavigate();

  // Check if there are guest fish to sync
  const guestFish = getStoredGuestFish();
  const hasGuestFish = guestFish.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setWelcomeMessage('');
    setLoading(true);

    const result = await onAuthenticate(username, password);
    
    if (result.success) {
      // Show appropriate welcome message
      if (result.isNewUser) {
        setWelcomeMessage(
          hasGuestFish 
            ? `Account created! Syncing ${guestFish.length} fish... 🐠`
            : 'Account created! Welcome to Aquarium 🐠'
        );
      } else if (hasGuestFish) {
        setWelcomeMessage(`Welcome back! Syncing ${guestFish.length} fish... 🐠`);
      }
      
      // Navigate after a short delay to show the message
      setTimeout(() => {
        navigate('/aquarium');
      }, hasGuestFish || result.isNewUser ? 800 : 0);
    } else {
      setError(result.error || 'Authentication failed');
      setLoading(false);
    }
  };

  const handleTryWithoutAccount = () => {
    navigate('/guest');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">
          🐠 Aquarium
        </h1>
        <p className="login-subtitle">
          Enter your credentials to dive in
        </p>
        
        {/* Show guest fish badge if they have fish */}
        {hasGuestFish && (
          <div className="guest-fish-badge">
            🐠 You have {guestFish.length} fish waiting to be saved!
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
              pattern="[a-z0-9_]{3,20}"
              title={`${LIMITS.usernameMinLength}-${LIMITS.usernameMaxLength} characters: lowercase letters, numbers, and underscores`}
              required
              disabled={loading}
            />
            <p className="login-hint">
              {LIMITS.usernameMinLength}-{LIMITS.usernameMaxLength} characters: lowercase, numbers, underscores
            </p>
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={LIMITS.passwordMinLength}
              maxLength={LIMITS.passwordMaxLength}
              required
              disabled={loading}
            />
            <p className="login-hint">
              At least {LIMITS.passwordMinLength} characters
            </p>
          </div>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          {welcomeMessage && (
            <div className="success-box">
              {welcomeMessage}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Loading...' : (hasGuestFish ? 'Save Fish & Continue' : 'Continue')}
          </Button>

          <div className="divider">
            <span>or</span>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={handleTryWithoutAccount}
            disabled={loading}
          >
            Try without an account
          </Button>

          <p className="text-center text-sm text-gray-500">
            New here? Just enter a username and password to create your account.
          </p>
        </form>
      </div>
    </div>
  );
}
