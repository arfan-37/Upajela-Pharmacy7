import React, { useState, useEffect, useMemo } from 'react';
import './History.css';
import { loadInventoryHistory, loadCompanyHistory, syncHistoryWithPanelData } from '../utils/historyUtils';

export default function History({ medicines = [], companies = [], currentRole, language, t }) {
  const [tab, setTab] = useState('inventory');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [sortNewest, setSortNewest] = useState(true);

  const [inventoryRecords, setInventoryRecords] = useState(() => loadInventoryHistory());
  const [companyRecords, setCompanyRecords] = useState(() => loadCompanyHistory());

  useEffect(() => {
    const existingInventory = loadInventoryHistory();
    const existingCompany = loadCompanyHistory();
    if (existingInventory.length === 0 && existingCompany.length === 0) {
      const { inventoryRecords: inv, companyRecords: comp } = syncHistoryWithPanelData(medicines, companies, currentRole || 'Staff');
      setInventoryRecords(inv);
      setCompanyRecords(comp);
    }
  }, [medicines, companies, currentRole]);

  useEffect(() => {
    const interval = setInterval(() => {
      setInventoryRecords(loadInventoryHistory());
      setCompanyRecords(loadCompanyHistory());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const getDateRange = (filter) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let from = null;
    let to = new Date(today);
    to.setHours(23, 59, 59, 999);

    switch (filter) {
      case 'today':
        from = new Date(today);
        break;
      case 'last7':
        from = new Date(today.getTime() - 6 * 86400000);
        break;
      case 'last30':
        from = new Date(today.getTime() - 29 * 86400000);
        break;
      case 'thisMonth':
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        to = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'custom':
        from = customFrom ? new Date(customFrom) : null;
        to = customTo ? new Date(customTo) : null;
        break;
      default:
        from = null;
        to = null;
    }

    return {
      from: from ? from.toISOString() : null,
      to: to ? to.toISOString() : null,
    };
  };

  const matchesDateRange = (createdAt, range) => {
    if (!range.from && !range.to) return true;
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return false;
    if (range.from && date < new Date(range.from)) return false;
    if (range.to && date > new Date(range.to)) return false;
    return true;
  };

  const matchesSearch = (record, query) => {
    if (!query) return true;
    const q = query.toLowerCase();
    const fields = [
      record.medicineName,
      record.companyName,
      record.category,
      record.batchNo,
      record.addedBy,
      record.paymentStatus,
      record.action,
      record.shelfLocation,
    ].filter(Boolean).map((v) => String(v).toLowerCase());
    return fields.some((f) => f.includes(q));
  };

  const filteredInventory = useMemo(() => {
    const range = getDateRange(dateFilter);
    return inventoryRecords
      .filter((r) => matchesDateRange(r.createdAt, range) && matchesSearch(r, search))
      .sort((a, b) => {
        const da = new Date(a.createdAt).getTime();
        const db = new Date(b.createdAt).getTime();
        return sortNewest ? db - da : da - db;
      });
  }, [inventoryRecords, search, dateFilter, customFrom, customTo, sortNewest]);

  const filteredCompany = useMemo(() => {
    const range = getDateRange(dateFilter);
    return companyRecords
      .filter((r) => matchesDateRange(r.createdAt, range) && matchesSearch(r, search))
      .sort((a, b) => {
        const da = new Date(a.createdAt).getTime();
        const db = new Date(b.createdAt).getTime();
        return sortNewest ? db - da : da - db;
      });
  }, [companyRecords, search, dateFilter, customFrom, customTo, sortNewest]);

  const formatDateTime = (iso) => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  };

  const formatAmount = (value) => {
    const num = Number(value || 0);
    return `৳ ${num.toFixed(2)}`;
  };

  const renderInventoryTable = () => {
    if (filteredInventory.length === 0) {
      return (
        <div className="history-empty">
          <span>📭</span>
          <p>{t.history.noRecords}</p>
        </div>
      );
    }

    return (
      <div className="table-wrapper">
        <div className="table-container">
          <table className="custom-table history-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>{t.history.tableSl}</th>
                <th>{t.history.tableDateTime}</th>
                <th>{t.history.tableMedicine}</th>
                <th>{t.history.tableCategory}</th>
                <th>{t.history.tableBatch}</th>
                <th>{t.history.tableAction}</th>
                <th>{t.history.tablePreviousStock}</th>
                <th>{t.history.tableAddedQty}</th>
                <th>{t.history.tableNewTotal}</th>
                <th>{t.history.tablePurchaseCost}</th>
                <th>{t.history.tableSellingPrice}</th>
                <th>{t.history.tableTotal}</th>
                <th>{t.history.tableExpiry}</th>
                <th>{t.history.tableShelfLocation}</th>
                <th>{t.history.tableAddedBy}</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((r, idx) => (
                <tr key={r.id}>
                  <td><strong>{idx + 1}</strong></td>
                  <td>{formatDateTime(r.createdAt)}</td>
                  <td>{r.medicineName}</td>
                  <td>{r.category}</td>
                  <td>{r.batchNo}</td>
                  <td>
                    <span className={`badge ${r.action === 'Stock In' ? 'badge-success' : 'badge-warning'}`}>
                      {r.action || '-'}
                    </span>
                  </td>
                  <td>{r.previousStock ?? '-'}</td>
                  <td>{r.addedQuantity ?? '-'}</td>
                  <td>{r.newTotalStock ?? '-'}</td>
                  <td>{formatAmount(r.purchaseCost)}</td>
                  <td>{formatAmount(r.sellingPrice)}</td>
                  <td>{formatAmount(r.totalAmount)}</td>
                  <td>{r.expiryDate}</td>
                  <td>{r.shelfLocation || '-'}</td>
                  <td>
                    <span className={`badge ${r.addedBy === 'Admin' ? 'badge-success' : 'badge-info'}`}>
                      {r.addedBy === 'Admin' ? t.history.addedByAdmin : t.history.addedByStaff}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCompanyTable = () => {
    if (filteredCompany.length === 0) {
      return (
        <div className="history-empty">
          <span>📭</span>
          <p>{t.history.noRecords}</p>
        </div>
      );
    }

    return (
      <div className="table-wrapper">
        <div className="table-container">
          <table className="custom-table history-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>{t.history.tableSl}</th>
                <th>{t.history.tableDateTime}</th>
                <th>{t.history.tableCompany}</th>
                <th>{t.history.tableMedicine}</th>
                <th>{t.history.tableQty}</th>
                <th>{t.history.tableTotal}</th>
                <th>{t.history.tableAmountPaid}</th>
                <th>{t.history.tableRemaining}</th>
                <th>{t.history.tablePaymentStatus}</th>
                <th>{t.history.tableAddedBy}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompany.map((r, idx) => (
                <tr key={r.id}>
                  <td><strong>{idx + 1}</strong></td>
                  <td>{formatDateTime(r.createdAt)}</td>
                  <td>{r.companyName}</td>
                  <td>{r.medicineNames || r.medicineName}</td>
                  <td>{r.quantity}</td>
                  <td>{formatAmount(r.totalAmount)}</td>
                  <td>{formatAmount(r.amountPaid)}</td>
                  <td>{formatAmount(r.remainingPayable)}</td>
                  <td>
                    <span
                      className={`badge ${
                        r.paymentStatus === 'Paid'
                          ? 'badge-success'
                          : r.paymentStatus === 'Partial'
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}
                    >
                      {r.paymentStatus === 'Paid'
                        ? t.history.statusPaid
                        : r.paymentStatus === 'Partial'
                        ? t.history.statusPartial
                        : t.history.statusDue}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${r.addedBy === 'Admin' ? 'badge-success' : 'badge-info'}`}>
                      {r.addedBy === 'Admin' ? t.history.addedByAdmin : t.history.addedByStaff}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container fade-in">
      <div className="history-header">
        <div>
          <h2>{t.history.title}</h2>
          <p className="subtitle">{t.history.subtitle}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="history-tabs">
        <button
          className={`history-tab ${tab === 'inventory' ? 'active' : ''}`}
          onClick={() => setTab('inventory')}
        >
          📦 {t.history.inventoryHistory}
        </button>
        <button
          className={`history-tab ${tab === 'company' ? 'active' : ''}`}
          onClick={() => setTab('company')}
        >
          🏭 {t.history.companyHistory}
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card history-filters">
        <div className="history-filters-grid">
          <div className="form-group no-margin">
            <label className="form-label">{t.common.search}</label>
            <input
              type="text"
              className="form-control"
              placeholder={tab === 'inventory' ? t.history.searchPlaceholder : t.history.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="form-group no-margin">
            <label className="form-label">{t.history.dateFilterLabel}</label>
            <select
              className="form-control"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">{t.history.allDates}</option>
              <option value="today">{t.history.today}</option>
              <option value="last7">{t.history.last7Days}</option>
              <option value="last30">{t.history.last30Days}</option>
              <option value="thisMonth">{t.history.thisMonth}</option>
              <option value="lastMonth">{t.history.lastMonth}</option>
              <option value="custom">{t.history.customRange}</option>
            </select>
          </div>

          {dateFilter === 'custom' && (
            <>
              <div className="form-group no-margin">
                <label className="form-label">{t.history.fromDate}</label>
                <input
                  type="date"
                  className="form-control"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                />
              </div>
              <div className="form-group no-margin">
                <label className="form-label">{t.history.toDate}</label>
                <input
                  type="date"
                  className="form-control"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-group no-margin" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setSortNewest(!sortNewest)}
              style={{ marginBottom: '16px' }}
            >
              {sortNewest ? t.history.sortNewest : t.history.sortOldest}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="history-content">
        {tab === 'inventory' && renderInventoryTable()}
        {tab === 'company' && renderCompanyTable()}
      </div>
    </div>
  );
}
