import React, { useState, useRef } from 'react';
import axios from 'axios';

const UploadPDF = ({ selectedNode, refreshTree, onActionComplete }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

  // Determine active branch context
  const activeBranchId = selectedNode?.type === 'branch' ? selectedNode.id : '';
  const activeBranchName = selectedNode?.type === 'branch' ? selectedNode.name : '';
  const activeCollegeName = selectedNode?.type === 'branch' ? selectedNode.parentContext?.collegeName : '';
  const activeExamName = selectedNode?.type === 'branch' ? selectedNode.parentContext?.examName : '';

  const currentPdf = selectedNode?.type === 'branch' ? selectedNode.raw?.pdf : null;

  const getHeaders = () => ({
    headers: { 
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${localStorage.getItem('adminToken')}` 
    }
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');
    
    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (selectedFile.type !== 'application/pdf') {
      setError('❌ Only PDF documents are allowed.');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB Limit
      setError('❌ PDF file size must be less than 5MB.');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !activeBranchId) return;

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      // Use POST route (handles both create and replace upserts)
      const res = await axios.post(
        `${apiBase}/api/admin/pdf/${activeBranchId}`, 
        formData, 
        getHeaders()
      );

      setSuccess(currentPdf ? 'PDF replaced successfully!' : 'PDF uploaded and linked successfully!');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      refreshTree();
      if (onActionComplete) onActionComplete();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Failed to upload PDF.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePdf = async () => {
    if (!currentPdf?.id) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the PDF "${currentPdf.filename}"?\nThis branch will no longer have an allotment sheet resource.`
    );
    if (!confirmDelete) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Direct PDF delete route: DELETE /api/admin/pdf/:id
      await axios.delete(
        `${apiBase}/api/admin/pdf/${currentPdf.id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
      );

      setSuccess('PDF allotment sheet deleted successfully.');
      refreshTree();
      if (onActionComplete) onActionComplete();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Failed to delete PDF.');
    } finally {
      setLoading(false);
    }
  };

  // Reset states when node changes
  React.useEffect(() => {
    setFile(null);
    setError('');
    setSuccess('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [selectedNode]);

  return (
    <div className="manage-panel">
      <h3 className="panel-title">Manage PDFs Allotments</h3>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {activeBranchId ? (
        <div className="panel-section">
          <div className="branch-meta-tag">
            <span className="meta-breadcrumb">{activeExamName} &gt; {activeCollegeName} &gt;</span>
            <h4 className="branch-meta-title">Branch: <span className="highlight-text">{activeBranchName}</span></h4>
          </div>

          {currentPdf ? (
            <div className="current-pdf-details">
              <div className="pdf-info-box">
                <span className="pdf-icon">📄</span>
                <div className="pdf-info-text">
                  <p className="pdf-info-label">Current Allotment Sheet:</p>
                  <p className="pdf-info-name">{currentPdf.filename}</p>
                </div>
              </div>
              <button 
                type="button" 
                className="btn-danger btn-delete-pdf"
                onClick={handleDeletePdf}
                disabled={loading}
              >
                Delete Current PDF
              </button>
            </div>
          ) : (
            <div className="no-pdf-placeholder">
              <span className="placeholder-icon">⚠️</span>
              <p>No PDF allotment sheet uploaded yet for this branch.</p>
            </div>
          )}

          <form onSubmit={handleUpload} className="upload-form">
            <h4 className="section-title">
              {currentPdf ? 'Replace Allotment PDF' : 'Upload Allotment PDF'}
            </h4>
            <div className="upload-input-group">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
                className="file-input-raw"
                id="pdf-file-selector"
                disabled={loading}
                required
              />
              <label htmlFor="pdf-file-selector" className="file-input-label">
                {file ? `Selected: ${file.name}` : '📁 Choose PDF Document'}
              </label>
              
              <button 
                type="submit" 
                className="btn-primary btn-upload-submit"
                disabled={loading || !file}
              >
                {loading ? 'Uploading...' : (currentPdf ? 'Replace File' : 'Upload File')}
              </button>
            </div>
            <p className="file-help-text">Standard naming format (auto-applied): <code>{"{COLLEGE}_{BRANCH}_{EXAM}_2025.pdf"}</code></p>
          </form>
        </div>
      ) : (
        <div className="panel-section select-prompt-section">
          <p className="select-prompt-text">💡 Select a **Branch** in the tree on the left to upload or manage its allotment PDF.</p>
        </div>
      )}

      <style>{`
        .manage-panel {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .panel-title {
          font-size: 1.4rem;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 12px;
          margin-bottom: 8px;
        }

        .panel-section {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-sm);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .branch-meta-tag {
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-glass);
        }

        .meta-breadcrumb {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .branch-meta-title {
          font-size: 1.15rem;
          margin-top: 4px;
        }

        .highlight-text {
          color: var(--accent-cyan);
        }

        .section-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }

        .current-pdf-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(16, 185, 129, 0.04);
          border: 1px solid rgba(16, 185, 129, 0.15);
          border-radius: var(--radius-sm);
          padding: 16px 20px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .pdf-info-box {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .pdf-icon {
          font-size: 1.8rem;
        }

        .pdf-info-text {
          display: flex;
          flex-direction: column;
        }

        .pdf-info-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .pdf-info-name {
          font-size: 0.9rem;
          color: #34d399;
          font-weight: 600;
        }

        .btn-delete-pdf {
          padding: 8px 16px;
          font-size: 0.8rem;
          border-radius: var(--radius-sm);
        }

        .no-pdf-placeholder {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(244, 63, 94, 0.04);
          border: 1px solid rgba(244, 63, 94, 0.12);
          border-radius: var(--radius-sm);
          padding: 16px 20px;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .placeholder-icon {
          font-size: 1.2rem;
        }

        .upload-form {
          border-top: 1px dashed var(--border-glass);
          padding-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .upload-input-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .file-input-raw {
          width: 0.1px;
          height: 0.1px;
          opacity: 0;
          overflow: hidden;
          position: absolute;
          z-index: -1;
        }

        .file-input-label {
          flex: 1;
          min-width: 200px;
          background: rgba(10, 14, 26, 0.6);
          border: 1px dashed var(--border-glass);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          padding: 14px 18px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: var(--transition-smooth);
          text-align: center;
        }

        .file-input-label:hover {
          border-color: var(--accent-cyan);
          color: var(--text-primary);
          background: rgba(10, 14, 26, 0.8);
        }

        .btn-upload-submit {
          min-width: 140px;
        }

        .file-help-text {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .file-help-text code {
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 6px;
          border-radius: 4px;
          color: #c084fc;
        }

        .select-prompt-section {
          border-style: dashed;
          background: rgba(255, 255, 255, 0.01);
          text-align: center;
          padding: 40px 30px;
        }

        .select-prompt-text {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .alert {
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 500;
        }

        .alert-error {
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.2);
          color: #fda4af;
        }

        .alert-success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #34d399;
        }
      `}</style>
    </div>
  );
};

export default UploadPDF;
