import React from 'react';
import './Header.css';

export default function Header({ currentRole, onLogout }) {
  return (
    <header className="app-header">
      <div className="header-logo">
        <span className="medical-cross">✚</span>
        <div className="header-brand">
          <h1>Shabab er Dokan</h1>
          <span className="subtitle">Pharmacy Management System</span>
        </div>
      </div>

      <div className="header-actions">
        <div className="role-switcher-container">
          <span className="role-label">Active Session:</span>
          <div className="role-badge-wrapper">
            <span className={`role-badge ${currentRole.toLowerCase()}`}>
              {currentRole === 'Admin' ? '🛡️ Admin (Shabab)' : '🧑‍⚕️ Staff (Assistant)'}
            </span>
            <button 
              className="btn btn-secondary btn-sm logout-btn" 
              onClick={onLogout}
              title="Log out of system"
            >
              🚪 Log Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
