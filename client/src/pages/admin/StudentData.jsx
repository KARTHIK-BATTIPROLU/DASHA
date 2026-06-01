import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
const PAGE_SIZE = 50;

const CLASS_TABS = [
  { key: '10th', label: '10th Completed', filename: '10th_students.xlsx' },
  { key: 'Intermediate', label: 'Intermediate Completed', filename: 'intermediate_students.xlsx' },
  { key: 'Diploma', label: 'Diploma Completed', filename: 'diploma_students.xlsx' }
];

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

const StudentData = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('10th');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchStudents = async () => {
      const token = localStorage.getItem('adminToken');
      try {
        const res = await axios.get(`${API_BASE}/api/admin/students`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudents(res.data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Failed to load student data.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Reset page when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const tabStudents = useMemo(() => {
    return students.filter(s => s.classCompleted === activeTab && s.profileCompleted);
  }, [students, activeTab]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tabStudents;
    return tabStudents.filter(s =>
      s.fullName?.toLowerCase().includes(q) ||
      s.mobile?.includes(q)
    );
  }, [tabStudents, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const pagedStudents = filteredStudents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleExport = (tab) => {
    const data = students.filter(s => s.classCompleted === tab.key && s.profileCompleted);
    const rows = data.map((s, i) => ({
      '#': i + 1,
      'Full Name': s.fullName || '',
      'Mobile Number': s.mobile || '',
      'Class Completed': s.classCompleted || '',
      'Email': s.email || '',
      'Date Joined': formatDate(s.createdAt)
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    // Column widths
    ws['!cols'] = [
      { wch: 5 }, { wch: 28 }, { wch: 16 }, { wch: 22 }, { wch: 32 }, { wch: 16 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, tab.label.replace(' Completed', ''));
    XLSX.writeFile(wb, tab.filename);
  };

  if (loading) {
    return (
      <div className="sd-loading">
        <div className="sd-spinner"></div>
        <span>Loading student records...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sd-error">
        <span>⚠️</span> {error}
      </div>
    );
  }

  return (
    <div className="student-data-panel">
      {/* Sub-tabs */}
      <div className="sd-tabs-bar">
        {CLASS_TABS.map(tab => {
          const count = students.filter(s => s.classCompleted === tab.key && s.profileCompleted).length;
          return (
            <button
              key={tab.key}
              className={`sd-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.key); setSearchQuery(''); }}
            >
              {tab.label}
              <span className={`sd-count-badge ${activeTab === tab.key ? 'active' : ''}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="sd-toolbar">
        <div className="sd-search-wrapper">
          <span className="sd-search-icon">🔍</span>
          <input
            type="text"
            className="form-input sd-search-input"
            placeholder="Search by name or mobile…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="sd-clear-btn" onClick={() => setSearchQuery('')} title="Clear">✕</button>
          )}
        </div>
        <div className="sd-toolbar-right">
          <span className="sd-total-label">
            {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
            {searchQuery ? ' found' : ' total'}
          </span>
          <button
            className="sd-export-btn"
            onClick={() => handleExport(CLASS_TABS.find(t => t.key === activeTab))}
            disabled={tabStudents.length === 0}
            title="Download Excel"
          >
            <span>⬇</span> Download Excel
          </button>
        </div>
      </div>

      {/* Table */}
      {pagedStudents.length === 0 ? (
        <div className="sd-empty">
          {searchQuery
            ? `No students match "${searchQuery}"`
            : `No ${activeTab} students have registered yet.`}
        </div>
      ) : (
        <>
          <div className="sd-table-wrapper">
            <table className="sd-table">
              <thead>
                <tr>
                  <th className="sd-th col-num">#</th>
                  <th className="sd-th">Full Name</th>
                  <th className="sd-th">Mobile Number</th>
                  <th className="sd-th">Class Completed</th>
                  <th className="sd-th">Email</th>
                  <th className="sd-th">Date Joined</th>
                </tr>
              </thead>
              <tbody>
                {pagedStudents.map((student, idx) => (
                  <tr key={student._id} className="sd-tr">
                    <td className="sd-td col-num sd-muted">
                      {(currentPage - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td className="sd-td sd-name">{student.fullName || '—'}</td>
                    <td className="sd-td sd-mono">+91 {student.mobile || '—'}</td>
                    <td className="sd-td">
                      <span className={`sd-class-chip class-${student.classCompleted?.toLowerCase().replace(' ', '-')}`}>
                        {student.classCompleted}
                      </span>
                    </td>
                    <td className="sd-td sd-email">{student.email}</td>
                    <td className="sd-td sd-muted">{formatDate(student.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="sd-pagination">
              <button
                className="sd-page-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ← Prev
              </button>
              <span className="sd-page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="sd-page-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        .student-data-panel {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* Sub-tabs */
        .sd-tabs-bar {
          display: flex;
          border-bottom: 1px solid var(--border-glass);
          margin-bottom: 20px;
          gap: 0;
        }

        .sd-tab-btn {
          flex: 1;
          padding: 13px 16px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--text-secondary);
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: var(--transition-smooth);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          white-space: nowrap;
        }

        .sd-tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.02);
        }

        .sd-tab-btn.active {
          color: var(--accent-purple);
          border-bottom-color: var(--accent-purple);
        }

        .sd-count-badge {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-muted);
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 10px;
          min-width: 22px;
          text-align: center;
        }

        .sd-count-badge.active {
          background: rgba(139, 92, 246, 0.15);
          color: var(--accent-purple);
        }

        /* Toolbar */
        .sd-toolbar {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .sd-search-wrapper {
          flex: 1;
          min-width: 200px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .sd-search-icon {
          position: absolute;
          left: 12px;
          font-size: 0.85rem;
          pointer-events: none;
          z-index: 1;
        }

        .sd-search-input {
          padding-left: 36px !important;
          padding-right: 36px !important;
          height: 40px;
          font-size: 0.875rem;
        }

        .sd-clear-btn {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.75rem;
          padding: 4px;
          transition: color 0.2s;
        }

        .sd-clear-btn:hover { color: var(--text-primary); }

        .sd-toolbar-right {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }

        .sd-total-label {
          font-size: 0.82rem;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .sd-export-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 18px;
          background: rgba(52, 211, 153, 0.08);
          border: 1px solid rgba(52, 211, 153, 0.2);
          color: var(--accent-emerald);
          border-radius: var(--radius-sm);
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: var(--transition-smooth);
          white-space: nowrap;
        }

        .sd-export-btn:hover:not(:disabled) {
          background: rgba(52, 211, 153, 0.14);
          border-color: rgba(52, 211, 153, 0.35);
        }

        .sd-export-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Table */
        .sd-table-wrapper {
          overflow-x: auto;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-glass);
        }

        .sd-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        .sd-th {
          padding: 12px 16px;
          text-align: left;
          background: rgba(10, 14, 26, 0.5);
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          white-space: nowrap;
          border-bottom: 1px solid var(--border-glass);
        }

        .sd-tr {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          transition: background 0.15s;
        }

        .sd-tr:last-child { border-bottom: none; }

        .sd-tr:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .sd-td {
          padding: 13px 16px;
          color: var(--text-primary);
          vertical-align: middle;
        }

        .col-num {
          width: 48px;
          text-align: center;
        }

        .sd-muted { color: var(--text-muted); font-size: 0.82rem; }
        .sd-name { font-weight: 600; }
        .sd-mono { font-family: 'Courier New', monospace; font-size: 0.85rem; }
        .sd-email { color: var(--text-secondary); font-size: 0.83rem; }

        .sd-class-chip {
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .class-10th {
          background: rgba(0, 242, 254, 0.08);
          color: var(--accent-cyan);
          border: 1px solid rgba(0, 242, 254, 0.15);
        }

        .class-intermediate {
          background: rgba(139, 92, 246, 0.08);
          color: var(--accent-purple);
          border: 1px solid rgba(139, 92, 246, 0.15);
        }

        .class-diploma {
          background: rgba(251, 191, 36, 0.08);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.15);
        }

        /* Pagination */
        .sd-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 16px;
        }

        .sd-page-btn {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .sd-page-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
        }

        .sd-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        .sd-page-info {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        /* States */
        .sd-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 48px 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .sd-spinner {
          width: 22px;
          height: 22px;
          border: 2px solid rgba(0, 242, 254, 0.15);
          border-top-color: var(--accent-cyan);
          border-radius: 50%;
          animation: sd-spin 0.8s linear infinite;
          flex-shrink: 0;
        }

        @keyframes sd-spin {
          to { transform: rotate(360deg); }
        }

        .sd-error {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(244, 63, 94, 0.08);
          border: 1px solid rgba(244, 63, 94, 0.15);
          color: #fda4af;
          padding: 14px 18px;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
        }

        .sd-empty {
          text-align: center;
          padding: 48px 0;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .sd-toolbar { flex-direction: column; align-items: stretch; }
          .sd-toolbar-right { justify-content: space-between; }
          .sd-tab-btn { font-size: 0.75rem; padding: 10px 8px; }
        }
      `}</style>
    </div>
  );
};

export default StudentData;
