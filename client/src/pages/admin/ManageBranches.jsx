import React, { useState } from 'react';
import axios from 'axios';

const ManageBranches = ({ selectedNode, refreshTree, onActionComplete }) => {
  const [newBranchName, setNewBranchName] = useState('');
  const [editBranchName, setEditBranchName] = useState(
    selectedNode?.type === 'branch' ? selectedNode.name : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Bulk Upload State
  const [bulkRows, setBulkRows] = useState([{ branchName: '', file: null }]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');

  const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

  // Determine active college context
  const activeCollegeId = selectedNode?.type === 'college' 
    ? selectedNode.id 
    : (selectedNode?.type === 'branch' ? selectedNode.parentContext?.collegeId : '');

  const activeCollegeName = selectedNode?.type === 'college' 
    ? selectedNode.name 
    : (selectedNode?.type === 'branch' ? selectedNode.parentContext?.collegeName : 'N/A');

  const getHeaders = (isMultipart = false) => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('adminToken')}` };
    if (isMultipart) {
      headers['Content-Type'] = 'multipart/form-data';
    }
    return { headers };
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newBranchName.trim() || !activeCollegeId) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(`${apiBase}/api/admin/branch`, {
        name: newBranchName.toUpperCase(), // Normalize branch names to uppercase e.g. CSE
        collegeId: activeCollegeId
      }, getHeaders());

      setNewBranchName('');
      setSuccess(`Branch "${newBranchName.toUpperCase()}" created successfully under ${activeCollegeName}!`);
      refreshTree();
      if (onActionComplete) onActionComplete();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Failed to create branch.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editBranchName.trim() || selectedNode?.type !== 'branch') return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.put(`${apiBase}/api/admin/branch/${selectedNode.id}`, {
        name: editBranchName.toUpperCase()
      }, getHeaders());

      setSuccess(`Branch name updated to "${editBranchName.toUpperCase()}"!`);
      refreshTree();
      if (onActionComplete) onActionComplete();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Failed to update branch.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedNode?.type !== 'branch') return;
    
    const confirmDelete = window.confirm(
      `⚠️ WARNING: Deleting "${selectedNode.name}" will permanently delete its associated PDF allotment sheet!\n\nAre you sure you want to proceed?`
    );
    if (!confirmDelete) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.delete(`${apiBase}/api/admin/branch/${selectedNode.id}`, getHeaders());
      setSuccess(`Branch "${selectedNode.name}" and its associated PDF deleted successfully.`);
      setEditBranchName('');
      refreshTree();
      if (onActionComplete) onActionComplete('delete');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Failed to delete branch.');
    } finally {
      setLoading(false);
    }
  };

  // Bulk Upload actions
  const handleAddBulkRow = () => {
    setBulkRows([...bulkRows, { branchName: '', file: null }]);
  };

  const handleRemoveBulkRow = (index) => {
    if (bulkRows.length === 1) {
      setBulkRows([{ branchName: '', file: null }]);
      return;
    }
    setBulkRows(bulkRows.filter((_, i) => i !== index));
  };

  const handleBulkRowChange = (index, field, value) => {
    const updated = [...bulkRows];
    updated[index][field] = value;
    setBulkRows(updated);
  };

  const handleBulkUploadSubmit = async (e) => {
    e.preventDefault();
    if (!activeCollegeId) return;

    // Validate rows
    const validRows = bulkRows.filter(row => row.branchName.trim() !== '');
    if (validRows.length === 0) {
      setBulkError('Please enter at least one branch name.');
      return;
    }

    setBulkLoading(true);
    setBulkError('');
    setBulkSuccess('');

    const formData = new FormData();
    validRows.forEach((row, i) => {
      formData.append(`branch_${i}`, row.branchName.trim().toUpperCase());
      if (row.file) {
        formData.append(`pdf_${i}`, row.file);
      }
    });

    try {
      const res = await axios.post(
        `${apiBase}/api/admin/college/${activeCollegeId}/bulk-upload`,
        formData,
        getHeaders(true)
      );

      const successfulCount = res.data.results?.filter(r => r.status === 'Success').length || 0;
      
      setBulkSuccess(`🚀 Bulk upload completed successfully! Successfully configured ${successfulCount} branch resources under ${activeCollegeName}.`);
      setBulkRows([{ branchName: '', file: null }]);
      refreshTree();
      if (onActionComplete) onActionComplete();
    } catch (err) {
      console.error(err);
      setBulkError(err.response?.data?.msg || 'Bulk upload failed. Verify that all selected files are PDFs under 5MB.');
    } finally {
      setBulkLoading(false);
    }
  };

  // Sync edit field when node changes
  React.useEffect(() => {
    if (selectedNode?.type === 'branch') {
      setEditBranchName(selectedNode.name);
    }
    setError('');
    setSuccess('');
    setBulkError('');
    setBulkSuccess('');
  }, [selectedNode]);

  return (
    <div className="manage-panel">
      <h3 className="panel-title">Manage Branches & Bulk Upload</h3>

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {/* Creation form */}
      {activeCollegeId ? (
        <div className="panel-section">
          <h4 className="section-title">Create Single Branch under <span className="highlight-text">{activeCollegeName}</span></h4>
          <form onSubmit={handleCreate} className="panel-form">
            <input
              type="text"
              className="form-input text-field"
              placeholder="e.g. CSE, ECE, EEE, INF"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              disabled={loading}
              required
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Add Branch'}
            </button>
          </form>
        </div>
      ) : (
        <div className="panel-section select-prompt-section">
          <p className="select-prompt-text">💡 Select a **College** in the tree on the left to manage or add branches.</p>
        </div>
      )}

      {/* Bulk Upload Section */}
      {activeCollegeId && (
        <div className="panel-section bulk-upload-section">
          <div className="bulk-header">
            <h4 className="section-title">🚀 Bulk Allotment Upload for <span className="highlight-text">{activeCollegeName}</span></h4>
            <p className="section-desc">
              Fast-track uploads: Add branch codes and pair them with PDF allotment sheets. Files must be PDFs under 5MB.
            </p>
          </div>

          {bulkError && <div className="alert alert-error mb-16">⚠️ {bulkError}</div>}
          {bulkSuccess && <div className="alert alert-success mb-16">✅ {bulkSuccess}</div>}

          <form onSubmit={handleBulkUploadSubmit} className="bulk-form">
            <div className="bulk-rows-container">
              {bulkRows.map((row, index) => (
                <div key={index} className="bulk-row">
                  <div className="row-number">{index + 1}</div>
                  <div className="input-group-branch">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Branch Code (e.g. CSE)"
                      value={row.branchName}
                      onChange={(e) => handleBulkRowChange(index, 'branchName', e.target.value)}
                      disabled={bulkLoading}
                      required={index === 0}
                    />
                  </div>
                  <div className="input-group-file">
                    <label className="file-upload-wrapper">
                      <span className="file-upload-text">
                        {row.file ? `📄 ${row.file.name.substring(0, 20)}${row.file.name.length > 20 ? '...' : ''}` : '📁 Select Allotment PDF'}
                      </span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => handleBulkRowChange(index, 'file', e.target.files[0])}
                        disabled={bulkLoading}
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveBulkRow(index)}
                    className="btn-remove-row"
                    disabled={bulkLoading}
                    title="Remove Row"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div className="bulk-actions-row">
              <button
                type="button"
                onClick={handleAddBulkRow}
                className="btn-secondary btn-add-row"
                disabled={bulkLoading}
              >
                ➕ Add Another Row
              </button>
              <button
                type="submit"
                className="btn-primary btn-submit-bulk"
                disabled={bulkLoading}
              >
                {bulkLoading ? (
                  <>
                    <span className="spinner-sm"></span> Syncing & Uploading All...
                  </>
                ) : (
                  '⚡ Submit Bulk Upload'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Editing / Deletion controls for selected branch */}
      {selectedNode?.type === 'branch' && (
        <div className="panel-section edit-section">
          <h4 className="section-title">Edit / Delete Selected Branch</h4>
          <form onSubmit={handleUpdate} className="panel-form">
            <input
              type="text"
              className="form-input text-field"
              value={editBranchName}
              onChange={(e) => setEditBranchName(e.target.value)}
              disabled={loading}
              required
            />
            <button type="submit" className="btn-secondary" disabled={loading || editBranchName === selectedNode.name}>
              {loading ? 'Saving...' : 'Rename'}
            </button>
          </form>

          <div className="danger-zone">
            <p className="danger-text">This will permanently delete this branch and its PDF.</p>
            <button 
              type="button" 
              onClick={handleDelete} 
              className="btn-danger"
              disabled={loading}
            >
              Delete Branch
            </button>
          </div>
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
          padding: 20px;
        }

        .section-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 14px;
        }

        .section-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 20px;
          line-height: 1.4;
        }

        .highlight-text {
          color: var(--accent-cyan);
        }

        .panel-form {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .text-field {
          flex: 1;
          min-width: 200px;
        }

        .edit-section {
          border-color: rgba(124, 58, 237, 0.2);
          background: rgba(124, 58, 237, 0.02);
        }

        .select-prompt-section {
          border-style: dashed;
          background: rgba(255, 255, 255, 0.01);
          text-align: center;
          padding: 30px;
        }

        .select-prompt-text {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .bulk-upload-section {
          border-color: rgba(0, 242, 254, 0.2);
          background: rgba(0, 242, 254, 0.01);
        }

        .bulk-header {
          border-bottom: 1px solid rgba(0, 242, 254, 0.1);
          margin-bottom: 18px;
        }

        .bulk-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .bulk-rows-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 380px;
          overflow-y: auto;
          padding-right: 6px;
        }

        .bulk-rows-container::-webkit-scrollbar {
          width: 6px;
        }

        .bulk-rows-container::-webkit-scrollbar-thumb {
          background: var(--border-glass);
          border-radius: 4px;
        }

        .bulk-row {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-glass);
          padding: 10px;
          border-radius: var(--radius-sm);
        }

        .row-number {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          width: 20px;
          text-align: center;
        }

        .input-group-branch {
          flex: 1;
        }

        .input-group-file {
          flex: 2;
        }

        .file-upload-wrapper {
          display: block;
          position: relative;
          background: rgba(255, 255, 255, 0.02);
          border: 1px dashed var(--border-glass);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          text-align: center;
          cursor: pointer;
          font-size: 0.85rem;
          color: var(--text-secondary);
          transition: var(--transition-smooth);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-upload-wrapper:hover {
          background: rgba(0, 242, 254, 0.03);
          border-color: var(--accent-cyan);
          color: var(--text-primary);
        }

        .file-upload-wrapper input[type="file"] {
          position: absolute;
          left: 0;
          top: 0;
          opacity: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }

        .btn-remove-row {
          background: rgba(244, 63, 94, 0.05);
          border: 1px solid rgba(244, 63, 94, 0.15);
          border-radius: var(--radius-sm);
          padding: 8px 10px;
          cursor: pointer;
          font-size: 0.95rem;
          transition: var(--transition-smooth);
        }

        .btn-remove-row:hover {
          background: rgba(244, 63, 94, 0.2);
          border-color: var(--accent-rose);
        }

        .bulk-actions-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          border-top: 1px solid var(--border-glass);
          padding-top: 18px;
        }

        .btn-add-row {
          font-size: 0.85rem;
          padding: 10px 18px;
        }

        .btn-submit-bulk {
          font-size: 0.9rem;
          font-weight: 700;
          padding: 12px 24px;
          background: linear-gradient(135deg, var(--accent-cyan) 0%, #1d4ed8 100%);
          box-shadow: 0 0 15px rgba(0, 242, 254, 0.25);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .danger-zone {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px dashed rgba(244, 63, 94, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .danger-text {
          font-size: 0.8rem;
          color: var(--accent-rose);
        }

        .alert {
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 500;
        }

        .mb-16 {
          margin-bottom: 16px;
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

        .spinner-sm {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          border-top-color: var(--text-primary);
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }
      `}</style>
    </div>
  );
};

export default ManageBranches;
