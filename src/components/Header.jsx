import React from 'react';
import './Header.css';

export default function Header({ currentRole, onLogout, language, setLanguage, t }) {
  return (
    <header className="app-header">
      <div className="header-logo">
        <span className="medical-cross">✚</span>
        <div className="header-brand">
          <h1>{t.header.title}</h1>
          <span className="subtitle">{t.header.subtitle}</span>
        </div>
      </div>

      <div className="header-actions">
        <div className="language-switcher">
          <span className="role-label">{t.header.toggleLabel}</span>
          <button
            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
          >
            {t.common.english}
          </button>
          <button
            className={`lang-btn ${language === 'bn' ? 'active' : ''}`}
            onClick={() => setLanguage('bn')}
          >
            {t.common.bangla}
          </button>
        </div>
        <div className="role-switcher-container">
          <span className="role-label">{t.header.activeSession}</span>
          <div className="role-badge-wrapper">
            <span className={`role-badge ${currentRole.toLowerCase()}`}>
              {currentRole === 'Admin' ? t.header.admin : t.header.staff}
            </span>
            <button 
              className="btn btn-secondary btn-sm logout-btn" 
              onClick={onLogout}
              title={t.common.logout}
            >
              🚪 {t.common.logout}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
