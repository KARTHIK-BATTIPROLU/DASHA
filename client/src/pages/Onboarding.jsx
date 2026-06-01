import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

const CLASS_OPTIONS = [
  { value: '10th', label: '10th Completed' },
  { value: 'Intermediate', label: 'Intermediate Completed' },
  { value: 'Diploma', label: 'Diploma Completed' }
];

const Onboarding = () => {
  const { currentUser, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [classCompleted, setClassCompleted] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!fullName.trim()) return 'Full name is required.';
    if (!/^\d{10}$/.test(mobile)) return 'Mobile number must be exactly 10 digits.';
    if (!classCompleted) return 'Please select your class completed.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/student/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: currentUser.uid,
          fullName: fullName.trim(),
          mobile,
          classCompleted
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.msg || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      await refreshProfile();
      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMobileInput = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(val);
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-card glass-card">
        {/* Header */}
        <div className="onboarding-header">
          <div className="onboarding-icon">📋</div>
          <h1 className="onboarding-title">Complete Your Profile</h1>
          <p className="onboarding-subtitle">
            Just a few details to personalise your experience on the Hyderabad Coders College Selection platform.
          </p>
          <div className="onboarding-email-badge">
            <span className="email-icon">✉</span>
            <span>{currentUser?.email}</span>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="onboarding-progress">
          <div className="progress-step completed">
            <div className="step-dot">✓</div>
            <span>Account Created</span>
          </div>
          <div className="progress-connector active"></div>
          <div className="progress-step active">
            <div className="step-dot">2</div>
            <span>Complete Profile</span>
          </div>
          <div className="progress-connector"></div>
          <div className="progress-step">
            <div className="step-dot">3</div>
            <span>Access Platform</span>
          </div>
        </div>

        {error && (
          <div className="ob-error-alert">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="onboarding-form" noValidate>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="ob-name">
              Full Name <span className="required-star">*</span>
            </label>
            <input
              id="ob-name"
              type="text"
              className="form-input"
              placeholder="e.g. Karthik Reddy"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              required
              autoFocus
            />
          </div>

          {/* Mobile Number */}
          <div className="form-group">
            <label className="form-label" htmlFor="ob-mobile">
              Mobile Number <span className="required-star">*</span>
            </label>
            <div className="mobile-input-wrapper">
              <span className="mobile-prefix">+91</span>
              <input
                id="ob-mobile"
                type="tel"
                className="form-input mobile-input"
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={handleMobileInput}
                disabled={loading}
                maxLength={10}
                required
              />
            </div>
            <span className="input-hint">{mobile.length}/10 digits</span>
          </div>

          {/* Class Completed */}
          <div className="form-group">
            <label className="form-label" htmlFor="ob-class">
              Class Completed <span className="required-star">*</span>
            </label>
            <select
              id="ob-class"
              className="form-input form-select"
              value={classCompleted}
              onChange={(e) => setClassCompleted(e.target.value)}
              disabled={loading}
              required
            >
              <option value="">— Select your qualification —</option>
              {CLASS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary ob-submit-btn"
            disabled={loading || !fullName.trim() || mobile.length !== 10 || !classCompleted}
          >
            {loading ? (
              <span className="ob-loading-row">
                <span className="ob-spinner"></span>
                Saving Profile...
              </span>
            ) : (
              'Save & Continue to Platform →'
            )}
          </button>
        </form>
      </div>

      <style>{`
        .onboarding-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 20px 40px;
        }

        .onboarding-card {
          width: 100%;
          max-width: 520px;
          padding: 44px 40px;
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(19, 25, 43, 0.75);
        }

        .onboarding-header {
          text-align: center;
          margin-bottom: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .onboarding-icon {
          font-size: 2.4rem;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: rgba(139, 92, 246, 0.08);
          border: 1px solid rgba(139, 92, 246, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 6px;
          box-shadow: var(--shadow-glow-purple);
        }

        .onboarding-title {
          font-size: 1.75rem;
          color: var(--text-primary);
        }

        .onboarding-subtitle {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
          max-width: 340px;
        }

        .onboarding-email-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(0, 242, 254, 0.05);
          border: 1px solid rgba(0, 242, 254, 0.15);
          color: var(--accent-cyan);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          margin-top: 4px;
        }

        .email-icon {
          font-style: normal;
        }

        /* Progress Steps */
        .onboarding-progress {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          margin-bottom: 32px;
          padding: 16px 0;
          border-top: 1px solid var(--border-glass);
          border-bottom: 1px solid var(--border-glass);
        }

        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          flex: 1;
        }

        .step-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.04);
          border: 2px solid var(--border-glass);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .progress-step span {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 500;
          white-space: nowrap;
        }

        .progress-step.completed .step-dot {
          background: rgba(52, 211, 153, 0.12);
          border-color: var(--accent-emerald);
          color: var(--accent-emerald);
        }

        .progress-step.completed span {
          color: var(--accent-emerald);
        }

        .progress-step.active .step-dot {
          background: rgba(139, 92, 246, 0.12);
          border-color: var(--accent-purple);
          color: var(--accent-purple);
          box-shadow: 0 0 12px rgba(139, 92, 246, 0.3);
        }

        .progress-step.active span {
          color: var(--accent-purple);
        }

        .progress-connector {
          flex: 0 0 40px;
          height: 2px;
          background: var(--border-glass);
          margin-bottom: 22px;
        }

        .progress-connector.active {
          background: linear-gradient(90deg, var(--accent-emerald), var(--accent-purple));
        }

        /* Error */
        .ob-error-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(244, 63, 94, 0.08);
          border: 1px solid rgba(244, 63, 94, 0.18);
          color: #fda4af;
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          font-size: 0.82rem;
          margin-bottom: 24px;
        }

        /* Form */
        .onboarding-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .form-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .required-star {
          color: var(--accent-rose);
          margin-left: 2px;
        }

        .mobile-input-wrapper {
          display: flex;
          align-items: stretch;
          border-radius: var(--radius-sm);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(10, 14, 26, 0.5);
          transition: var(--transition-smooth);
        }

        .mobile-input-wrapper:focus-within {
          border-color: rgba(0, 242, 254, 0.4);
          box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.06);
        }

        .mobile-prefix {
          padding: 0 14px;
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 600;
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .mobile-input {
          border: none !important;
          border-radius: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          flex: 1;
        }

        .mobile-input:focus {
          box-shadow: none !important;
        }

        .form-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2364748b' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 40px;
          cursor: pointer;
        }

        .form-select option {
          background: #13192b;
          color: var(--text-primary);
        }

        .input-hint {
          font-size: 0.72rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .ob-submit-btn {
          width: 100%;
          justify-content: center;
          height: 50px;
          font-size: 0.95rem;
          margin-top: 8px;
        }

        .ob-submit-btn:disabled:not([disabled=""]) {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
        }

        .ob-loading-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ob-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 540px) {
          .onboarding-card {
            padding: 32px 24px;
          }
          .onboarding-title {
            font-size: 1.45rem;
          }
          .progress-connector {
            flex: 0 0 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Onboarding;
