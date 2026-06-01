import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StructureTree from '../../components/StructureTree';
import ManageColleges from './ManageColleges';
import ManageBranches from './ManageBranches';
import UploadPDF from './UploadPDF';
import StudentData from './StudentData';

const AdminDashboard = () => {
  const [treeData, setTreeData] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeTab, setActiveTab] = useState('colleges'); // 'colleges' | 'branches' | 'pdfs' | 'students'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

  const fetchStructure = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    try {
      const res = await axios.get(`${apiBase}/api/admin/structure`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTreeData(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      } else {
        setError('Failed to fetch database tree structure. Please reload the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructure();
  }, []);

  const handleSelectNode = (nodeInfo) => {
    setSelectedNode(nodeInfo);
    
    // Auto-focus tabs based on node type clicked
    if (nodeInfo.type === 'exam') {
      setActiveTab('colleges');
    } else if (nodeInfo.type === 'college') {
      setActiveTab('branches');
    } else if (nodeInfo.type === 'branch') {
      setActiveTab('pdfs');
    }
  };

  const handleActionComplete = (actionType) => {
    // If a node was deleted, clear selection
    if (actionType === 'delete') {
      setSelectedNode(null);
    }
    // Tree data is refreshed automatically by the child calling refreshTree()
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="dashboard-loading-container">
        <div className="glowing-spinner"></div>
        <p className="loading-text">Loading Administrative Workspace...</p>
        <style>{`
          .dashboard-loading-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: var(--bg-primary);
          }
          .glowing-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(0, 242, 254, 0.1);
            border-radius: 50%;
            border-top-color: var(--accent-cyan);
            animation: spin 1s cubic-bezier(0.55, 0.085, 0.68, 0.53) infinite;
            box-shadow: var(--shadow-glow-cyan);
            margin-bottom: 20px;
          }
          .loading-text {
            color: var(--text-secondary);
            font-size: 0.95rem;
            font-weight: 500;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="page-container dashboard-page">
      <div className="dashboard-header-block">
        <div>
          <h1 className="dashboard-main-title">Admin Dashboard</h1>
          <p className="dashboard-sub-title">Configure Telangana allotment collections and upload PDFs</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary logout-dashboard-btn">
          Sign Out
        </button>
      </div>

      {error && <div className="dashboard-error-banner">⚠️ {error}</div>}

      <div className="dashboard-layout-grid">
        {/* Left Column - Database Tree */}
        <div className="dashboard-col tree-column glass-card">
          <StructureTree 
            treeData={treeData} 
            onSelectNode={handleSelectNode} 
            selectedNodeId={selectedNode?.id}
          />
        </div>

        {/* Right Column - Workspaces */}
        <div className="dashboard-col workspace-column glass-card">
          {/* Workspace Tabs */}
          <div className="workspace-tabs-bar">
            <button 
              className={`workspace-tab-btn ${activeTab === 'colleges' ? 'active' : ''}`}
              onClick={() => setActiveTab('colleges')}
            >
              Colleges CRUD
            </button>
            <button 
              className={`workspace-tab-btn ${activeTab === 'branches' ? 'active' : ''}`}
              onClick={() => setActiveTab('branches')}
            >
              Branches CRUD
            </button>
            <button
              className={`workspace-tab-btn ${activeTab === 'pdfs' ? 'active' : ''}`}
              onClick={() => setActiveTab('pdfs')}
            >
              Allotment PDFs
            </button>
            <button
              className={`workspace-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => setActiveTab('students')}
            >
              Student Data
            </button>
          </div>

          <div className="workspace-content-pane">
            {activeTab === 'colleges' && (
              <ManageColleges 
                selectedNode={selectedNode} 
                refreshTree={fetchStructure}
                onActionComplete={handleActionComplete}
              />
            )}
            
            {activeTab === 'branches' && (
              <ManageBranches 
                selectedNode={selectedNode} 
                refreshTree={fetchStructure}
                onActionComplete={handleActionComplete}
              />
            )}

            {activeTab === 'pdfs' && (
              <UploadPDF
                selectedNode={selectedNode}
                refreshTree={fetchStructure}
                onActionComplete={handleActionComplete}
              />
            )}

            {activeTab === 'students' && (
              <StudentData />
            )}
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-page {
          max-width: 1400px !important;
        }

        .dashboard-header-block {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .dashboard-main-title {
          font-size: 2.2rem;
          background: linear-gradient(135deg, #ffffff 0%, var(--text-secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .dashboard-sub-title {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .logout-dashboard-btn {
          padding: 10px 20px;
          font-size: 0.9rem;
        }

        .dashboard-error-banner {
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.2);
          color: #fda4af;
          padding: 14px 20px;
          border-radius: var(--radius-sm);
          font-weight: 500;
          margin-bottom: 24px;
        }

        .dashboard-layout-grid {
          display: grid;
          grid-template-columns: 450px 1fr;
          gap: 30px;
          align-items: start;
        }

        .dashboard-col {
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: none !important; /* disable hover translation on layout columns */
          transform: none !important;
        }

        .tree-column {
          padding: 0;
          border: 1px solid var(--border-glass);
        }

        .workspace-column {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border-glass);
          background: rgba(19, 25, 43, 0.45);
          min-height: 550px;
        }

        .workspace-tabs-bar {
          display: flex;
          border-bottom: 1px solid var(--border-glass);
          background: rgba(10, 14, 26, 0.4);
        }

        .workspace-tab-btn {
          flex: 1;
          padding: 18px 24px;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: var(--transition-smooth);
          border-bottom: 2px solid transparent;
        }

        .workspace-tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.02);
        }

        .workspace-tab-btn.active {
          color: var(--accent-cyan);
          border-bottom-color: var(--accent-cyan);
          background: rgba(0, 242, 254, 0.02);
        }

        .workspace-content-pane {
          padding: 30px;
          flex: 1;
        }

        @media (max-width: 1024px) {
          .dashboard-layout-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
