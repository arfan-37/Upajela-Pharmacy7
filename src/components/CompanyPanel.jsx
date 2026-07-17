import React, { useMemo, useState } from 'react';
import './CompanyPanel.css';
import { rebuildCompanyTransactionTimeline } from '../utils/companyHistory';

const genId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export default function CompanyPanel({ companies, onAddCompany, onUpdateCompany, onDeleteCompany, onAddCompanyPurchase, onRecordCompanyPayment, onEditCompanyTransaction, t }) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Add Company Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    products: [{ name: '', quantity: '' }],
    totalPurchaseAmount: '',
    amountPaid: '0',
    purchaseDate: todayStr(),
    dueDate: ''
  });
  const [feedback, setFeedback] = useState('');

  // Edit Company Modal State
  const [editingCompanyId, setEditingCompanyId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', contact: '', address: '' });

  // Add Purchase inline state
  const [activePurchaseId, setActivePurchaseId] = useState(null);
  const [purchaseForm, setPurchaseForm] = useState({
    products: [{ name: '', quantity: '' }],
    totalPurchaseAmount: '',
    amountPaid: '0',
    purchaseDate: todayStr(),
    dueDate: ''
  });

  // Receive Payment Modal State
  const [paymentCompanyId, setPaymentCompanyId] = useState(null);
  const [paymentValue, setPaymentValue] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  // Edit transaction state
  const [editingTx, setEditingTx] = useState(null);
  const [txEditForm, setTxEditForm] = useState({
    products: [{ name: '', quantity: '' }],
    totalPurchaseAmount: '',
    amountPaid: '0',
    purchaseDate: todayStr()
  });

  // Expanded history row
  const [historyId, setHistoryId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateProductRow = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    }));
  };

  const addProductRow = () => {
    setFormData((prev) => ({ ...prev, products: [...prev.products, { name: '', quantity: '' }] }));
  };

  const removeProductRow = (index) => {
    setFormData((prev) => ({ ...prev, products: prev.products.filter((_, i) => i !== index) }));
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      contact: '',
      address: '',
      products: [{ name: '', quantity: '' }],
      totalPurchaseAmount: '',
      amountPaid: '0',
      purchaseDate: todayStr(),
      dueDate: ''
    });
    setFeedback('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const products = formData.products
      .filter((p) => p.name.trim() && Number(p.quantity) > 0)
      .map((p) => ({ name: p.name.trim(), quantity: Number(p.quantity) }));

    if (!formData.name.trim() || products.length === 0) {
      setFeedback(t.company.feedbackInvalid);
      return;
    }

    const total = Number(formData.totalPurchaseAmount || 0);
    const paid = Number(formData.amountPaid || 0);

    if (paid > total) {
      setFeedback(t.company.feedbackAmount);
      return;
    }

    const purchaseDate = formData.purchaseDate || todayStr();
    const purchaseTx = {
      id: genId('ctx'),
      type: 'purchase',
      createdAt: new Date().toISOString(),
      date: purchaseDate,
      products,
      totalAmount: total,
      amountPaid: paid,
      dueAmount: Number((total - paid).toFixed(2)),
      dueDate: formData.dueDate || null,
      paymentDate: paid >= total ? purchaseDate : null
    };

    const newCompany = {
      id: `COMP-${Math.floor(100 + Math.random() * 900)}`,
      name: formData.name.trim(),
      contact: formData.contact.trim(),
      address: formData.address.trim(),
      totalPurchaseAmount: total,
      amountPaid: paid,
      dueAmount: Number((total - paid).toFixed(2)),
      transactionHistory: [purchaseTx]
    };

    onAddCompany(newCompany);
    setFeedback(t.company.feedbackSaved);
    closeModal();
  };

  const startEdit = (company) => {
    setEditingCompanyId(company.id);
    setEditForm({
      name: company.name,
      contact: company.contact || '',
      address: company.address || ''
    });
  };

  const closeEdit = () => setEditingCompanyId(null);

  const saveEdit = () => {
    const existingCompany = companies.find((c) => c.id === editingCompanyId);
    if (!existingCompany) return;
    onUpdateCompany({
      ...existingCompany,
      name: editForm.name.trim(),
      contact: editForm.contact.trim(),
      address: editForm.address.trim()
    });
    setFeedback(t.company.feedbackUpdated);
    closeEdit();
  };

  const handlePurchaseChange = (e) => {
    const { name, value } = e.target;
    setPurchaseForm((prev) => ({ ...prev, [name]: value }));
  };

  const updatePurchaseProductRow = (index, field, value) => {
    setPurchaseForm((prev) => ({
      ...prev,
      products: prev.products.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    }));
  };

  const addPurchaseProductRow = () => {
    setPurchaseForm((prev) => ({ ...prev, products: [...prev.products, { name: '', quantity: '' }] }));
  };

  const removePurchaseProductRow = (index) => {
    setPurchaseForm((prev) => ({ ...prev, products: prev.products.filter((_, i) => i !== index) }));
  };

  const submitPurchase = (companyId) => {
    const products = purchaseForm.products
      .filter((p) => p.name.trim() && Number(p.quantity) > 0)
      .map((p) => ({ name: p.name.trim(), quantity: Number(p.quantity) }));
    if (products.length === 0) return;

    const total = Number(purchaseForm.totalPurchaseAmount || 0);
    const paid = Number(purchaseForm.amountPaid || 0);
    if (paid > total) return;

    onAddCompanyPurchase(companyId, {
      products,
      totalAmount: total,
      amountPaid: paid,
      purchaseDate: purchaseForm.purchaseDate || todayStr(),
      dueDate: purchaseForm.dueDate || null
    });

    setActivePurchaseId(null);
    setPurchaseForm({
      products: [{ name: '', quantity: '' }],
      totalPurchaseAmount: '',
      amountPaid: '0',
      purchaseDate: todayStr(),
      dueDate: ''
    });
    setFeedback(t.company.feedbackPurchase);
  };

  const openPayment = (company) => {
    setPaymentCompanyId(company.id);
    setPaymentValue('');
    setPaymentDate(todayStr());
  };

  const closePayment = () => {
    setPaymentCompanyId(null);
    setPaymentValue('');
    setPaymentDate('');
  };

  const submitPayment = () => {
    const amount = Number(paymentValue);
    if (!amount || amount <= 0) return;
    onRecordCompanyPayment(paymentCompanyId, amount, paymentDate || todayStr());
    setFeedback(t.company.feedbackPayment);
    closePayment();
  };

  const updateTxProductRow = (index, field, value) => {
    setTxEditForm((prev) => ({
      ...prev,
      products: prev.products.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    }));
  };

  const addTxProductRow = () => {
    setTxEditForm((prev) => ({ ...prev, products: [...prev.products, { name: '', quantity: '' }] }));
  };

  const removeTxProductRow = (index) => {
    setTxEditForm((prev) => ({ ...prev, products: prev.products.filter((_, i) => i !== index) }));
  };

  const startEditTx = (company, tx) => {
    setEditingTx({ companyId: company.id, txId: tx.id });
    setTxEditForm({
      products: Array.isArray(tx.products) && tx.products.length
        ? tx.products.map((p) => ({ name: p.name, quantity: String(p.quantity) }))
        : [{ name: '', quantity: '' }],
      totalPurchaseAmount: String(tx.totalAmount ?? ''),
      amountPaid: String(tx.amountPaid ?? '0'),
      purchaseDate: (tx.date || '').slice(0, 10)
    });
  };

  const submitEditTx = () => {
    const company = companies.find((c) => c.id === editingTx.companyId);
    if (!company) return;
    const tx = company.transactionHistory.find((x) => x.id === editingTx.txId);
    if (!tx) return;

    const products = txEditForm.products
      .filter((p) => p.name.trim() && Number(p.quantity) > 0)
      .map((p) => ({ name: p.name.trim(), quantity: Number(p.quantity) }));
    if (products.length === 0) return;

    const total = Number(txEditForm.totalPurchaseAmount || 0);
    const paid = Number(txEditForm.amountPaid || 0);
    if (paid > total) return;

    onEditCompanyTransaction(editingTx.companyId, editingTx.txId, {
      products,
      totalAmount: total,
      amountPaid: paid,
      purchaseDate: txEditForm.purchaseDate || (tx.date ? tx.date.slice(0, 10) : todayStr())
    });

    setEditingTx(null);
    setFeedback(t.company.feedbackUpdated);
  };

  const getAggregatedProducts = (company) => {
    const map = new Map();
    (company.transactionHistory || []).forEach((tx) => {
      if (tx.type === 'purchase' && Array.isArray(tx.products)) {
        tx.products.forEach((p) => {
          const qty = Number(p.quantity || 0);
          map.set(p.name, (map.get(p.name) || 0) + qty);
        });
      }
    });
    return Array.from(map.entries()).map(([name, quantity]) => ({ name, quantity }));
  };

  const getPaymentStatus = (company) => {
    if (Number(company.dueAmount || 0) > 0) return 'due';
    return 'paid';
  };

  const getTransactionSnapshot = (company) => {
    return rebuildCompanyTransactionTimeline(company.transactionHistory || []);
  };

  const getLatestPurchaseDate = (company) => {
    const dates = (company.transactionHistory || [])
      .filter((tx) => tx.type === 'purchase' && tx.date)
      .map((tx) => new Date(tx.date).getTime())
      .filter((d) => !Number.isNaN(d));
    if (dates.length === 0) return '—';
    return formatDate(new Date(Math.max(...dates)));
  };

  const getLatestPaymentDate = (company) => {
    const dates = (company.transactionHistory || [])
      .filter((tx) => tx.type === 'payment' && (tx.date || tx.paymentDate))
      .map((tx) => new Date(tx.date || tx.paymentDate).getTime())
      .filter((d) => !Number.isNaN(d));
    if (dates.length === 0) return '—';
    return formatDate(new Date(Math.max(...dates)));
  };

  const totalPayable = useMemo(() => {
    return companies.reduce((sum, company) => sum + Number(company.dueAmount || 0), 0);
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return companies.filter((company) => {
      const matchesSearch = `${company.name || ''} ${company.contact || ''}`.toLowerCase().includes(query);
      const dueAmount = Number(company.dueAmount || 0);
      let matchesStatus = true;
      if (statusFilter === 'Payable') matchesStatus = dueAmount > 0;
      else if (statusFilter === 'Paid') matchesStatus = dueAmount <= 0;
      return matchesSearch && matchesStatus;
    });
  }, [companies, searchTerm, statusFilter]);

  const sortedCompanies = useMemo(() => {
    return [...filteredCompanies].sort((a, b) => {
      const aDue = Number(a.dueAmount || 0);
      const bDue = Number(b.dueAmount || 0);
      if ((aDue > 0 ? 1 : 0) !== (bDue > 0 ? 1 : 0)) return bDue > 0 ? 1 : -1;
      return bDue - aDue;
    });
  }, [filteredCompanies]);

  const getStatusBadge = (status) => {
    return status === 'due'
      ? <span className="badge badge-danger">{t.company.statusDue}</span>
      : <span className="badge badge-success">{t.company.statusPaid}</span>;
  };

  return (
    <div className="page-container fade-in">

      {/* Page Header */}
      <div className="inventory-header">
        <div>
          <h2>{t.company.title}</h2>
          <p className="subtitle">{t.company.registerDesc}</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          {t.company.addButton}
        </button>
      </div>

      {/* Summary + Filters Toolbar */}
      <div className="glass-card toolbar-card">
        <div className="toolbar-grid">
          <div className="form-group no-margin">
            <label className="form-label">{t.company.searchLabel}</label>
            <input
              type="text"
              className="form-control"
              placeholder={t.company.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-group no-margin">
            <label className="form-label">{t.company.statusFilterLabel}</label>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">{t.company.allItems}</option>
              <option value="Payable">{t.company.dueFilter}</option>
              <option value="Paid">{t.company.paidFilter}</option>
            </select>
          </div>

          <div className="form-group no-margin company-balance-box">
            <label className="form-label">{t.company.totalPayable}</label>
            <p className="company-balance-value">৳{Number(totalPayable || 0).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="table-wrapper">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>{t.company.tableId}</th>
                <th>{t.company.nameLabel}</th>
                <th>{t.company.tableContact}</th>
                <th>{t.company.tableAddress}</th>
                <th>{t.company.tableProducts}</th>
                <th>{t.company.tableTotal}</th>
                <th>{t.company.tablePaid}</th>
                <th>{t.company.tableDue}</th>
                <th>{t.company.tableStatus}</th>
                <th>{t.company.tableActions}</th>
              </tr>
            </thead>
            <tbody>
              {sortedCompanies.map((company) => {
                const status = getPaymentStatus(company);
                const products = getAggregatedProducts(company);
                return (
                  <React.Fragment key={company.id}>
                    <tr>
                      <td><code className="item-id">{company.id}</code></td>
                      <td>
                        <div className="med-title-cell">
                          <strong>{company.name}</strong>
                          {status === 'due' && <span className="cell-badge badge-danger">{t.company.statusDue}</span>}
                        </div>
                      </td>
                      <td>{company.contact}</td>
                      <td className="generic-cell">{company.address}</td>
                      <td className="generic-cell">
                        {products.length ? products.map((p) => `${p.name} (${p.quantity})`).join(', ') : '—'}
                      </td>
                      <td>৳ {Number(company.totalPurchaseAmount || 0).toFixed(2)}</td>
                      <td>৳ {Number(company.amountPaid || 0).toFixed(2)}</td>
                      <td>
                        <span className={Number(company.dueAmount || 0) > 0 ? 'text-danger strong' : ''}>
                          ৳ {Number(company.dueAmount || 0).toFixed(2)}
                        </span>
                      </td>
                      <td>{getStatusBadge(status)}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-secondary btn-sm" onClick={() => openPayment(company)} title={t.company.receivePayment}>💰</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setActivePurchaseId(activePurchaseId === company.id ? null : company.id)} title={t.company.addPurchase}>➕</button>
                          <button className="btn btn-secondary btn-sm edit-btn" onClick={() => startEdit(company)} title={t.company.edit}>✏️</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setHistoryId(historyId === company.id ? null : company.id)} title={historyId === company.id ? t.company.hideHistory : t.company.viewHistory}>📜</button>
                          <button className="btn btn-secondary btn-sm delete-btn" onClick={() => onDeleteCompany(company.id)} title={t.company.delete}>🗑️</button>
                        </div>
                      </td>
                    </tr>

                    {activePurchaseId === company.id && (
                      <tr className="history-row">
                        <td colSpan={10}>
                          <div className="inline-form-box">
                            <div className="product-rows">
                              {purchaseForm.products.map((row, index) => (
                                <div className="product-row" key={index}>
                                  <input className="form-control" placeholder={t.company.productNamePlaceholder} value={row.name} onChange={(e) => updatePurchaseProductRow(index, 'name', e.target.value)} />
                                  <input className="form-control product-qty" type="number" min="0" step="any" placeholder={t.company.quantityLabel} value={row.quantity} onChange={(e) => updatePurchaseProductRow(index, 'quantity', e.target.value)} />
                                  {purchaseForm.products.length > 1 && (
                                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removePurchaseProductRow(index)}>{t.company.removeProduct}</button>
                                  )}
                                </div>
                              ))}
                            </div>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={addPurchaseProductRow}>+ {t.company.addProduct}</button>
                            <div className="form-row">
                              <input className="form-control" type="number" min="0" step="any" placeholder={t.company.totalAmountLabel} name="totalPurchaseAmount" value={purchaseForm.totalPurchaseAmount} onChange={handlePurchaseChange} />
                              <input className="form-control" type="number" min="0" step="any" placeholder={t.company.amountPaidLabel} name="amountPaid" value={purchaseForm.amountPaid} onChange={handlePurchaseChange} />
                            </div>
                            <div className="form-row">
                              <input className="form-control" type="date" name="purchaseDate" value={purchaseForm.purchaseDate} onChange={handlePurchaseChange} />
                              <input className="form-control" type="date" name="dueDate" value={purchaseForm.dueDate} onChange={handlePurchaseChange} />
                            </div>
                            <div className="company-actions">
                              <button className="btn btn-primary btn-sm" onClick={() => submitPurchase(company.id)}>{t.company.paymentSave}</button>
                              <button className="btn btn-secondary btn-sm" onClick={() => setActivePurchaseId(null)}>{t.company.paymentCancel}</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {editingCompanyId === company.id && (
                      <tr className="history-row">
                        <td colSpan={10}>
                          <div className="inline-form-box">
                            <input className="form-control" placeholder={t.company.nameLabel} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                            <input className="form-control" placeholder={t.company.contactLabel} value={editForm.contact} onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })} />
                            <textarea className="form-control company-textarea" placeholder={t.company.addressLabel} value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                            <div className="company-actions">
                              <button className="btn btn-primary btn-sm" onClick={saveEdit}>{t.company.paymentSave}</button>
                              <button className="btn btn-secondary btn-sm" onClick={closeEdit}>{t.company.paymentCancel}</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {historyId === company.id && (
                      <tr className="history-row">
                        <td colSpan={10}>
                          <div className="history-box">
                            <h5>{t.company.historyTitle}</h5>
                            <div className="history-list">
                            {(() => {
                              const chronological = getTransactionSnapshot(company);
                              return [...chronological].reverse().map((tx) => {
                                  const isEditing = editingTx && editingTx.companyId === company.id && editingTx.txId === tx.id;
                                  if (isEditing) {
                                    return (
                                      <div key={tx.id} className="history-item history-edit">
                                        <div className="product-rows">
                                          {txEditForm.products.map((row, index) => (
                                            <div className="product-row" key={index}>
                                              <input className="form-control" placeholder={t.company.productNamePlaceholder} value={row.name} onChange={(e) => updateTxProductRow(index, 'name', e.target.value)} />
                                              <input className="form-control product-qty" type="number" min="0" step="any" placeholder={t.company.quantityLabel} value={row.quantity} onChange={(e) => updateTxProductRow(index, 'quantity', e.target.value)} />
                                              {txEditForm.products.length > 1 && (
                                                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeTxProductRow(index)}>{t.company.removeProduct}</button>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                        <button type="button" className="btn btn-secondary btn-sm" onClick={addTxProductRow}>+ {t.company.addProduct}</button>
                                        <div className="form-row">
                                          <input className="form-control" type="number" min="0" step="any" placeholder={t.company.totalAmountLabel} value={txEditForm.totalPurchaseAmount} onChange={(e) => setTxEditForm({ ...txEditForm, totalPurchaseAmount: e.target.value })} />
                                          <input className="form-control" type="number" min="0" step="any" placeholder={t.company.amountPaidLabel} value={txEditForm.amountPaid} onChange={(e) => setTxEditForm({ ...txEditForm, amountPaid: e.target.value })} />
                                        </div>
                                        <div className="form-row">
                                          <input className="form-control" type="date" value={txEditForm.purchaseDate} onChange={(e) => setTxEditForm({ ...txEditForm, purchaseDate: e.target.value })} />
                                        </div>
                                        <div className="company-actions">
                                          <button className="btn btn-primary btn-sm" onClick={submitEditTx}>{t.company.paymentSave}</button>
                                          <button className="btn btn-secondary btn-sm" onClick={() => setEditingTx(null)}>{t.company.paymentCancel}</button>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div key={tx.id} className={`history-item history-${tx.type}`}>
                                      {tx.type === 'purchase' ? (
                                        <div className="history-main">
                                          <span className="history-badge purchase">{t.company.typePurchase}</span>
                                          <span className="history-date">{formatDateTime(tx.createdAt || tx.date)}</span>
                                          <span className="history-detail">
                                            {Array.isArray(tx.products) ? tx.products.map((p) => `${p.name} (${p.quantity})`).join(', ') : ''}
                                            {' · '}{t.company.totalPurchase} ৳{Number(tx.totalAmount || 0).toFixed(2)}
                                            {' · '}{t.company.amountPaid} ৳{Number(tx.amountPaid || 0).toFixed(2)}
                                            {' · '}{t.company.dueAmount} ৳{Number(tx.dueAmount || 0).toFixed(2)}
                                            {' · '}{t.company.totalPayableLabel} ৳{Number(tx.totalOutstandingDue || tx.remainingDue || 0).toFixed(2)}
                                            {tx.dueDate && ` · ${t.company.dueDate} ${formatDate(tx.dueDate)}`}
                                          </span>
                                          <button className="btn btn-secondary btn-sm history-edit-btn" onClick={() => startEditTx(company, tx)}>{t.company.editRecord}</button>
                                        </div>
                                      ) : (
                                        <div className="history-main">
                                          <span className="history-badge payment">{t.company.typePayment}</span>
                                          <span className="history-date">{formatDateTime(tx.createdAt || tx.date)}</span>
                                          <span className="history-detail">
                                            {t.company.paymentAmount} ৳{Number(tx.amount || 0).toFixed(2)}
                                            {' · '}{t.company.previousDue} ৳{Number(tx.previousDue || 0).toFixed(2)}
                                            {' · '}{t.company.remainingDueAfterPayment} ৳{Number(tx.remainingDue || 0).toFixed(2)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                            )()}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {sortedCompanies.length === 0 && (
                <tr>
                  <td colSpan={10} className="empty-table-cell">
                    {t.company.empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Company Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-container">
            <div className="modal-header">
              <h3>{t.company.modalAddTitle}</h3>
              <button className="modal-close-btn" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="modal-form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="cName">{t.company.nameLabel} *</label>
                  <input type="text" id="cName" required className="form-control" placeholder={t.company.namePlaceholder} value={formData.name} onChange={handleChange} name="name" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cContact">{t.company.contactLabel} *</label>
                  <input type="text" id="cContact" required className="form-control" placeholder={t.company.contactPlaceholder} value={formData.contact} onChange={handleChange} name="contact" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cAddress">{t.company.addressLabel} *</label>
                <textarea id="cAddress" required rows="2" className="form-control company-textarea" placeholder={t.company.addressPlaceholder} value={formData.address} onChange={handleChange} name="address" />
              </div>

              <div className="form-group">
                <label className="form-label">{t.company.productsLabel}</label>
                <div className="product-rows">
                  {formData.products.map((row, index) => (
                    <div className="product-row" key={index}>
                      <input className="form-control" placeholder={t.company.productNamePlaceholder} value={row.name} onChange={(e) => updateProductRow(index, 'name', e.target.value)} />
                      <input className="form-control product-qty" type="number" min="0" step="any" placeholder={t.company.quantityLabel} value={row.quantity} onChange={(e) => updateProductRow(index, 'quantity', e.target.value)} />
                      {formData.products.length > 1 && (
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => removeProductRow(index)}>{t.company.removeProduct}</button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addProductRow}>+ {t.company.addProduct}</button>
              </div>

              <div className="modal-form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="cTotal">{t.company.totalAmountLabel}</label>
                  <input type="number" id="cTotal" min="0" step="any" className="form-control" placeholder="0" value={formData.totalPurchaseAmount} onChange={handleChange} name="totalPurchaseAmount" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cPaid">{t.company.amountPaidLabel}</label>
                  <input type="number" id="cPaid" min="0" step="any" className="form-control" placeholder="0" value={formData.amountPaid} onChange={handleChange} name="amountPaid" />
                </div>
              </div>

              <div className="modal-form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="cPurchaseDate">{t.company.purchaseDateLabel}</label>
                  <input type="date" id="cPurchaseDate" className="form-control" value={formData.purchaseDate} onChange={handleChange} name="purchaseDate" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cDueDate">{t.company.dueDateLabel}</label>
                  <input type="date" id="cDueDate" className="form-control" value={formData.dueDate} onChange={handleChange} name="dueDate" />
                </div>
              </div>

              {feedback && <p className="company-feedback">{feedback}</p>}

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>{t.company.paymentCancel}</button>
                <button type="submit" className="btn btn-primary">{t.company.saveCompany}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Payment Modal */}
      {paymentCompanyId && (
        <div className="modal-overlay">
          <div className="glass-card modal-container">
            <div className="modal-header">
              <h3>{t.company.receivePayment}</h3>
              <button className="modal-close-btn" onClick={closePayment}>×</button>
            </div>

            <form className="modal-form" onSubmit={(e) => { e.preventDefault(); submitPayment(); }}>
              <div className="form-group">
                <label className="form-label">{t.company.paymentAmount}</label>
                <input type="number" min="0" step="any" className="form-control" placeholder="0" value={paymentValue} onChange={(e) => setPaymentValue(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{t.company.paymentDate}</label>
                <input type="date" className="form-control" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closePayment}>{t.company.paymentCancel}</button>
                <button type="submit" className="btn btn-primary">{t.company.paymentSave}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
