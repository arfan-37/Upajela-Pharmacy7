import React, { useState } from 'react';
import ReceiptModal from './ReceiptModal';
import './Reports.css';

export default function Reports({ transactions, currentRole, t }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [salespersonFilter, setSalespersonFilter] = useState('All');
  const [selectedTx, setSelectedTx] = useState(null);

  // Security Gatekeeper Backup
  if (currentRole !== 'Admin') {
    return (
      <div className="page-container fade-in">
        <div className="glass-card access-denied-card">
          <span className="denied-icon">🔒</span>
          <h2>{t.reports.accessDeniedTitle}</h2>
          <p>{t.reports.accessDeniedDesc}</p>
        </div>
      </div>
    );
  }

  // Financial Calculations
  const totalRevenue = transactions.reduce((sum, tx) => sum + tx.total, 0);
  
  const totalCost = transactions.reduce((sum, tx) => {
    return sum + tx.items.reduce((itemCostSum, item) => {
      const itemCost = item.cost || (item.price * 0.8);
      return itemCostSum + (itemCost * item.quantity);
    }, 0);
  }, 0);

  const totalDiscountGiven = transactions.reduce((sum, tx) => sum + tx.discount, 0);
  const totalProfit = totalRevenue - totalCost - totalDiscountGiven;
  const averageTxValue = transactions.length > 0 ? totalRevenue / transactions.length : 0;

  // Filter transactions list
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSalesperson = salespersonFilter === 'All' || 
      (salespersonFilter === 'Admin' && tx.salesperson.includes('Admin')) ||
      (salespersonFilter === 'Assistant' && tx.salesperson.includes('Assistant'));

    return matchesSearch && matchesSalesperson;
  });

  const formatDate = (isoStr) => {
    const d = new Date(isoStr);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="page-container fade-in">
      
      {/* Page Header */}
      <div className="reports-header">
        <h2>{t.reports.title}</h2>
        <p className="subtitle">{t.reports.subtitle}</p>
      </div>

      {/* Financial Summary Cards */}
      <div className="reports-stats-grid">
        <div className="glass-card report-kpi">
          <span className="report-kpi-lbl">{t.reports.grossRevenue}</span>
          <h3>৳ {totalRevenue.toFixed(2)}</h3>
          <span className="report-kpi-sub">{t.reports.grossRevenueSub}</span>
        </div>

        <div className="glass-card report-kpi">
          <span className="report-kpi-lbl">{t.reports.wholesaleCost}</span>
          <h3>৳ {totalCost.toFixed(2)}</h3>
          <span className="report-kpi-sub">{t.reports.wholesaleCostSub}</span>
        </div>

        <div className="glass-card report-kpi profit-kpi">
          <span className="report-kpi-lbl">{t.reports.profit}</span>
          <h3>৳ {totalProfit.toFixed(2)}</h3>
          <span className="report-kpi-sub">{t.reports.profitSub.replace('{value}', ((totalProfit / (totalRevenue || 1)) * 100).toFixed(1))}</span>
        </div>

        <div className="glass-card report-kpi">
          <span className="report-kpi-lbl">{t.reports.averageTicket}</span>
          <h3>৳ {averageTxValue.toFixed(2)}</h3>
          <span className="report-kpi-sub">{t.reports.averageTicketSub.replace('{count}', transactions.length)}</span>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="glass-card reports-toolbar">
        <div className="reports-toolbar-grid">
          <div className="form-group no-margin">
            <label className="form-label">{t.reports.searchLabel}</label>
            <input
              type="text"
              className="form-control"
              placeholder={t.reports.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-group no-margin">
            <label className="form-label">{t.reports.filterLabel}</label>
            <select
              className="form-control"
              value={salespersonFilter}
              onChange={(e) => setSalespersonFilter(e.target.value)}
            >
              <option value="All">{t.reports.allCashiers}</option>
              <option value="Admin">{t.reports.adminFilter}</option>
              <option value="Assistant">{t.reports.assistantFilter}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Log Table */}
      <div className="table-wrapper">
        <div className="table-container">
          <table className="custom-table reports-table">
            <thead>
              <tr>
                <th>{t.reports.tableInvoice}</th>
                <th>{t.reports.tableDate}</th>
                <th>{t.reports.tableItems}</th>
                <th>{t.reports.tableCashier}</th>
                <th>{t.reports.tableSubtotal}</th>
                <th>{t.reports.tableDiscount}</th>
                <th>{t.reports.tableTax}</th>
                <th>{t.reports.tableTotal}</th>
                <th>{t.reports.tableAction}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(tx => (
                <tr key={tx.id}>
                  <td><code className="tx-id-badge">{tx.id}</code></td>
                  <td>{formatDate(tx.timestamp)}</td>
                  <td>
                    <div className="tx-items-cell" title={tx.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}>
                      {tx.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                    </div>
                  </td>
                  <td>
                    <span className={`staff-role-badge ${tx.salesperson.toLowerCase().includes('admin') ? 'role-admin' : 'role-staff'}`}>
                      {tx.salesperson}
                    </span>
                  </td>
                  <td>৳ {tx.subtotal.toFixed(2)}</td>
                  <td className="text-danger">-৳ {tx.discount.toFixed(2)}</td>
                  <td>৳ {tx.tax.toFixed(2)}</td>
                  <td className="grand-total-td">৳ {tx.total.toFixed(2)}</td>
                  <td>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedTx(tx)}
                      title="View & Reprint Receipt"
                    >
                      👁️ {t.reports.receipt}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="9" className="empty-table-cell">
                    {t.reports.empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Re-print receipt popup modal */}
      {selectedTx && (
        <ReceiptModal 
          transaction={selectedTx} 
          onClose={() => setSelectedTx(null)}
          t={t}
        />
      )}
    </div>
  );
}
