import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Colleges = () => {
  const { exam } = useParams();
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await axios.get(`${apiBase}/api/colleges/${exam}`);
        setColleges(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load colleges for this entrance exam. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, [exam]);

  // Filter colleges based on search query
  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getExamColor = () => {
    if (exam === 'TS ECET') return 'var(--accent-purple)';
    if (exam === 'TS EAPCET') return 'var(--accent-rose)';
    return 'var(--accent-cyan)';
  };

  if (loading) {
    return (
      <div className="colleges-loading-container">
        <div className="pulse-loader"></div>
        <p>Searching college directories...</p>
        <style>{`
          .colleges-loading-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: var(--bg-primary);
            color: var(--text-secondary);
            gap: 16px;
          }
          .pulse-loader {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: ${getExamColor()};
            animation: pulse 1.2s ease-in-out infinite;
          }
          @keyframes pulse {
            0% { transform: scale(0.6); opacity: 0.1; }
            50% { opacity: 0.8; }
            100% { transform: scale(1.2); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="page-container colleges-page">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-nav">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">&gt;</span>
        <span className="breadcrumb-current" style={{ color: getExamColor() }}>{exam} Colleges</span>
      </div>

      <div className="page-header-block">
        <h1 className="colleges-main-title">
          TS <span style={{ color: getExamColor() }}>{exam}</span> College Listings
        </h1>
        <p className="colleges-sub-title">Select a college to explore its branches and download allotment records</p>
      </div>

      {/* Advanced Search Bar */}
      <div className="search-bar-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="form-input search-input"
          placeholder="Search by college name (e.g. CBIT, JNTU)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="clear-search-btn" onClick={() => setSearchQuery('')}>×</button>
        )}
      </div>

      {error && <div className="error-card">{error}</div>}

      {filteredColleges.length === 0 ? (
        <div className="no-results-card glass-card">
          <span className="no-results-icon">📂</span>
          <h3>No Colleges Found</h3>
          <p>We couldn't find any colleges matching "{searchQuery}" under {exam}.</p>
        </div>
      ) : (
        <div className="colleges-grid">
          {filteredColleges.map((college) => {
            return (
              <div 
                key={college._id} 
                className="college-grid-card glass-card"
                onClick={() => navigate(`/branches/${college._id}`, { state: { collegeName: college.name, examName: exam } })}
              >
                <div className="card-decor-bar" style={{ backgroundColor: getExamColor() }}></div>
                <div className="card-college-icon">🏛️</div>
                <h3 className="college-card-name">{college.name}</h3>
                
                <div className="college-card-info">
                  <div className="info-item">
                    <span className="info-label">Exam Stream</span>
                    <span className="info-val exam-badge-inline" style={{ 
                      borderColor: getExamColor(), 
                      color: getExamColor(),
                      background: `rgba(${exam === 'TS POLYCET' ? '0, 242, 254' : (exam === 'TS ECET' ? '124, 58, 237' : '244, 63, 94')}, 0.05)`
                    }}>{exam}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Active Branches</span>
                    <span className="info-val branch-count-pill">
                      {college.branchCount} {college.branchCount === 1 ? 'branch' : 'branches'}
                    </span>
                  </div>
                </div>

                <div className="card-hover-action">
                  <span>View Branches</span>
                  <span className="hover-arrow">→</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .colleges-page {
          padding-top: 120px;
          display: flex;
          flex-direction: column;
          gap: 30px;
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
          gap: 6px;
        }

        .colleges-main-title {
          font-size: 2.5rem;
        }

        .colleges-sub-title {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .search-bar-wrapper {
          position: relative;
          width: 100%;
          max-width: 600px;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 18px;
          color: var(--text-muted);
          font-size: 1.1rem;
        }

        .search-input {
          width: 100%;
          padding-left: 50px !important;
          padding-right: 45px !important;
          height: 52px;
          font-size: 1rem;
        }

        .clear-search-btn {
          position: absolute;
          right: 15px;
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 1.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 25px;
          height: 25px;
          border-radius: 50%;
        }

        .clear-search-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .colleges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
          margin-top: 10px;
        }

        .college-grid-card {
          padding: 30px 24px 20px;
          cursor: pointer;
          position: relative;
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border-glass);
        }

        .card-decor-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .card-college-icon {
          font-size: 1.8rem;
          margin-bottom: 16px;
          width: 50px;
          height: 50px;
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .college-card-name {
          font-size: 1.35rem;
          color: var(--text-primary);
          margin-bottom: 16px;
          line-height: 1.3;
        }

        .college-card-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px 0;
          border-top: 1px solid var(--border-glass);
          border-bottom: 1px solid var(--border-glass);
          margin-bottom: 16px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
        }

        .info-label {
          color: var(--text-muted);
        }

        .info-val {
          font-weight: 600;
        }

        .exam-badge-inline {
          font-size: 0.75rem;
          border: 1px solid;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .branch-count-pill {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid var(--border-glass);
        }

        .card-hover-action {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-top: auto;
          transition: var(--transition-smooth);
        }

        .hover-arrow {
          font-size: 1.1rem;
          transition: var(--transition-spring);
        }

        .college-grid-card:hover {
          border-color: rgba(255, 255, 255, 0.15);
        }

        .college-grid-card:hover .card-hover-action {
          color: var(--text-primary);
        }

        .college-grid-card:hover .hover-arrow {
          transform: translateX(4px);
        }

        .no-results-card {
          text-align: center;
          padding: 60px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          max-width: 500px;
          margin: 40px auto 0;
          border: 1px solid var(--border-glass);
        }

        .no-results-icon {
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

export default Colleges;
