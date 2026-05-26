import React, { useState } from 'react';

const StructureTree = ({ treeData, onSelectNode, selectedNodeId }) => {
  const [expandedNodes, setExpandedNodes] = useState({});

  const toggleExpand = (nodeId, e) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const handleNodeClick = (nodeType, node, parentContext = {}) => {
    if (onSelectNode) {
      onSelectNode({
        type: nodeType,
        id: node.id || node.name,
        name: node.name,
        parentContext,
        raw: node
      });
    }
  };

  // Helper to check if a node is selected
  const isSelected = (nodeId) => selectedNodeId === nodeId;

  return (
    <div className="tree-container">
      <h3 className="tree-title">Database Hierarchy Tree</h3>
      <p className="tree-description">Expand exams and colleges to view branches. Click on any item to manage it in the workspace.</p>

      <div className="tree-root">
        {treeData && treeData.map(exam => {
          const isExamExpanded = expandedNodes[exam.id];
          return (
            <div key={exam.id} className="tree-node exam-node">
              <div 
                className={`node-header exam-header ${isSelected(exam.id) ? 'selected' : ''}`}
                onClick={() => {
                  handleNodeClick('exam', exam);
                  setExpandedNodes(prev => ({ ...prev, [exam.id]: !prev[exam.id] }));
                }}
              >
                <button 
                  className={`expand-btn ${isExamExpanded ? 'expanded' : ''}`}
                  onClick={(e) => toggleExpand(exam.id, e)}
                >
                  ▶
                </button>
                <span className="node-icon">🎓</span>
                <span className="node-name">{exam.name}</span>
                <span className="node-badge exam-badge">EXAM</span>
                <span className="node-count">({exam.colleges.length} colleges)</span>
              </div>

              {isExamExpanded && (
                <div className="node-children">
                  {exam.colleges.length === 0 ? (
                    <div className="empty-node-message">No colleges created yet.</div>
                  ) : (
                    exam.colleges.map(college => {
                      const isCollegeExpanded = expandedNodes[college.id];
                      return (
                        <div key={college.id} className="tree-node college-node">
                          <div 
                            className={`node-header college-header ${isSelected(college.id) ? 'selected' : ''}`}
                            onClick={() => {
                              handleNodeClick('college', college, { examName: exam.name });
                              setExpandedNodes(prev => ({ ...prev, [college.id]: !prev[college.id] }));
                            }}
                          >
                            <button 
                              className={`expand-btn ${isCollegeExpanded ? 'expanded' : ''}`}
                              onClick={(e) => toggleExpand(college.id, e)}
                            >
                              ▶
                            </button>
                            <span className="node-icon">🏛️</span>
                            <span className="node-name">{college.name}</span>
                            <span className="node-count">({college.branches.length} branches)</span>
                          </div>

                          {isCollegeExpanded && (
                            <div className="node-children">
                              {college.branches.length === 0 ? (
                                <div className="empty-node-message">No branches created yet.</div>
                              ) : (
                                college.branches.map(branch => {
                                  return (
                                    <div key={branch.id} className="tree-node branch-node">
                                      <div 
                                        className={`node-header branch-header ${isSelected(branch.id) ? 'selected' : ''}`}
                                        onClick={() => handleNodeClick('branch', branch, { 
                                          examName: exam.name, 
                                          collegeId: college.id, 
                                          collegeName: college.name 
                                        })}
                                      >
                                        <span className="indent-line"></span>
                                        <span className="node-icon">🔬</span>
                                        <span className="node-name">{branch.name}</span>
                                        
                                        {branch.pdf ? (
                                          <div className="pdf-attachment-tag">
                                            <span className="pdf-tag-icon">📄</span>
                                            <span className="pdf-tag-text">{branch.pdf.filename}</span>
                                          </div>
                                        ) : (
                                          <span className="pdf-pending-tag">No PDF</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .tree-container {
          background: rgba(19, 25, 43, 0.4);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-md);
          padding: 24px;
          height: 100%;
          min-height: 450px;
        }

        .tree-title {
          font-size: 1.25rem;
          margin-bottom: 8px;
          background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .tree-description {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 24px;
          line-height: 1.4;
        }

        .tree-root {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tree-node {
          display: flex;
          flex-direction: column;
        }

        .node-header {
          display: flex;
          align-items: center;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: var(--transition-smooth);
          user-select: none;
          gap: 8px;
          border: 1px solid transparent;
        }

        .node-header:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .node-header.selected {
          background: rgba(0, 242, 254, 0.08);
          border-color: rgba(0, 242, 254, 0.2);
        }

        .expand-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 0.65rem;
          cursor: pointer;
          padding: 4px;
          transition: var(--transition-smooth);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
        }

        .expand-btn.expanded {
          transform: rotate(90deg);
          color: var(--text-primary);
        }

        .node-icon {
          font-size: 1.05rem;
          display: flex;
          align-items: center;
        }

        .node-name {
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .node-badge {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }

        .exam-badge {
          background: rgba(124, 58, 237, 0.15);
          color: #c084fc;
          border: 1px solid rgba(124, 58, 237, 0.25);
        }

        .node-count {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .node-children {
          padding-left: 24px;
          margin-top: 4px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          border-left: 1px dashed rgba(255, 255, 255, 0.08);
          margin-left: 22px;
        }

        .college-node {
          margin-top: 2px;
        }

        .college-header .node-name {
          color: #e2e8f0;
        }

        .branch-header {
          cursor: pointer;
          position: relative;
          padding-left: 10px;
        }

        .branch-header .node-name {
          color: var(--text-secondary);
          font-weight: 400;
        }

        .branch-header:hover .node-name {
          color: var(--text-primary);
        }

        .pdf-attachment-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #34d399;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          max-width: 180px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pdf-tag-icon {
          font-size: 0.7rem;
        }

        .pdf-tag-text {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pdf-pending-tag {
          font-size: 0.7rem;
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.2);
          color: #fda4af;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .empty-node-message {
          font-size: 0.8rem;
          color: var(--text-muted);
          padding: 6px 14px;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default StructureTree;
