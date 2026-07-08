import React from 'react';
import './Sidebar.css';

export default function Sidebar({ activeTab, setActiveTab, currentRole }) {
  // Navigation tabs with icons and role restriction flags
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊', adminOnly: false },
    { id: 'pos', name: 'POS Billing', icon: '🛒', adminOnly: false },
    { id: 'inventory', name: 'Inventory', icon: '📦', adminOnly: false },
    { id: 'reports', name: 'Reports & Logs', icon: '📈', adminOnly: true }
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <div className="avatar-circle">💊</div>
        <div className="store-info">
          <h3>Shabab er Dokan</h3>
          <span className="location">Dhaka, Bangladesh</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {tabs.map((tab) => {
            // Hide adminOnly pages from Staff
            if (tab.adminOnly && currentRole !== 'Admin') return null;

            return (
              <li key={tab.id}>
                <button
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="nav-icon">{tab.icon}</span>
                  <span className="nav-text">{tab.name}</span>
                  {activeTab === tab.id && <span className="active-indicator" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="footer-status">
          <span className="status-dot online" />
          <span className="status-text">System Online</span>
        </div>
        <div className="footer-copyright">
          v1.0.0 &copy; 2026
        </div>
      </div>
    </aside>
  );
}
