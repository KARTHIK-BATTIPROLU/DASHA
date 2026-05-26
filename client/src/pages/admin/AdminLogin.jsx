import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // If already logged in, redirect straight to dashboard
    if (localStorage.getItem('adminToken')) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${apiBase}/api/admin/login`, {
        username,
        password
      });

      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminUser', res.data.username);
      
      // Force redirect to admin dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Incorrect username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card glass-card animate-float">
        <div className="login-header">
          <div className="login-logo-glow">🔒</div>
          <h2 className="login-title">Admin Console</h2>
          <p className="login-subtitle">Hyderabad Coders College Selection Platform</p>
        </div>

        {error && (
          <div className="error-alert">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="form-input"
              placeholder="Enter administrative username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary login-btn"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>
      </div>

      <style>{`
        .login-page-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .login-card {
          width: 100%;
          max-width: 450px;
          padding: 40px;
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: var(--shadow-premium);
        }

        .login-header {
          text-align: center;
          margin-bottom: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .login-logo-glow {
          font-size: 2.2rem;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: rgba(124, 58, 237, 0.1);
          border: 1px solid rgba(124, 58, 237, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          box-shadow: var(--shadow-glow-purple);
        }

        .login-title {
          font-size: 1.75rem;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .login-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.2);
          color: #fda4af;
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          margin-bottom: 24px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .login-btn {
          margin-top: 10px;
          justify-content: center;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
