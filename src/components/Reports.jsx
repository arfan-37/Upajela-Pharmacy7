import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './Reports.css';
import FinanceAuth from './FinanceAuth';
import {
  loadReports,
  generateDailyReport,
  ensureTodayReportExists,
  filterReports,
  getAggregatedMetrics,
  todayStr
} from '../utils/financialReports';
import { initialFinancialReports } from '../utils/mockData';

export default function Reports({ transactions, medicines, customers, companies, currentRole, t, onNavigateAway }) {
  const [reports, setReports] = useState(() => loadReports(initialFinancialReports));
  const [filterType, setFilterType] = useState('last7');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isFinanceUnlocked, setIsFinanceUnlocked] = useState(false);

  const lockFinance = useCallback(() => {
    setIsFinanceUnlocked(false);
  }, []);

  const unlockFinance = useCallback(() => {
    setIsFinanceUnlocked(true);
  }, []);

  // Register lock function with parent so navigation can trigger it
  React.useEffect(() => {
    if (onNavigateAway) {
      onNavigateAway(lockFinance);
    }
  }, [onNavigateAway, lockFinance]);

  // Lock on refresh/close, tab switch, back/forward
  React.useEffect(() => {
    if (!isFinanceUnlocked) return;

    const handleBeforeUnload = () => {
      lockFinance();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        lockFinance();
      }
    };

    const handlePopState = () => {
      lockFinance();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isFinanceUnlocked, lockFinance]);

  useEffect(() => {
    if (!isFinanceUnlocked) return;
    ensureTodayReportExists(transactions, medicines, customers, companies, initialFinancialReports);
    setReports(loadReports(initialFinancialReports));
  }, [isFinanceUnlocked, transactions, medicines, customers, companies]);

  useEffect(() => {
    if (!isFinanceUnlocked) return;
    const interval = setInterval(() => {
    setReports(loadReports(initialFinancialReports));
    }, 60000);
    return () => clearInterval(interval);
  }, [isFinanceUnlocked]);

  const filteredReports = useMemo(() => {
    return filterReports(reports, filterType, customFrom, customTo);
  }, [reports, filterType, customFrom, customTo]);

  const aggregated = useMemo(() => {
    return getAggregatedMetrics(filteredReports);
  }, [filteredReports]);

  if (!isFinanceUnlocked) {
    return (
      <div className="page-container fade-in">
        <FinanceAuth onVerified={unlockFinance} onLocked={lockFinance} t={t} />
      </div>
    );
  }

  const handleGenerateToday = () => {
    const report = generateDailyReport(todayStr(), transactions, medicines, customers, companies);
    setReports(loadReports(initialFinancialReports));
    setSelectedReport(report);
  };

  const handleExportCSV = (report) => {
    const rows = [
      ['Metric', 'Value'],
      ['Report Date', report.reportDate],
      ['Total Sales Amount', report.totalSalesAmount],
      ['Total Purchase Cost', report.totalPurchaseCost],
      ['Gross Profit', report.grossProfit],
      ['Net Profit', report.netProfit],
      ['Total Cash Received', report.totalCashReceived],
      ['Total Due Collected', report.totalDueCollected],
      ['Total Customer Due Created', report.totalCustomerDueCreated],
      ['Total Paid to Companies', report.totalAmountPaidToCompanies],
      ['Total Company Payable', report.totalCompanyPayable],
      ['Total Transactions', report.totalTransactions],
      ['Created At', report.createdAt],
      ['Last Updated', report.lastUpdatedAt]
    ];

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${report.reportDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = (report) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Financial Report - ${report.reportDate}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #000; }
          h1 { font-size: 24px; margin-bottom: 8px; }
          .meta { color: #666; margin-bottom: 24px; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 14px; }
          th { background: #f5f5f5; font-weight: 600; }
          .amount { text-align: right; font-family: monospace; }
          .section-title { font-size: 18px; font-weight: bold; margin: 24px 0 12px; border-bottom: 2px solid #000; padding-bottom: 6px; }
        </style>
      </head>
      <body>
        <h1>Daily Financial Report</h1>
        <div class="meta">
          Report Date: ${report.reportDate} | Created: ${new Date(report.createdAt).toLocaleString()} | Last Updated: ${new Date(report.lastUpdatedAt).toLocaleString()}
        </div>

        <div class="section-title">Summary</div>
        <table>
          <tr><th>Metric</th><th class="amount">Amount (৳)</th></tr>
          <tr><td>Total Sales Amount</td><td class="amount">${report.totalSalesAmount.toFixed(2)}</td></tr>
          <tr><td>Total Purchase Cost</td><td class="amount">${report.totalPurchaseCost.toFixed(2)}</td></tr>
          <tr><td>Gross Profit</td><td class="amount">${report.grossProfit.toFixed(2)}</td></tr>
          <tr><td>Net Profit</td><td class="amount">${report.netProfit.toFixed(2)}</td></tr>
          <tr><td>Total Cash Received</td><td class="amount">${report.totalCashReceived.toFixed(2)}</td></tr>
          <tr><td>Total Due Collected</td><td class="amount">${report.totalDueCollected.toFixed(2)}</td></tr>
          <tr><td>Total Customer Due Created</td><td class="amount">${report.totalCustomerDueCreated.toFixed(2)}</td></tr>
          <tr><td>Total Paid to Companies</td><td class="amount">${report.totalAmountPaidToCompanies.toFixed(2)}</td></tr>
          <tr><td>Total Company Payable</td><td class="amount">${report.totalCompanyPayable.toFixed(2)}</td></tr>
          <tr><td>Total Transactions</td><td class="amount">${report.totalTransactions}</td></tr>
        </table>

        ${report.salesTransactions && report.salesTransactions.length > 0 ? `
        <div class="section-title">Sales Transactions</div>
        <table>
          <tr><th>Invoice</th><th>Date</th><th>Cashier</th><th>Total</th><th>Cash Received</th></tr>
          ${report.salesTransactions.map(tx => `
            <tr>
              <td>${tx.id}</td>
              <td>${new Date(tx.timestamp).toLocaleString()}</td>
              <td>${tx.salesperson}</td>
              <td class="amount">৳${tx.total.toFixed(2)}</td>
              <td class="amount">৳${tx.cashReceived.toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
        ` : ''}

        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

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

  return (
    <div className="page-container fade-in">
      {/* Page Header */}
      <div className="reports-header">
        <div>
          <h2>{t.financialReports.title}</h2>
          <p className="subtitle">{t.financialReports.subtitle}</p>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="reports-stats-grid">
        <div className="glass-card report-kpi">
          <span className="report-kpi-lbl">{t.financialReports.todaySales}</span>
          <h3>৳ {aggregated.totalSalesAmount.toFixed(2)}</h3>
          <span className="report-kpi-sub">{t.financialReports.todaySalesSub}</span>
        </div>
        <div className="glass-card report-kpi">
          <span className="report-kpi-lbl">{t.financialReports.companyPayments}</span>
          <h3>৳ {aggregated.totalAmountPaidToCompanies.toFixed(2)}</h3>
          <span className="report-kpi-sub">{t.financialReports.companyPaymentsSub}</span>
        </div>
        <div className="glass-card report-kpi">
          <span className="report-kpi-lbl">{t.financialReports.customerCollections}</span>
          <h3>৳ {aggregated.totalDueCollected.toFixed(2)}</h3>
          <span className="report-kpi-sub">{t.financialReports.customerCollectionsSub}</span>
        </div>
        <div className="glass-card report-kpi profit-kpi">
          <span className="report-kpi-lbl">{t.financialReports.profit}</span>
          <h3>৳ {aggregated.grossProfit.toFixed(2)}</h3>
          <span className="report-kpi-sub">{t.financialReports.profitSub.replace('{value}', (aggregated.totalSalesAmount > 0 ? ((aggregated.grossProfit / aggregated.totalSalesAmount) * 100).toFixed(1) : '0.0'))}</span>
        </div>
        <div className="glass-card report-kpi">
          <span className="report-kpi-lbl">{t.financialReports.expenses}</span>
          <h3>৳ {aggregated.totalPurchaseCost.toFixed(2)}</h3>
          <span className="report-kpi-sub">{t.financialReports.expensesSub}</span>
        </div>
        <div className="glass-card report-kpi">
          <span className="report-kpi-lbl">{t.financialReports.netProfit}</span>
          <h3>৳ {aggregated.netProfit.toFixed(2)}</h3>
          <span className="report-kpi-sub">{t.financialReports.netProfitSub}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-card reports-toolbar">
        <div className="reports-toolbar-grid">
          <div className="form-group no-margin">
            <label className="form-label">{t.financialReports.dateRangeLabel}</label>
            <select
              className="form-control"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="today">{t.financialReports.today}</option>
              <option value="yesterday">{t.financialReports.yesterday}</option>
              <option value="last7">{t.financialReports.last7Days}</option>
              <option value="last30">{t.financialReports.last30Days}</option>
              <option value="thisMonth">{t.financialReports.thisMonth}</option>
              <option value="lastMonth">{t.financialReports.lastMonth}</option>
              <option value="thisYear">{t.financialReports.thisYear}</option>
              <option value="lastYear">{t.financialReports.lastYear}</option>
              <option value="custom">{t.financialReports.customRange}</option>
            </select>
          </div>

          {filterType === 'custom' && (
            <>
              <div className="form-group no-margin">
                <label className="form-label">{t.financialReports.fromDate}</label>
                <input
                  type="date"
                  className="form-control"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                />
              </div>
              <div className="form-group no-margin">
                <label className="form-label">{t.financialReports.toDate}</label>
                <input
                  type="date"
                  className="form-control"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-group no-margin" style={{ alignSelf: 'flex-end' }}>
            <button className="btn btn-primary" onClick={handleGenerateToday}>
              {t.financialReports.generateTodayReport}
            </button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="table-wrapper">
        <div className="table-container">
          <table className="custom-table reports-table">
            <thead>
              <tr>
                <th>{t.financialReports.reportDate}</th>
                <th>{t.financialReports.createdAt}</th>
                <th>{t.financialReports.lastUpdated}</th>
                <th>{t.financialReports.sales}</th>
                <th>{t.financialReports.purchaseCost}</th>
                <th>{t.financialReports.grossProfit}</th>
                <th>{t.financialReports.netProfit}</th>
                <th>{t.financialReports.cashReceived}</th>
                <th>{t.financialReports.dueCollected}</th>
                <th>{t.financialReports.companyPaid}</th>
                <th>{t.financialReports.companyPayable}</th>
                <th>{t.financialReports.transactions}</th>
                <th>{t.financialReports.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan="13" className="empty-table-cell">
                    {t.financialReports.noReports}
                  </td>
                </tr>
              )}
              {filteredReports.map(r => (
                <tr key={r.id || r.reportDate}>
                  <td><strong>{r.reportDate}</strong></td>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td>{new Date(r.lastUpdatedAt).toLocaleString()}</td>
                  <td>৳ {Number(r.totalSalesAmount || 0).toFixed(2)}</td>
                  <td>৳ {Number(r.totalPurchaseCost || 0).toFixed(2)}</td>
                  <td className="text-success">৳ {Number(r.grossProfit || 0).toFixed(2)}</td>
                  <td className="text-success">৳ {Number(r.netProfit || 0).toFixed(2)}</td>
                  <td>৳ {Number(r.totalCashReceived || 0).toFixed(2)}</td>
                  <td>৳ {Number(r.totalDueCollected || 0).toFixed(2)}</td>
                  <td>৳ {Number(r.totalAmountPaidToCompanies || 0).toFixed(2)}</td>
                  <td>৳ {Number(r.totalCompanyPayable || 0).toFixed(2)}</td>
                  <td>{r.totalTransactions || 0}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedReport(r)} title="View">
                        👁️
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleExportCSV(r)} title="Export CSV">
                        📥
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handlePrint(r)} title="Print">
                        🖨️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-container" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t.financialReports.reportDetails} - {selectedReport.reportDate}</h3>
              <button className="modal-close-btn" onClick={() => setSelectedReport(null)}>×</button>
            </div>

            <div className="report-detail-grid">
              <div className="glass-card">
                <h4>{t.financialReports.summary}</h4>
                <div className="report-detail-rows">
                  <div className="report-detail-row"><span>{t.financialReports.totalSalesAmount}:</span><strong>৳ {selectedReport.totalSalesAmount.toFixed(2)}</strong></div>
                  <div className="report-detail-row"><span>{t.financialReports.totalPurchaseCost}:</span><strong>৳ {selectedReport.totalPurchaseCost.toFixed(2)}</strong></div>
                  <div className="report-detail-row"><span>{t.financialReports.grossProfit}:</span><strong style={{ color: 'var(--success)' }}>৳ {selectedReport.grossProfit.toFixed(2)}</strong></div>
                  <div className="report-detail-row"><span>{t.financialReports.netProfit}:</span><strong style={{ color: 'var(--success)' }}>৳ {selectedReport.netProfit.toFixed(2)}</strong></div>
                </div>
              </div>

              <div className="glass-card">
                <h4>{t.financialReports.flows}</h4>
                <div className="report-detail-rows">
                  <div className="report-detail-row"><span>{t.financialReports.totalCashReceived}:</span><strong>৳ {selectedReport.totalCashReceived.toFixed(2)}</strong></div>
                  <div className="report-detail-row"><span>{t.financialReports.totalDueCollected}:</span><strong>৳ {selectedReport.totalDueCollected.toFixed(2)}</strong></div>
                  <div className="report-detail-row"><span>{t.financialReports.totalCustomerDueCreated}:</span><strong>৳ {selectedReport.totalCustomerDueCreated.toFixed(2)}</strong></div>
                  <div className="report-detail-row"><span>{t.financialReports.totalAmountPaidToCompanies}:</span><strong>৳ {selectedReport.totalAmountPaidToCompanies.toFixed(2)}</strong></div>
                  <div className="report-detail-row"><span>{t.financialReports.totalCompanyPayable}:</span><strong>৳ {selectedReport.totalCompanyPayable.toFixed(2)}</strong></div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => handleExportCSV(selectedReport)}>{t.financialReports.exportCSV}</button>
              <button className="btn btn-secondary" onClick={() => handlePrint(selectedReport)}>{t.financialReports.print}</button>
              <button className="btn btn-primary" onClick={() => setSelectedReport(null)}>{t.common.close}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
