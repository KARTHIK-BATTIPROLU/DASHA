import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const exams = [
    {
      id: 'TS ECET',
      title: 'TS ECET',
      subtitle: 'Engineering Common Entrance',
      description: 'Telangana State Engineering Common Entrance Test (for Diploma & B.Sc. Graduates) allotment sheets and college resources.',
      icon: '⚡',
      color: 'var(--accent-purple)',
      glow: 'var(--shadow-glow-purple)'
    },
    {
      id: 'TS EAPCET',
      title: 'TS EAPCET',
      subtitle: 'Engineering & Pharmacy',
      description: 'Telangana State Engineering, Agriculture and Pharmacy Common Entrance Test allotment sheets, seat allocations, and rank listings.',
      icon: '🩺',
      color: 'var(--accent-rose)',
      glow: '0 0 25px hsla(347, 85%, 53%, 0.2)'
    },
    {
      id: 'TS POLYCET',
      title: 'TS POLYCET',
      subtitle: 'Polytechnic Diploma',
      description: 'Telangana State Polytechnic Common Entrance Test branch allotments, diploma college files, and rankings.',
      icon: '🛠️',
      color: 'var(--accent-cyan)',
      glow: 'var(--shadow-glow-cyan)'
    }
  ];

  return (
    <div className="page-container home-page">
      <div className="hero-section">
        <h1 className="hero-title">
          Find Your <span className="highlight-gradient">Telangana College</span> Allotments
        </h1>
        <p className="hero-subtitle">
          Instantly browse, view, and download official college allotment PDF resources. Select your entrance exam stream to get started.
        </p>
      </div>

      <div className="exams-grid">
        {exams.map((exam, index) => {
          return (
            <div 
              key={exam.id} 
              className="exam-card glass-card"
              onClick={() => navigate(`/colleges/${exam.id}`)}
              style={{ '--exam-accent': exam.color }}
            >
              <div className="card-glow-bg" style={{ boxShadow: exam.glow }}></div>
              <div className="exam-card-header">
                <span className="exam-icon">{exam.icon}</span>
                <span className="exam-tag">TS STATE</span>
              </div>
              <h2 className="exam-title">{exam.title}</h2>
              <h4 className="exam-subtitle">{exam.subtitle}</h4>
              <p className="exam-desc">{exam.description}</p>
              
              <div className="exam-card-footer">
                <span className="footer-link-text">Browse Colleges</span>
                <span className="footer-arrow">→</span>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .home-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 60px;
          padding-top: 140px;
        }

        .hero-section {
          text-align: center;
          max-width: 800px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }

        .highlight-gradient {
          background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 1.15rem;
          color: var(--text-secondary);
          max-width: 650px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .exams-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          width: 100%;
          max-width: 1200px;
        }

        .exam-card {
          position: relative;
          padding: 40px 30px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          height: 100%;
          border: 1px solid var(--border-glass);
        }

        .exam-card:hover {
          border-color: var(--exam-accent);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
        }

        .card-glow-bg {
          position: absolute;
          top: -20px;
          left: -20px;
          right: -20px;
          bottom: -20px;
          z-index: -1;
          border-radius: 50%;
          opacity: 0;
          transition: var(--transition-smooth);
          filter: blur(40px);
        }

        .exam-card:hover .card-glow-bg {
          opacity: 0.15;
        }

        .exam-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .exam-icon {
          font-size: 2.2rem;
          width: 60px;
          height: 60px;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-spring);
        }

        .exam-card:hover .exam-icon {
          transform: scale(1.1) rotate(5deg);
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--exam-accent);
        }

        .exam-tag {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          border: 1px solid var(--border-glass);
          padding: 4px 8px;
          border-radius: 4px;
        }

        .exam-title {
          font-size: 2rem;
          color: var(--text-primary);
          margin-bottom: 4px;
          font-family: var(--font-display);
        }

        .exam-subtitle {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--exam-accent);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 16px;
        }

        .exam-desc {
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 30px;
          flex-grow: 1;
        }

        .exam-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--border-glass);
          padding-top: 20px;
          margin-top: auto;
        }

        .footer-link-text {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          transition: var(--transition-smooth);
        }

        .footer-arrow {
          font-size: 1.2rem;
          color: var(--text-secondary);
          transition: var(--transition-spring);
        }

        .exam-card:hover .footer-link-text {
          color: var(--exam-accent);
        }

        .exam-card:hover .footer-arrow {
          transform: translateX(6px);
          color: var(--exam-accent);
        }

        @media (max-width: 968px) {
          .exams-grid {
            grid-template-columns: 1fr;
            max-width: 450px;
          }
          .hero-title {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
