import React from 'react';
import './Dashboard.css';
import { formatDateOnly, normalizeDate } from '../utils/dateUtils';
import { getMedicineExpirySummary, getMedicineTotalStock } from '../utils/inventoryBatchUtils';

export default function Dashboard({ medicines, transactions, currentRole, setActiveTab, setInventoryFilter, t }) {
  const TODAY = formatDateOnly();

  const EXPIRY_WARNING_DAYS = 30;
  const getMedicineEffectiveExpiry = (med) => {
    return getMedicineExpirySummary(med, TODAY, EXPIRY_WARNING_DAYS).displayExpiry || normalizeDate(med.expiryDate);
  };

  const isMedicineHasExpiredBatch = (med) => {
    return getMedicineExpirySummary(med, TODAY, EXPIRY_WARNING_DAYS).hasExpiredBatches;
  };

  const isMedicineExpiringSoon = (med) => {
    return getMedicineExpirySummary(med, TODAY, EXPIRY_WARNING_DAYS).hasExpiringBatches;
  };

  const expiredMedicines = medicines.filter(m => isMedicineHasExpiredBatch(m));
  const expiringSoonMedicines = medicines.filter(m => {
    if (!isMedicineExpiringSoon(m)) return false;
    return !isMedicineHasExpiredBatch(m);
  });
  const totalUrgentCount = expiredMedicines.length + expiringSoonMedicines.length;

  const totalItems = medicines.length;

  const lowStockMedicines = medicines.filter(m => getMedicineTotalStock(m) < 15);
  const lowStockCount = lowStockMedicines.length;

  // Sales by Category (general inventory statistics - safe for all roles)
  const categorySales = {};
  transactions.forEach(tx => {
    tx.items.forEach(item => {
      const med = medicines.find(m => m.id === item.id);
      const cat = med ? med.category : 'Other';
      categorySales[cat] = (categorySales[cat] || 0) + (item.price * item.quantity);
    });
  });

  const categories = Object.keys(categorySales);
  const salesValues = Object.values(categorySales);
  const maxSalesValue = Math.max(...salesValues, 100);

  return (
    <div className="page-container fade-in">
      <div className="dashboard-welcome">
        <h2>{t.dashboard.welcomeAdmin}</h2>
        <p className="welcome-text">{t.dashboard.intro}</p>
      </div>

      {totalUrgentCount > 0 && (
        <div 
          className="expiry-alert-banner" 
          onClick={() => { 
            setInventoryFilter('Expiring/Expired'); 
            setActiveTab('inventory'); 
          }}
          title="Click to view expiring medicines"
        >
          <div className="banner-content">
            <span className="alert-icon">🚨</span>
            <span className="banner-text">
              <strong>{t.dashboard.expiryAlert}</strong> {t.dashboard.expiryMessage.replace('{count}', totalUrgentCount)}
            </span>
          </div>
          <span className="banner-action">{t.dashboard.viewProducts}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="glass-card kpi-card">
          <div className="kpi-icon items-icon">📦</div>
          <div className="kpi-data">
            <span className="kpi-title">{t.dashboard.items}</span>
            <h3 className="kpi-value">{totalItems}</h3>
            <span className="kpi-subtext" style={{cursor: 'pointer'}} onClick={() => setActiveTab('inventory')}>
              {t.dashboard.browseInventory}
            </span>
          </div>
        </div>

        <div 
          className="glass-card kpi-card warning-border clickable-kpi"
          onClick={() => {
            setInventoryFilter('Low Stock');
            setActiveTab('inventory');
          }}
          title="Click to view low stock medicines"
        >
          <div className="kpi-icon warning-icon">⚠️</div>
          <div className="kpi-data">
            <span className="kpi-title">{t.dashboard.lowStock}</span>
            <h3 className="kpi-value text-warning">{lowStockCount}</h3>
            <span className="kpi-subtext">{t.dashboard.lowStockSubtext}</span>
          </div>
        </div>

        <div 
          className="glass-card kpi-card danger-border clickable-kpi"
          onClick={() => {
            setInventoryFilter('Expiring/Expired');
            setActiveTab('inventory');
          }}
          title="Click to view expiring medicines"
        >
          <div className="kpi-icon danger-icon">⏰</div>
          <div className="kpi-data">
            <span className="kpi-title">{t.dashboard.expiryWarnings}</span>
            <h3 className="kpi-value text-danger">{totalUrgentCount}</h3>
            <span className="kpi-subtext">{expiredMedicines.length} expired | {expiringSoonMedicines.length} expiring soon</span>
          </div>
        </div>
      </div>

      <div className="dashboard-layouts-grid">
        {/* Main Panel */}
        <div className="glass-card dashboard-chart-section">
          {currentRole === 'Admin' ? (
            <>
              <h3>{t.dashboard.salesByCategory}</h3>
              <p className="section-description">{t.dashboard.salesByCategoryDesc}</p>
              
              {categories.length > 0 ? (
                <div className="chart-wrapper">
                  <svg className="bar-chart-svg" viewBox="0 0 500 200">
                    {/* Grid lines */}
                    <line x1="50" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.05)" />
                    <line x1="50" y1="70" x2="480" y2="70" stroke="rgba(255,255,255,0.05)" />
                    <line x1="50" y1="120" x2="480" y2="120" stroke="rgba(255,255,255,0.05)" />
                    <line x1="50" y1="160" x2="480" y2="160" stroke="rgba(255,255,255,0.1)" />

                    {/* Bars */}
                    {categories.map((cat, idx) => {
                      const barWidth = 40;
                      const spacing = (400 / categories.length);
                      const x = 70 + idx * spacing;
                      const value = categorySales[cat];
                      const barHeight = (value / maxSalesValue) * 130;
                      const y = 160 - barHeight;

                      return (
                        <g key={cat} className="chart-bar-group">
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            rx="4"
                            fill="url(#barGradient)"
                            className="chart-rect"
                          />
                          {/* Value label */}
                          <text
                            x={x + barWidth / 2}
                            y={y - 8}
                            textAnchor="middle"
                            fill="var(--text-primary)"
                            fontSize="10"
                            fontWeight="600"
                          >
                            ৳{value.toFixed(0)}
                          </text>
                          {/* X axis Label */}
                          <text
                            x={x + barWidth / 2}
                            y="178"
                            textAnchor="middle"
                            fill="var(--text-secondary)"
                            fontSize="10"
                          >
                            {cat}
                          </text>
                        </g>
                      );
                    })}

                    <defs>
                      <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--accent-hover)" />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.4" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              ) : (
                <div className="empty-chart">
                  <span>{t.dashboard.noData}</span>
                </div>
              )}
            </>
          ) : (
            <div className="staff-action-box">
              <h3>{t.dashboard.quickPos}</h3>
              <p>{t.dashboard.quickPosDesc}</p>
              <button className="btn btn-primary" onClick={() => setActiveTab('pos')}>
                {t.dashboard.launchPos}
              </button>
            </div>
          )}
        </div>

        {/* Alerts & Warnings Panel */}
        <div className="glass-card dashboard-alerts-section">
          <h3>{t.dashboard.urgentAlerts}</h3>
          <p className="section-description">{t.dashboard.urgentAlertsDesc}</p>
          
          <div className="alerts-list">
            {expiredMedicines.map(m => (
              <div key={m.id} className="alert-item danger-item">
                <span className="alert-icon">☠️</span>
                <div className="alert-info">
                  <h4>{m.name} <span className="alert-generic">({m.genericName})</span></h4>
                  <p className="alert-desc text-danger">{t.dashboard.expiredOn.replace('{date}', getMedicineEffectiveExpiry(m))}</p>
                </div>
                {currentRole === 'Admin' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('inventory')}>
                    Manage
                  </button>
                )}
              </div>
            ))}

            {expiringSoonMedicines.map(m => (
              <div key={m.id} className="alert-item danger-item">
                <span className="alert-icon">📅</span>
                <div className="alert-info">
                  <h4>{m.name} <span className="alert-generic">({m.genericName})</span></h4>
                  <p className="alert-desc text-danger">{t.dashboard.expiringSoonText.replace('{date}', getMedicineEffectiveExpiry(m))}</p>
                </div>
                {currentRole === 'Admin' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('inventory')}>
                    Manage
                  </button>
                )}
              </div>
            ))}

            {lowStockMedicines.map(m => (
              <div key={m.id} className="alert-item warning-item">
                <span className="alert-icon">⚠️</span>
                <div className="alert-info">
                  <h4>{m.name} <span className="alert-generic">({m.genericName})</span></h4>
                  <p className="alert-desc text-warning">{t.dashboard.lowStockText.replace('{count}', m.stock)}</p>
                </div>
                {currentRole === 'Admin' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('inventory')}>
                    {t.dashboard.restock}
                  </button>
                )}
              </div>
            ))}

            {lowStockCount === 0 && totalUrgentCount === 0 && (
              <div className="all-clear">
                <span className="clear-icon">✅</span>
                <h4>{t.dashboard.allClear}</h4>
                <p>{t.dashboard.allClearDesc}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
