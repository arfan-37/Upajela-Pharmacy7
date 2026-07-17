import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLoginSuccess, t }) {
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
      setError(t.login.error);
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
          <h2>{t.login.title}</h2>
          <p className="login-subtitle">{t.login.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="loginPass">{t.login.passwordLabel}</label>
            <input
              type="password"
              id="loginPass"
              required
              placeholder={t.login.placeholder}
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
            {t.login.login}
          </button>
        </form>

        <div className="demo-credentials-box">
          <h4>{t.login.demoTitle}</h4>
          <ul>
            <li>{t.login.demoAdmin}</li>
            <li>{t.login.demoStaff}</li>
          </ul>
        </div>

        <div className="login-footer">
          <span>{t.login.footer}</span>
        </div>
      </div>
    </div>
  );
}
