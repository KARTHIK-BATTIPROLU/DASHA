import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import PDFCard from '../components/PDFCard';

const Branches = () => {
  const { collegeId } = useParams();
  const location = useLocation();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Recover metadata passed from routing states, fallback to defaults
  const collegeName = location.state?.collegeName || 'Selected College';
  const examName = location.state?.examName || 'TS POLYCET';

  const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get(`${apiBase}/api/branches/${collegeId}`);
        setBranches(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to retrieve branches for this college. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [collegeId]);

  const getExamColor = () => {
    if (examName === 'TS ECET') return 'var(--accent-purple)';
    if (examName === 'TS EAPCET') return 'var(--accent-rose)';
    return 'var(--accent-cyan)';
  };

  if (loading) {
    return (
      <div className="branches-loading-container">
        <div className="loader-ring"></div>
        <p>Assembling branch allotment indices...</p>
        <style>{`
          .branches-loading-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: var(--bg-primary);
            color: var(--text-secondary);
            gap: 16px;
          }
          .loader-ring {
            width: 45px;
            height: 45px;
            border: 3px solid rgba(255, 255, 255, 0.03);
            border-radius: 50%;
            border-top-color: ${getExamColor()};
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="page-container branches-page">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-nav">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">&gt;</span>
        <Link to={`/colleges/${examName}`} className="breadcrumb-link">{examName} Colleges</Link>
        <span className="breadcrumb-separator">&gt;</span>
        <span className="breadcrumb-current" style={{ color: getExamColor() }}>{collegeName}</span>
      </div>

      <div className="page-header-block">
        <h1 className="branches-main-title">
          🏛️ <span className="title-college">{collegeName}</span>
        </h1>
        <div className="badge-meta-row">
          <span className="exam-badge-label" style={{ 
            borderColor: getExamColor(), 
            color: getExamColor(),
            background: `rgba(${examName === 'TS POLYCET' ? '0, 242, 254' : (examName === 'TS ECET' ? '124, 58, 237' : '244, 63, 94')}, 0.05)`
          }}>
            {examName.startsWith('TS') ? examName : `TS ${examName}`} STREAM
          </span>
          <span className="branches-meta-count">
            {branches.length} {branches.length === 1 ? 'branch resource' : 'branch resources'}
          </span>
        </div>
      </div>

      {error && <div className="error-card">{error}</div>}

      {branches.length === 0 ? (
        <div className="empty-branches-card glass-card">
          <span className="empty-icon">📂</span>
          <h3>No Branches Configured</h3>
          <p>The administrative team has not configured any branches under this college yet.</p>
        </div>
      ) : (
        <div className="branches-list-wrapper">
          <h2 className="list-heading">Academic Branches</h2>
          <div className="branches-list-cards">
            {branches.map(branch => (
              <PDFCard 
                key={branch._id} 
                branch={branch} 
                collegeName={collegeName} 
                examName={examName}
              />
            ))}
          </div>
        </div>
      )}

      <style>{`
        .branches-page {
          padding-top: 120px;
          display: flex;
          flex-direction: column;
          gap: 30px;
          max-width: 900px !important;
        }

        .breadcrumb-nav {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .breadcrumb-link:hover {
          color: var(--text-primary);
        }

        .breadcrumb-separator {
          opacity: 0.5;
        }

        .page-header-block {
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 24px;
        }

        .branches-main-title {
          font-size: 2.3rem;
          color: var(--text-primary);
        }

        .title-college {
          font-family: var(--font-display);
        }

        .badge-meta-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .exam-badge-label {
          font-size: 0.75rem;
          font-weight: 700;
          border: 1px solid;
          padding: 3px 10px;
          border-radius: 6px;
          letter-spacing: 0.05em;
        }

        .branches-meta-count {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .list-heading {
          font-size: 1.25rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 18px;
        }

        .branches-list-cards {
          display: flex;
          flex-direction: column;
        }

        .empty-branches-card {
          text-align: center;
          padding: 60px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          border: 1px solid var(--border-glass);
        }

        .empty-icon {
          font-size: 3rem;
          opacity: 0.3;
        }

        .error-card {
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.2);
          color: #fda4af;
          padding: 16px 20px;
          border-radius: var(--radius-sm);
        }
      `}</style>
    </div>
  );
};

export default Branches;
