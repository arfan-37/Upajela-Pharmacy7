import React, { useMemo, useState } from 'react';
import './CustomerPanel.css';
import { rebuildCustomerHistoryTimeline } from '../utils/customerHistory';

export default function CustomerPanel({ customers, shopBalance, onAddCustomer, onUpdateCustomer, onDeleteCustomer, onReceivePayment, currentRole, t }) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // 'All' | '15' | '30'

  // Customer Add/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingId, setEditingId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formInitialDue, setFormInitialDue] = useState('0');

  // Receive Payment Modal State
  const [paymentCustomerId, setPaymentCustomerId] = useState(null);
  const [paymentValue, setPaymentValue] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  // Expanded history row
  const [historyId, setHistoryId] = useState(null);

  const formatDateTime = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const formatAmount = (value) => `৳ ${Number(value || 0).toFixed(2)}`;

  const getTransactionTimestamp = (entry) => entry.createdAt || entry.purchaseDate || entry.paymentDate || '';

  const getSaleProductsLabel = (entry) => {
    const products = Array.isArray(entry.products) ? entry.products : [];
    if (products.length === 0) return '—';

    return products
      .map((product) => `${product.name} x${product.quantity}`)
      .join(', ');
  };

  const getPaymentStatus = (customer) => {
    const totalPurchaseAmount = Number(customer.totalPurchaseAmount || 0);
    const cashPaid = Number(customer.cashPaid || 0);
    const dueAmount = Number(customer.dueAmount ?? customer.totalDue ?? 0);

    if (dueAmount <= 0) return 'Paid';
    if (!totalPurchaseAmount) return 'Full Due';
    if (cashPaid > 0) return 'Partial Due';
    return 'Full Due';
  };

  // Classify a customer by how long their due has been outstanding:
  // '30' => 30+ days, '15' => 15-29 days, 'none' => paid / no due.
  const getDueBucket = (customer) => {
    const dueAmount = Number(customer.dueAmount ?? customer.totalDue ?? 0);
    if (dueAmount <= 0) return 'none';

    const saleDates = (customer.paymentHistory || [])
      .filter((entry) => entry.type === 'sale' && entry.purchaseDate)
      .map((entry) => new Date(entry.purchaseDate).getTime())
      .filter((d) => !Number.isNaN(d));

    if (saleDates.length === 0) {
      const createdAt = customer.createdAt ? new Date(customer.createdAt).getTime() : NaN;
      if (Number.isNaN(createdAt)) return '15';

      const daysOld = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
      if (daysOld >= 30) return '30';
      if (daysOld >= 15) return '15';
      return 'none';
    }
    const oldest = Math.min(...saleDates);
    const daysOld = (Date.now() - oldest) / (1000 * 60 * 60 * 24);
    if (daysOld >= 30) return '30';
    if (daysOld >= 15) return '15';
    return 'none';
  };

  const getLatestPurchaseDate = (customer) => {
    const saleEntries = (customer.dueEntries || []).filter(entry => entry.createdAt && entry.totalAmount != null);
    const historyEntries = (customer.paymentHistory || []).filter(entry => entry.type === 'sale' && entry.purchaseDate);
    const candidates = [...saleEntries, ...historyEntries].map(entry => new Date(entry.purchaseDate || entry.createdAt));
    if (candidates.length === 0) return '—';

    const latestDate = candidates
      .filter(date => !Number.isNaN(date.getTime()))
      .sort((a, b) => b.getTime() - a.getTime())[0];

    return latestDate ? latestDate.toLocaleDateString() : '—';
  };

  const getHistoryEntries = (customer) => {
    return rebuildCustomerHistoryTimeline(customer.paymentHistory || [])
      .sort((a, b) => new Date(getTransactionTimestamp(b)).getTime() - new Date(getTransactionTimestamp(a)).getTime());
  };

  // Filtering Logic
  const filteredCustomers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return customers.filter((customer) => {
      const matchesSearch =
        customer.name?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query) ||
        customer.address?.toLowerCase().includes(query);

      const bucket = getDueBucket(customer);
      let matchesTab = true;
      if (activeTab === '15') matchesTab = bucket === '15';
      else if (activeTab === '30') matchesTab = bucket === '30';

      return matchesSearch && matchesTab;
    });
  }, [customers, searchTerm, activeTab]);

  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      const aDue = Number(a.dueAmount ?? a.totalDue ?? 0);
      const bDue = Number(b.dueAmount ?? b.totalDue ?? 0);
      if ((aDue > 0 ? 1 : 0) !== (bDue > 0 ? 1 : 0)) return bDue > 0 ? 1 : -1;
      return bDue - aDue;
    });
  }, [filteredCustomers]);

  const openAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setFormName('');
    setFormPhone('');
    setFormAddress('');
    setFormInitialDue('0');
    setIsModalOpen(true);
  };

  const openEditModal = (customer) => {
    setModalMode('edit');
    setEditingId(customer.id);
    setFormName(customer.name);
    setFormPhone(customer.phone);
    setFormAddress(customer.address);
    setFormInitialDue(String(customer.dueAmount ?? customer.totalDue ?? 0));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!formName.trim() || !formPhone.trim() || !formAddress.trim()) {
      return;
    }

    if (modalMode === 'add') {
      const duplicate = customers.some(c => c.phone === formPhone.trim());
      if (duplicate) return;

      const initialDue = Math.max(0, Number(formInitialDue || 0));
      const newCustomer = {
        id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
        name: formName.trim(),
        phone: formPhone.trim(),
        address: formAddress.trim(),
        totalPurchaseAmount: 0,
        cashPaid: 0,
        dueAmount: initialDue,
        totalDue: initialDue,
        dueEntries: []
      };
      onAddCustomer(newCustomer);
    } else {
      const duplicate = customers.some(c => c.phone === formPhone.trim() && c.id !== editingId);
      if (duplicate) return;

      const existingCustomer = customers.find(c => c.id === editingId);
      const updatedCustomer = {
        ...existingCustomer,
        name: formName.trim(),
        phone: formPhone.trim(),
        address: formAddress.trim(),
        dueAmount: Math.max(0, Number(formInitialDue || 0)),
        totalDue: Math.max(0, Number(formInitialDue || 0))
      };
      onUpdateCustomer(updatedCustomer);
    }

    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      onDeleteCustomer(id);
    }
  };

  const openPayment = (customer) => {
    setPaymentCustomerId(customer.id);
    setPaymentValue('');
    setPaymentDate(new Date().toISOString().slice(0, 10));
  };

  const closePayment = () => {
    setPaymentCustomerId(null);
    setPaymentValue('');
    setPaymentDate('');
  };

  const submitPayment = () => {
    const amount = Number(paymentValue);
    if (!amount || amount <= 0) return;
    onReceivePayment(paymentCustomerId, amount, paymentDate || new Date().toISOString());
    closePayment();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid': return <span className="badge badge-success">{t.customer.paymentStatusPaid}</span>;
      case 'Partial Due': return <span className="badge badge-warning">{t.customer.paymentStatusPartial}</span>;
      case 'Full Due': return <span className="badge badge-danger">{t.customer.paymentStatusFull}</span>;
      default: return <span className="badge badge-info">{t.customer.paymentStatusNoPurchase}</span>;
    }
  };

  return (
    <div className="page-container fade-in">

      {/* Page Header */}
      <div className="inventory-header">
        <div>
          <h2>{t.customer.registerTitle}</h2>
          <p className="subtitle">{t.customer.registerDesc}</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          {t.customer.addButton}
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="glass-card toolbar-card">
        <div className="toolbar-tabs-row">
          <div className="customer-tabs">
            <button
              className={`tab-btn ${activeTab === 'All' ? 'active' : ''}`}
              onClick={() => setActiveTab('All')}
            >
              {t.customer.tabAll}
            </button>
            <button
              className={`tab-btn tab-yellow ${activeTab === '15' ? 'active' : ''}`}
              onClick={() => setActiveTab('15')}
            >
              {t.customer.tab15}
            </button>
            <button
              className={`tab-btn tab-red ${activeTab === '30' ? 'active' : ''}`}
              onClick={() => setActiveTab('30')}
            >
              {t.customer.tab30}
            </button>
          </div>

          <div className="form-group no-margin customer-search-inline">
            <input
              type="text"
              className="form-control"
              placeholder={t.customer.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-group no-margin customer-balance-box">
            <label className="form-label">{t.customer.shopBalance}</label>
            <p className="customer-balance-value">৳{Number(shopBalance || 0).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="table-wrapper">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>{t.customer.tableId}</th>
                <th>{t.customer.tableName}</th>
                <th>{t.customer.tablePhone}</th>
                <th>{t.customer.tableAddress}</th>
                <th>{t.customer.tableCash}</th>
                <th>{t.customer.tableDue}</th>
                <th>{t.customer.tableStatus}</th>
                <th>{t.customer.tableActions}</th>
              </tr>
            </thead>
            <tbody>
              {sortedCustomers.map((customer) => {
                const status = getPaymentStatus(customer);
                const bucket = getDueBucket(customer);
                const rowClass = bucket === '30' ? 'row-danger' : bucket === '15' ? 'row-warning' : '';
                return (
                  <React.Fragment key={customer.id}>
                    <tr className={rowClass}>
                      <td><code className="item-id">{customer.id}</code></td>
                      <td>
                        <div className="med-title-cell">
                          <strong className={bucket === '30' ? 'text-danger strong' : bucket === '15' ? 'text-warning strong' : ''}>{customer.name}</strong>
                          {status === 'Full Due' && <span className="cell-badge badge-danger">{t.customer.paymentStatusFull}</span>}
                          {status === 'Partial Due' && <span className="cell-badge badge-warning">{t.customer.paymentStatusPartial}</span>}
                        </div>
                      </td>
                      <td><a href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{customer.phone}</a></td>
                      <td className="generic-cell">{customer.address}</td>
                      <td>৳ {Number(customer.cashPaid || 0).toFixed(2)}</td>
                      <td>
                        <span className={Number(customer.dueAmount ?? customer.totalDue ?? 0) > 0 ? 'text-danger strong' : ''}>
                          ৳ {Number(customer.dueAmount ?? customer.totalDue ?? 0).toFixed(2)}
                        </span>
                      </td>
                      <td>{getStatusBadge(status)}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-secondary btn-sm" onClick={() => openPayment(customer)} title={t.customer.receivePayment}>💰</button>
                          <button className="btn btn-secondary btn-sm edit-btn" onClick={() => openEditModal(customer)} title={t.customer.edit}>✏️</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setHistoryId(historyId === customer.id ? null : customer.id)} title={historyId === customer.id ? t.customer.hideHistory : t.customer.viewHistory}>
                            📜
                          </button>
                          <button className="btn btn-secondary btn-sm delete-btn" onClick={() => handleDelete(customer.id)} title={t.customer.delete}>🗑️</button>
                        </div>
                      </td>
                    </tr>

                    {historyId === customer.id && (
                      <tr className="history-row">
                        <td colSpan={8}>
                          <div className="history-box">
                            <h5>{t.customer.historyTitle}</h5>
                            <div className="history-list">
                              {getHistoryEntries(customer)
                                .map((entry) => (
                                  <div key={entry.id} className={`history-item history-${entry.type}`}>
                                    <div className="history-main">
                                      <span className="history-badge purchase">{entry.type === 'sale' ? t.customer.typeSale : t.customer.typePayment}</span>
                                      <span className="history-date">{formatDateTime(getTransactionTimestamp(entry))}</span>
                                      <span className="history-detail">
                                        {entry.invoiceNumber ? `${t.customer.invoice}: ${entry.invoiceNumber} · ` : ''}
                                        {entry.type === 'sale' ? (
                                          <>
                                            {t.customer.saleProducts}: {getSaleProductsLabel(entry)} · {t.customer.totalPurchase} {formatAmount(entry.totalPurchaseAmount)} · {t.customer.cashPaid} {formatAmount(entry.cashPaid)} · {t.customer.dueCreated} {formatAmount(entry.dueCreated)} · {t.customer.totalOutstandingDue} {formatAmount(entry.totalOutstandingDue)}
                                          </>
                                        ) : (
                                          <>
                                            {t.customer.paymentAmount} {formatAmount(entry.paymentAmount)} · {t.customer.previousDue} {formatAmount(entry.previousDue)} · {t.customer.remainingDueAfterPayment} {formatAmount(entry.remainingDue)}
                                          </>
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                            {(!customer.paymentHistory || customer.paymentHistory.length === 0) && (
                              <p className="empty-history">{t.customer.noHistory}</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {sortedCustomers.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty-table-cell">
                    {t.customer.empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-container">
            <div className="modal-header">
              <h3>{modalMode === 'add' ? t.customer.modalAddTitle : t.customer.modalEditTitle}</h3>
              <button className="modal-close-btn" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="modal-form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="cName">{t.customer.nameLabel} *</label>
                  <input
                    type="text"
                    id="cName"
                    required
                    placeholder={t.customer.namePlaceholder}
                    className="form-control"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="cPhone">{t.customer.phoneLabel} *</label>
                  <input
                    type="text"
                    id="cPhone"
                    required
                    placeholder={t.customer.phonePlaceholder}
                    className="form-control"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cAddress">{t.customer.addressLabel} *</label>
                <textarea
                  id="cAddress"
                  required
                  placeholder={t.customer.addressPlaceholder}
                  className="form-control customer-textarea"
                  rows="2"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cDue">{t.customer.initialDueLabel}</label>
                <input
                  type="number"
                  id="cDue"
                  min="0"
                  step="any"
                  className="form-control"
                  placeholder="0"
                  value={formInitialDue}
                  onChange={(e) => setFormInitialDue(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  {t.customer.paymentCancel}
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'add' ? t.customer.saveCustomer : t.customer.saveCustomerTitle}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Payment Modal */}
      {paymentCustomerId && (
        <div className="modal-overlay">
          <div className="glass-card modal-container">
            <div className="modal-header">
              <h3>{t.customer.receivePayment}</h3>
              <button className="modal-close-btn" onClick={closePayment}>×</button>
            </div>

            <form className="modal-form" onSubmit={(e) => { e.preventDefault(); submitPayment(); }}>
              <div className="form-group">
                <label className="form-label">{t.customer.paymentAmount}</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="form-control"
                  placeholder="0"
                  value={paymentValue}
                  onChange={(e) => setPaymentValue(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.customer.paymentDate}</label>
                <input
                  type="date"
                  className="form-control"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closePayment}>
                  {t.customer.paymentCancel}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t.customer.paymentSave}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
