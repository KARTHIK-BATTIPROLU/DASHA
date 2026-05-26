import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PDFCard = ({ branch, collegeName, examName }) => {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleDownload = async (e) => {
    e.stopPropagation(); // Avoid triggering card view route
    setDownloading(true);
    try {
      const response = await axios({
        url: `${apiBase}/api/pdf/${branch._id}`,
        method: 'GET',
        responseType: 'blob', // Important for handling binary data stream
      });

      // Create local URL for the PDF blob
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Create temporary link and trigger trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', branch.pdfFilename || `${collegeName}_${branch.name}_${examName}_2025.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download error:', err.message);
      alert('Failed to download PDF allotment sheet. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div 
      className={`pdf-card-container glass-card ${branch.hasPDF ? 'has-pdf' : 'no-pdf'}`}
      onClick={() => branch.hasPDF && navigate(`/pdf/${branch._id}`, { state: { collegeName, examName, branchName: branch.name } })}
    >
      <div className="card-left">
        <div className="branch-icon-badge">
          {branch.name.substring(0, 3).toUpperCase()}
        </div>
        <div className="branch-details">
          <h3 className="branch-title">{branch.name}</h3>
          <p className="branch-subtitle">
            {branch.hasPDF ? 'Allotment sheet available' : 'Allotment sheet pending upload'}
          </p>
          {branch.hasPDF && (
            <span className="pdf-filename-tag">{branch.pdfFilename}</span>
          )}
        </div>
      </div>

      <div className="card-right">
        {branch.hasPDF ? (
          <div className="card-actions">
            <button className="action-btn-view">
              View PDF
            </button>
            <button 
              onClick={handleDownload} 
              disabled={downloading}
              className="action-btn-download"
              title="Download PDF"
            >
              {downloading ? (
                <span className="spinner"></span>
              ) : (
                <svg className="download-icon" viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                </svg>
              )}
            </button>
          </div>
        ) : (
          <div className="pending-badge">
            <span className="pulse-dot"></span>
            Pending
          </div>
        )}
      </div>

      <style>{`
        .pdf-card-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          margin-bottom: 16px;
          cursor: ${branch.hasPDF ? 'pointer' : 'default'};
          transition: var(--transition-spring);
        }

        .pdf-card-container.has-pdf:hover {
          border-color: rgba(0, 242, 254, 0.25);
          box-shadow: 0 10px 25px rgba(0, 242, 254, 0.08);
        }

        .card-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .branch-icon-badge {
          width: 55px;
          height: 55px;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-glass);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 0.95rem;
          color: var(--text-primary);
          transition: var(--transition-smooth);
        }

        .pdf-card-container.has-pdf:hover .branch-icon-badge {
          background: rgba(0, 242, 254, 0.08);
          border-color: var(--accent-cyan);
          color: var(--accent-cyan);
        }

        .branch-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .branch-title {
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .branch-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .pdf-card-container.has-pdf .branch-subtitle {
          color: var(--accent-cyan);
        }

        .pdf-filename-tag {
          font-size: 0.75rem;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.03);
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          margin-top: 4px;
          width: fit-content;
          word-break: break-all;
        }

        .card-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .action-btn-view {
          background: rgba(0, 242, 254, 0.08);
          border: 1px solid rgba(0, 242, 254, 0.2);
          color: var(--accent-cyan);
          padding: 8px 18px;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-spring);
        }

        .action-btn-view:hover {
          background: var(--accent-cyan);
          color: #000000;
          box-shadow: var(--shadow-glow-cyan);
          transform: translateY(-2px);
        }

        .action-btn-download {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-spring);
        }

        .action-btn-download:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--text-primary);
          color: var(--text-primary);
        }

        .pending-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--text-muted);
          background: rgba(25, 33, 56, 0.3);
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.03);
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--text-muted);
          display: inline-block;
        }

        .pdf-card-container.no-pdf {
          opacity: 0.8;
        }

        /* Spinner Animation */
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          border-top-color: var(--text-primary);
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 600px) {
          .pdf-card-container {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          
          .card-right {
            width: 100%;
            display: flex;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default PDFCard;
