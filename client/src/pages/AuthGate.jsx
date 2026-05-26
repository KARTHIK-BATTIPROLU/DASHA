import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthGate = ({ onSuccess, message }) => {
  const { loginWithEmail, signupWithEmail, loginWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      try {
        await signupWithEmail(email, password);
        if (onSuccess) onSuccess();
      } catch (err) {
        console.error(err);
        setError(err.message.replace('Firebase:', '').trim());
      }
    } else {
      try {
        await loginWithEmail(email, password);
        if (onSuccess) onSuccess();
      } catch (err) {
        console.error(err);
        setError(err.message.replace('Firebase:', '').trim());
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.message.replace('Firebase:', '').trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-gate-wrapper">
      <div className="auth-card glass-card animate-float">
        <div className="auth-header">
          <div className="auth-badge-icon">🎓</div>
          <h2 className="auth-title">{isSignUp ? 'Create Account' : 'Student Access Portal'}</h2>
          <p className="auth-subtitle">
            {message || 'Sign in to access and download Telangana college allotment PDF resources.'}
          </p>
        </div>

        {error && (
          <div className="error-alert">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email Address</label>
            <input
              type="email"
              id="auth-email"
              className="form-input"
              placeholder="e.g. karthik@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password</label>
            <input
              type="password"
              id="auth-password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {isSignUp && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-confirm-password">Confirm Password</label>
              <input
                type="password"
                id="auth-confirm-password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (isSignUp ? 'Register & Unlock' : 'Sign In & Access')}
          </button>
        </form>

        <div className="divider-row">
          <span className="divider-line"></span>
          <span className="divider-text">OR</span>
          <span className="divider-line"></span>
        </div>

        {/* Google OAuth Login Button */}
        <button 
          onClick={handleGoogleSignIn} 
          className="btn-secondary google-auth-btn"
          disabled={loading}
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
            <path fill="#ea4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-5.136 4.113-3.41 0-6.19-2.774-6.19-6.185 0-3.41 2.78-6.185 6.19-6.185 1.5 0 2.87.54 3.94 1.43l3.05-3.04C18.8 1.915 15.74 1 12.24 1 6.04 1 1 6.03 1 12.23s5.04 11.23 11.24 11.23c6 0 10.92-4.36 10.92-11.23 0-.76-.07-1.49-.2-2.185H12.24z" />
          </svg>
          Continue with Google
        </button>

        <div className="toggle-flow-row">
          <button 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="toggle-flow-btn"
            type="button"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>

      <style>{`
        .auth-gate-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 20px;
        }

        .auth-card {
          width: 100%;
          max-width: 480px;
          padding: 40px;
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(19, 25, 43, 0.7);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .auth-badge-icon {
          font-size: 2.2rem;
          width: 65px;
          height: 65px;
          border-radius: 50%;
          background: rgba(0, 242, 254, 0.05);
          border: 1px solid rgba(0, 242, 254, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          box-shadow: var(--shadow-glow-cyan);
        }

        .auth-title {
          font-size: 1.6rem;
          color: var(--text-primary);
        }

        .auth-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
          max-width: 320px;
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(244, 63, 94, 0.08);
          border: 1px solid rgba(244, 63, 94, 0.15);
          color: #fda4af;
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          font-size: 0.82rem;
          margin-bottom: 24px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .auth-submit-btn {
          margin-top: 10px;
          width: 100%;
          justify-content: center;
        }

        .divider-row {
          display: flex;
          align-items: center;
          margin: 24px 0;
          gap: 12px;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: var(--border-glass);
        }

        .divider-text {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .google-auth-btn {
          width: 100%;
          justify-content: center;
          height: 48px;
          font-size: 0.9rem;
          background: rgba(255, 255, 255, 0.02);
          transition: var(--transition-spring);
        }

        .google-auth-btn:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .google-icon {
          margin-right: 10px;
        }

        .toggle-flow-row {
          margin-top: 24px;
          text-align: center;
        }

        .toggle-flow-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 0.85rem;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .toggle-flow-btn:hover {
          color: var(--accent-cyan);
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default AuthGate;
