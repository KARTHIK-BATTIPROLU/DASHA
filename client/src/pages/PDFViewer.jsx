import React, { useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AuthGate from './AuthGate';

const PDFViewer = () => {
  const { branchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [downloading, setDownloading] = useState(false);

  // Recover metadata passed from PDFCard routing state
  const collegeName = location.state?.collegeName || 'College';
  const examName = location.state?.examName || 'TS STATE';
  const branchName = location.state?.branchName || 'Branch';

  const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
  const pdfStreamUrl = `${apiBase}/api/pdf/${branchId}`;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await axios({
        url: pdfStreamUrl,
        method: 'GET',
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${collegeName}_${branchName}_${examName}_2025.pdf`.replace(/\s+/g, '_'));
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download error:', err.message);
      alert('Unable to download PDF allotment sheet.');
    } finally {
      setDownloading(false);
    }
  };

  const getExamColor = () => {
    if (examName === 'TS ECET') return 'var(--accent-purple)';
    if (examName === 'TS EAPCET') return 'var(--accent-rose)';
    return 'var(--accent-cyan)';
  };

  if (!currentUser) {
    return (
      <div className="page-container pdf-viewer-page" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="breadcrumb-nav" style={{ alignSelf: 'flex-start', width: '100%' }}>
          <Link to="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">&gt;</span>
          <span className="breadcrumb-link-inactive">{examName} Colleges</span>
          <span className="breadcrumb-separator">&gt;</span>
          <button className="breadcrumb-back-btn" onClick={() => navigate(-1)}>{collegeName}</button>
          <span className="breadcrumb-separator">&gt;</span>
          <span className="breadcrumb-current" style={{ color: getExamColor() }}>Access Portal</span>
        </div>
        <AuthGate message={`Please sign in to view and download the ${collegeName} (${branchName}) allotment sheet.`} />
      </div>
    );
  }

  return (
    <div className="page-container pdf-viewer-page">
      {/* breadcrumb path */}
      <div className="breadcrumb-nav">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">&gt;</span>
        <span className="breadcrumb-link-inactive">{examName} Colleges</span>
        <span className="breadcrumb-separator">&gt;</span>
        <button className="breadcrumb-back-btn" onClick={() => navigate(-1)}>{collegeName}</button>
        <span className="breadcrumb-separator">&gt;</span>
        <span className="breadcrumb-current" style={{ color: getExamColor() }}>{branchName} Allotment</span>
      </div>

      {/* Title & Operations bar */}
      <div className="viewer-header-card glass-card">
        <div className="header-meta">
          <span className="pdf-tag-stream" style={{ backgroundColor: getExamColor() }}>PDF PREVIEW</span>
          <h2 className="viewer-title">{collegeName} — {branchName}</h2>
          <p className="viewer-subtitle">Telangana {examName} Allotment Sheet (2025 Cycle)</p>
        </div>
        
        <div className="header-actions">
          <button onClick={() => navigate(-1)} className="btn-secondary">
            ← Back to Branches
          </button>
          <button 
            onClick={handleDownload} 
            className="btn-primary btn-dl-glow" 
            style={{ 
              background: `linear-gradient(135deg, ${getExamColor()} 0%, #1d4ed8 100%)`,
              boxShadow: `0 0 20px rgba(${examName === 'TS POLYCET' ? '0, 242, 254' : (examName === 'TS ECET' ? '124, 58, 237' : '244, 63, 94')}, 0.25)`
            }}
            disabled={downloading}
          >
            {downloading ? (
              <>
                <span className="spinner-sm"></span> Downloading...
              </>
            ) : (
              <>
                📥 Download Document
              </>
            )}
          </button>
        </div>
      </div>

      {/* Embedded PDF iframe */}
      <div className="pdf-iframe-container glass-card">
        <iframe 
          src={`${pdfStreamUrl}#toolbar=0`} 
          className="pdf-iframe" 
          title={`${collegeName} ${branchName} Allotment Sheet`}
        >
          <p>Your browser does not support PDF embedding. Please click the download button above to save and view the file.</p>
        </iframe>
      </div>

      <style>{`
        .pdf-viewer-page {
          padding-top: 120px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .breadcrumb-nav {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .breadcrumb-link:hover, .breadcrumb-back-btn:hover {
          color: var(--text-primary);
        }

        .breadcrumb-back-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          padding: 0;
        }

        .breadcrumb-link-inactive {
          cursor: default;
        }

        .breadcrumb-separator {
          opacity: 0.5;
        }

        .viewer-header-card {
          padding: 24px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          border: 1px solid var(--border-glass);
          background: rgba(19, 25, 43, 0.4);
        }

        .viewer-header-card:hover {
          transform: none !important;
          border-color: var(--border-glass);
        }

        .header-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .pdf-tag-stream {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 4px;
          width: fit-content;
          color: #000000;
          letter-spacing: 0.05em;
        }

        .viewer-title {
          font-size: 1.6rem;
          color: var(--text-primary);
        }

        .viewer-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .pdf-iframe-container {
          height: 75vh;
          border: 1px solid var(--border-glass);
          overflow: hidden;
          background: #111827;
        }

        .pdf-iframe-container:hover {
          transform: none !important;
          border-color: var(--border-glass);
        }

        .pdf-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .spinner-sm {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          border-top-color: var(--text-primary);
          animation: spin 0.8s linear infinite;
          display: inline-block;
          margin-right: 6px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .viewer-header-card {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .header-actions {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

export default PDFViewer;
