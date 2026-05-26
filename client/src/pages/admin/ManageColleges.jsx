import React, { useState } from 'react';
import axios from 'axios';

const ManageColleges = ({ selectedNode, refreshTree, onActionComplete }) => {
  const [newCollegeName, setNewCollegeName] = useState('');
  const [editCollegeName, setEditCollegeName] = useState(
    selectedNode?.type === 'college' ? selectedNode.name : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Determine active exam context
  const activeExam = selectedNode?.type === 'exam' 
    ? selectedNode.id 
    : (selectedNode?.type === 'college' ? selectedNode.raw?.exam : 'POLYCET');

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCollegeName.trim()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(`${apiBase}/api/admin/college`, {
        name: newCollegeName,
        exam: activeExam
      }, getHeaders());

      setNewCollegeName('');
      setSuccess(`College "${newCollegeName}" created successfully under ${activeExam}!`);
      refreshTree();
      if (onActionComplete) onActionComplete();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Failed to create college.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editCollegeName.trim() || selectedNode?.type !== 'college') return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.put(`${apiBase}/api/admin/college/${selectedNode.id}`, {
        name: editCollegeName
      }, getHeaders());

      setSuccess(`College name updated to "${editCollegeName}"!`);
      refreshTree();
      if (onActionComplete) onActionComplete();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Failed to update college.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedNode?.type !== 'college') return;
    
    const confirmDelete = window.confirm(
      `⚠️ WARNING: Deleting "${selectedNode.name}" will permanently delete ALL associated branches and uploaded PDFs!\n\nAre you sure you want to proceed?`
    );
    if (!confirmDelete) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.delete(`${apiBase}/api/admin/college/${selectedNode.id}`, getHeaders());
      setSuccess(`College "${selectedNode.name}" and all associated branches/PDFs deleted.`);
      setEditCollegeName('');
      refreshTree();
      if (onActionComplete) onActionComplete('delete');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Failed to delete college.');
    } finally {
      setLoading(false);
    }
  };

  // Sync edit field when node changes
  React.useEffect(() => {
    if (selectedNode?.type === 'college') {
      setEditCollegeName(selectedNode.name);
    }
    setError('');
    setSuccess('');
  }, [selectedNode]);

  return (
    <div className="manage-panel">
      <h3 className="panel-title">Manage Colleges</h3>

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {/* Creation form */}
      <div className="panel-section">
        <h4 className="section-title">Create College under <span className="highlight-text">{activeExam}</span></h4>
        <form onSubmit={handleCreate} className="panel-form">
          <input
            type="text"
            className="form-input text-field"
            placeholder="e.g. CBIT, VNR VJIET"
            value={newCollegeName}
            onChange={(e) => setNewCollegeName(e.target.value)}
            disabled={loading}
            required
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Add College'}
          </button>
        </form>
      </div>

      {/* Editing / Deletion controls for selected college */}
      {selectedNode?.type === 'college' && (
        <div className="panel-section edit-section">
          <h4 className="section-title">Edit / Delete Selected College</h4>
          <form onSubmit={handleUpdate} className="panel-form">
            <input
              type="text"
              className="form-input text-field"
              value={editCollegeName}
              onChange={(e) => setEditCollegeName(e.target.value)}
              disabled={loading}
              required
            />
            <button type="submit" className="btn-secondary" disabled={loading || editCollegeName === selectedNode.name}>
              {loading ? 'Saving...' : 'Rename'}
            </button>
          </form>

          <div className="danger-zone">
            <p className="danger-text">This action CANNOT be undone and cascades down.</p>
            <button 
              type="button" 
              onClick={handleDelete} 
              className="btn-danger"
              disabled={loading}
            >
              Delete College
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

export default ManageColleges;
