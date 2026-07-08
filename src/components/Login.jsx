import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsShaking(false);

    const trimmedPassword = password.trim();

    if (trimmedPassword === 'admin') {
      onLoginSuccess('Admin');
    } else if (trimmedPassword === 'staff') {
      onLoginSuccess('Staff');
    } else {
      setError('Invalid password. Try using "admin" or "staff".');
      setIsShaking(true);
      // Reset shake after animation completes
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="login-page-container">
      <div className={`glass-card login-card ${isShaking ? 'shake-anim' : ''}`}>
        <div className="login-brand">
          <span className="login-logo-cross">✚</span>
          <h2>Welcome to Shabab er Dokan</h2>
          <p className="login-subtitle">Pharmacy Shop Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="loginPass">Enter Password</label>
            <input
              type="password"
              id="loginPass"
              required
              placeholder="••••••••"
              className={`form-control ${error ? 'input-error' : ''}`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
            />
          </div>

          {error && <span className="login-error-text">{error}</span>}

          <button type="submit" className="btn btn-primary login-submit-btn">
            Login &rarr;
          </button>
        </form>

        <div className="demo-credentials-box">
          <h4>💡 Demo Passwords for Testing:</h4>
          <ul>
            <li>Enter <code>admin</code> for Admin Panel (Full Access)</li>
            <li>Enter <code>staff</code> for Staff Panel (POS &amp; Search Only)</li>
          </ul>
        </div>

        <div className="login-footer">
          <span>Secure Offline Session</span>
        </div>
      </div>
    </div>
  );
}
