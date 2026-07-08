import React, { useState } from 'react';
import ReceiptModal from './ReceiptModal';
import './Reports.css';

export default function Reports({ transactions, currentRole }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [salespersonFilter, setSalespersonFilter] = useState('All');
  const [selectedTx, setSelectedTx] = useState(null);

  // Security Gatekeeper Backup
  if (currentRole !== 'Admin') {
    return (
      <div className="page-container fade-in">
        <div className="glass-card access-denied-card">
          <span className="denied-icon">🔒</span>
          <h2>Access Denied</h2>
          <p>You do not have administrative permissions to view sales logs and financial reporting. Please log in as Shabab (Admin) to view this module.</p>
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
        <h2>Sales Analysis &amp; Logs</h2>
        <p className="subtitle">Track revenues, analyze margin metrics, and review historical registers.</p>
      </div>

      {/* Financial Summary Cards */}
      <div className="reports-stats-grid">
        <div className="glass-card report-kpi">
          <span className="report-kpi-lbl">Gross Revenue</span>
          <h3>৳ {totalRevenue.toFixed(2)}</h3>
          <span className="report-kpi-sub">Total sales transacted</span>
        </div>

        <div className="glass-card report-kpi">
          <span className="report-kpi-lbl">Total Wholesale Cost</span>
          <h3>৳ {totalCost.toFixed(2)}</h3>
          <span className="report-kpi-sub">Total inventory cost value</span>
        </div>

        <div className="glass-card report-kpi profit-kpi">
          <span className="report-kpi-lbl">Net Gross Profit</span>
          <h3>৳ {totalProfit.toFixed(2)}</h3>
          <span className="report-kpi-sub">Profit margin: {((totalProfit / (totalRevenue || 1)) * 100).toFixed(1)}%</span>
        </div>

        <div className="glass-card report-kpi">
          <span className="report-kpi-lbl">Average Ticket (ATV)</span>
          <h3>৳ {averageTxValue.toFixed(2)}</h3>
          <span className="report-kpi-sub">Based on {transactions.length} receipts</span>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="glass-card reports-toolbar">
        <div className="reports-toolbar-grid">
          <div className="form-group no-margin">
            <label className="form-label">Search Transaction</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by Invoice ID or drug name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-group no-margin">
            <label className="form-label">Cashier Filter</label>
            <select
              className="form-control"
              value={salespersonFilter}
              onChange={(e) => setSalespersonFilter(e.target.value)}
            >
              <option value="All">All Cashiers</option>
              <option value="Admin">🛡️ Shabab (Admin)</option>
              <option value="Assistant">🧑‍⚕️ Assistant (Staff)</option>
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
                <th>Invoice ID</th>
                <th>Date &amp; Time</th>
                <th>Items Purchased</th>
                <th>Cashier</th>
                <th>Subtotal</th>
                <th>Discount</th>
                <th>VAT (5%)</th>
                <th>Grand Total</th>
                <th>Action</th>
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
                      👁️ Receipt
                    </button>
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="9" className="empty-table-cell">
                    No transactions matched your search criteria.
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
        />
      )}
    </div>
  );
}
