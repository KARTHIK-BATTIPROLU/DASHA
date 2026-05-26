import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('adminToken');
  const adminUser = localStorage.getItem('adminUser');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar-wrapper">
      <div className="navbar-container">
        <Link to="/" className="nav-logo">
          <span className="logo-brand">HYDERABAD</span>
          <span className="logo-accent">CODERS</span>
          <span className="logo-sub">College Selection</span>
        </Link>

        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Home
          </Link>
          
          {token ? (
            <>
              <Link 
                to="/admin/dashboard" 
                className={`nav-link admin-active-badge ${isActive('/admin/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <button onClick={handleLogout} className="nav-btn-logout">
                Logout <span className="admin-user-tag">({adminUser})</span>
              </button>
            </>
          ) : (
            <Link 
              to="/admin/login" 
              className={`nav-link-btn ${isActive('/admin/login') ? 'active' : ''}`}
            >
              Admin Portal
            </Link>
          )}
        </div>
      </div>

      <style>{`
        .navbar-wrapper {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 1200px;
          height: 70px;
          z-index: 1000;
          background: rgba(19, 25, 43, 0.65);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-lg);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          padding: 0 30px;
          transition: var(--transition-smooth);
        }

        .navbar-wrapper:hover {
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
        }

        .navbar-container {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.25rem;
          letter-spacing: -0.03em;
        }

        .logo-brand {
          color: var(--text-primary);
        }

        .logo-accent {
          background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .logo-sub {
          font-size: 0.75rem;
          font-weight: 400;
          color: var(--text-muted);
          border-left: 1px solid var(--border-glass);
          padding-left: 8px;
          margin-left: 2px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .nav-link {
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-secondary);
          transition: var(--transition-smooth);
          position: relative;
          padding: 6px 2px;
        }

        .nav-link:hover {
          color: var(--text-primary);
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--accent-cyan);
          transition: var(--transition-smooth);
        }

        .nav-link.active {
          color: var(--text-primary);
        }

        .nav-link.active::after {
          width: 100%;
        }

        .admin-active-badge {
          color: var(--accent-cyan);
        }

        .nav-link-btn {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
          padding: 8px 18px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-glass);
          transition: var(--transition-spring);
        }

        .nav-link-btn:hover {
          background: var(--accent-purple);
          border-color: var(--accent-purple);
          box-shadow: var(--shadow-glow-purple);
          transform: translateY(-2px);
        }

        .nav-btn-logout {
          background: rgba(244, 63, 94, 0.1);
          color: #fda4af;
          border: 1px solid rgba(244, 63, 94, 0.2);
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-spring);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .nav-btn-logout:hover {
          background: var(--accent-rose);
          color: #ffffff;
          border-color: var(--accent-rose);
          box-shadow: 0 0 15px hsla(347, 85%, 53%, 0.3);
          transform: translateY(-1px);
        }

        .admin-user-tag {
          font-weight: 400;
          opacity: 0.85;
          font-size: 0.75rem;
        }

        @media (max-width: 768px) {
          .navbar-wrapper {
            width: 95%;
            padding: 0 15px;
          }
          
          .logo-sub {
            display: none;
          }
          
          .nav-links {
            gap: 15px;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
