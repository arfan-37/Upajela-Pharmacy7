import React, { useState } from 'react';
import { isBatchExpired, normalizeMedicineRecord } from '../utils/inventoryBatchUtils';

export default function Returns({ transactions, medicines, customers, returns, onProcessReturn, currentRole, t }) {
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [returnItems, setReturnItems] = useState({});
  const [returnReason, setReturnReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const searchCustomer = () => {
    setError('');
    setSuccess('');
    const trimmed = customerSearch.trim().toLowerCase();
    if (!trimmed) {
      setCustomerResults([]);
      return;
    }
    const filtered = customers.filter(c => 
      c.name.toLowerCase().includes(trimmed) || 
      c.phone.includes(trimmed)
    );
    setCustomerResults(filtered);
  };

  const handleCustomerSearchChange = (value) => {
    setCustomerSearch(value);
    setSelectedCustomer(null);
    setSelectedTransaction(null);
    setReturnItems({});
    setError('');
    setSuccess('');
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) {
      setCustomerResults([]);
      return;
    }
    const filtered = customers.filter(c => 
      c.name.toLowerCase().includes(trimmed) || 
      c.phone.includes(trimmed)
    );
    setCustomerResults(filtered);
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerResults([]);
    setCustomerSearch('');
    setSelectedTransaction(null);
    setReturnItems({});
    setError('');
    setSuccess('');
  };

  const selectInvoice = (tx) => {
    setSelectedTransaction(tx);
    const initial = {};
    tx.items.forEach(item => {
      initial[item.id] = 0;
    });
    setReturnItems(initial);
    setError('');
    setSuccess('');
  };

  const getMedicine = (medicineId) => {
    return medicines.find(m => m.id === medicineId);
  };

  const getBatchExpiryStatus = (medicineId, batchNumber) => {
    const med = getMedicine(medicineId);
    if (!med) return false;
    const normalized = normalizeMedicineRecord(med);
    const batch = normalized.batches.find(b => b.batchNumber === batchNumber);
    if (!batch) return false;
    return isBatchExpired(batch);
  };

  const handleReturnQtyChange = (itemId, value) => {
    const item = selectedTransaction?.items.find(i => i.id === itemId);
    if (!item) return;
    const num = parseInt(value) || 0;
    if (num < 0) return;
    if (num > item.quantity) {
      setError(t.returns?.exceedsSoldQuantity || 'Return quantity cannot exceed sold quantity.');
      return;
    }
    setError('');
    setReturnItems(prev => ({ ...prev, [itemId]: num }));
  };

  const processReturn = () => {
    setError('');
    setSuccess('');
    if (!selectedTransaction) return;

    const hasReturn = Object.values(returnItems).some(qty => qty > 0);
    if (!hasReturn) {
      setError(t.returns?.selectItem || 'Please select at least one item to return.');
      return;
    }

    const returnRecords = [];
    for (const item of selectedTransaction.items) {
      const returnQty = returnItems[item.id] || 0;
      if (returnQty <= 0) continue;

      if (getBatchExpiryStatus(item.medicineId, item.batchNumber)) {
        setError(t.returns?.expiredReturnBlocked || 'Expired medicine cannot be returned.');
        return;
      }

      const medicine = getMedicine(item.medicineId);
      if (!medicine) continue;

      const refundAmount = Number((returnQty * item.price).toFixed(2));

      returnRecords.push({
        id: `RET-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        returnDate: new Date().toISOString(),
        originalInvoiceId: selectedTransaction.id,
        customerId: selectedTransaction.customer?.id || null,
        customerName: selectedTransaction.customer?.name || 'Walk-in Customer',
        medicineId: item.medicineId,
        medicineName: item.name,
        batchNumber: item.batchNumber,
        batchLabel: item.batchNo,
        returnQuantity: returnQty,
        reason: returnReason.trim() || '-',
        refundAmount,
        refundType: selectedTransaction.paymentType === 'due' ? 'adjust_due' : selectedTransaction.paymentType === 'partial' ? 'partial' : 'cash',
        processedBy: currentRole,
        status: 'completed'
      });
    }

    if (returnRecords.length === 0) return;

    onProcessReturn({
      returns: returnRecords,
      originalTransaction: selectedTransaction,
      returnItems: returnRecords.map(r => ({
        medicineId: r.medicineId,
        batchNumber: r.batchNumber,
        quantity: r.returnQuantity
      }))
    });

    const totalRefund = returnRecords.reduce((sum, r) => sum + r.refundAmount, 0);
    setSuccess(t.returns?.processSuccess || `Return processed successfully. Total refund: ৳${totalRefund.toFixed(2)}`);
    setSelectedTransaction(null);
    setReturnItems({});
    setReturnReason('');
    setSelectedCustomer(null);
  };

  const getCustomerInvoices = () => {
    if (!selectedCustomer) return [];
    const customerId = selectedCustomer.id;
    return transactions.filter(tx => {
      if (!tx || typeof tx !== 'object') return false;
      if (tx.customer?.id === customerId) return true;
      if (tx.customer?.name === selectedCustomer.name && tx.customer?.phone === selectedCustomer.phone) return true;
      if (tx.customerId === customerId) return true;
      return false;
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const getCustomerPurchaseHistory = () => {
    if (!selectedCustomer) return [];
    const history = (selectedCustomer.paymentHistory || []).filter(entry => entry.type === 'sale');
    return history.sort((a, b) => new Date(b.purchaseDate || b.createdAt) - new Date(a.purchaseDate || a.createdAt));
  };

  const resetAll = () => {
    setSelectedCustomer(null);
    setSelectedTransaction(null);
    setReturnItems({});
    setReturnReason('');
    setCustomerSearch('');
    setCustomerResults([]);
    setError('');
    setSuccess('');
  };

  return (
    <div className="page-container fade-in">
      <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="modal-header">
          <h3>{t.returns?.title || 'Returns / Refunds'}</h3>
        </div>

        {!selectedCustomer && (
          <div className="form-group">
            <label className="form-label">{t.returns?.searchCustomer || 'Search Customer by Name or Mobile'}</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="form-control"
                placeholder={t.returns?.customerPlaceholder || 'Enter customer name or mobile number...'}
                value={customerSearch}
                onChange={(e) => handleCustomerSearchChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); searchCustomer(); } }}
              />
              <button type="button" className="btn btn-primary" onClick={searchCustomer}>
                {t.returns?.search || 'Search'}
              </button>
            </div>
          </div>
        )}

        {!selectedCustomer && customerSearch.trim() && (
          <div style={{ marginTop: '16px' }}>
            {customerResults.length > 0 ? (
              <>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  {t.returns?.searchResults || 'Search Results'} ({customerResults.length})
                </div>
            {customerResults.map(customer => (
              <div 
                key={customer.id} 
                onClick={() => selectCustomer(customer)}
                style={{ 
                  padding: '12px 16px', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-md)', 
                  marginBottom: '8px', 
                  cursor: 'pointer',
                  background: 'var(--bg-secondary)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
              >
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{customer.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>📱 {customer.phone}</div>
              </div>
              ))}
            </>
          ) : (
            <div style={{ padding: '12px 16px', color: 'var(--danger)', fontSize: '13px', fontWeight: 600 }}>
              {t.returns?.noCustomerFound || 'This customer is not existing.'}
            </div>
          )}
          </div>
        )}

        {selectedCustomer && !selectedTransaction && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <strong>{t.returns?.customer || 'Customer'}:</strong> {selectedCustomer.name}
                <br />
                <strong>{t.returns?.phone || 'Mobile'}:</strong> {selectedCustomer.phone}
              </div>
              <button type="button" className="btn btn-secondary" onClick={resetAll} style={{ padding: '6px 12px', fontSize: '12px' }}>
                {t.returns?.changeCustomer || 'Change Customer'}
              </button>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              {t.returns?.invoices || 'Invoices'} ({getCustomerInvoices().length})
            </div>

            {(() => {
              const invoices = getCustomerInvoices();
              const purchaseHistory = getCustomerPurchaseHistory();

              if (invoices.length === 0 && purchaseHistory.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    {t.returns?.noPurchaseHistory || 'No purchase history found.'}
                  </div>
                );
              }

              return (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {invoices.length > 0 && invoices.map(tx => (
                    <div
                      key={tx.id}
                      onClick={() => selectInvoice(tx)}
                      style={{
                        padding: '12px 16px',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        background: 'var(--bg-secondary)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tx.id}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                            {new Date(tx.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 600 }}>৳{Number(tx.total || 0).toFixed(2)}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {tx.paymentType === 'cash' ? 'Cash' : tx.paymentType === 'due' ? 'Due' : 'Partial'}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {tx.items?.length || 0} items
                      </div>
                    </div>
                  ))}
                  {invoices.length > 0 && purchaseHistory.length > 0 && (
                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
                        Additional History ({purchaseHistory.length})
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {error && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '12px', fontWeight: 600, marginTop: '12px' }}>{error}</div>}
        {success && <div style={{ color: 'var(--success)', fontSize: '13px', marginBottom: '12px', fontWeight: 600, marginTop: '12px' }}>{success}</div>}

        {selectedTransaction && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <strong>{t.returns?.invoice || 'Invoice'}:</strong> {selectedTransaction.id}
                <br />
                <strong>{t.returns?.date || 'Date'}:</strong> {new Date(selectedTransaction.timestamp).toLocaleString()}
                <br />
                <strong>{t.returns?.customer || 'Customer'}:</strong> {selectedTransaction.customer?.name || 'Walk-in Customer'}
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong>{t.returns?.total || 'Total'}:</strong> ৳{Number(selectedTransaction.total || 0).toFixed(2)}
                <br />
                <strong>{t.returns?.paid || 'Paid'}:</strong> ৳{Number(selectedTransaction.cashReceived || 0).toFixed(2)}
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '8px' }}>{t.returns?.medicine || 'Medicine'}</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>{t.returns?.batch || 'Batch'}</th>
                  <th style={{ textAlign: 'center', padding: '8px' }}>{t.returns?.sold || 'Sold'}</th>
                  <th style={{ textAlign: 'center', padding: '8px' }}>{t.returns?.returnQty || 'Return Qty'}</th>
                  <th style={{ textAlign: 'right', padding: '8px' }}>{t.returns?.price || 'Price'}</th>
                  <th style={{ textAlign: 'right', padding: '8px' }}>{t.returns?.refund || 'Refund'}</th>
                </tr>
              </thead>
              <tbody>
                {selectedTransaction.items.map(item => {
                  const med = getMedicine(item.medicineId);
                  const isExpired = getBatchExpiryStatus(item.medicineId, item.batchNumber);
                  const returnQty = returnItems[item.id] || 0;
                  const refund = Number((returnQty * item.price).toFixed(2));

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', background: isExpired ? 'var(--danger-light)' : 'transparent' }}>
                      <td style={{ padding: '10px 8px' }}>
                        {item.name}
                        {isExpired && <span className="badge badge-danger" style={{ marginLeft: '8px' }}>{t.inventory?.expired || 'Expired'}</span>}
                      </td>
                      <td style={{ padding: '10px 8px' }}>{item.batchNo || item.batchNumber}</td>
                      <td style={{ textAlign: 'center', padding: '10px 8px' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'center', padding: '10px 8px' }}>
                        <input
                          type="number"
                          min="0"
                          max={item.quantity}
                          className="form-control"
                          style={{ width: '80px', textAlign: 'center' }}
                          value={returnQty}
                          onChange={(e) => handleReturnQtyChange(item.id, e.target.value)}
                          disabled={isExpired}
                        />
                        {isExpired && <div style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px' }}>{t.returns?.cannotReturn || 'Cannot return'}</div>}
                      </td>
                      <td style={{ textAlign: 'right', padding: '10px 8px' }}>৳{Number(item.price || 0).toFixed(2)}</td>
                      <td style={{ textAlign: 'right', padding: '10px 8px' }}>৳{refund.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="form-group">
              <label className="form-label">{t.returns?.reason || 'Return Reason'}</label>
              <select
                className="form-control"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
              >
                <option value="">{t.returns?.selectReason || 'Select reason'}</option>
                <option value="expired">{t.returns?.reasonExpired || 'Expired medicine'}</option>
                <option value="wrong">{t.returns?.reasonWrong || 'Wrong medicine given'}</option>
                <option value="damaged">{t.returns?.reasonDamaged || 'Damaged packaging'}</option>
                <option value="changed_mind">{t.returns?.reasonChangedMind || 'Customer changed mind'}</option>
                <option value="other">{t.returns?.reasonOther || 'Other'}</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { setSelectedTransaction(null); setReturnItems({}); setError(''); setSuccess(''); }}>
                {t.returns?.cancel || 'Cancel'}
              </button>
              <button type="button" className="btn btn-primary" onClick={processReturn} disabled={Object.values(returnItems).every(qty => qty === 0)}>
                {t.returns?.processReturn || 'Process Return'}
              </button>
            </div>
          </div>
        )}

        {(!selectedCustomer && !customerResults.length && !selectedTransaction && returns.length === 0) && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>🔍</span>
            <p>{t.returns?.searchHint || 'Search for a customer to view their invoices and process returns.'}</p>
          </div>
        )}

        {!selectedCustomer && !customerResults.length && !selectedTransaction && returns.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{t.returns?.historyTitle || 'Return History'}</h4>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{returns.length} records</span>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '8px' }}>{t.returns?.customer || 'Customer'}</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>{t.returns?.invoice || 'Invoice'}</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>{t.returns?.medicine || 'Medicine'}</th>
                    <th style={{ textAlign: 'center', padding: '8px' }}>{t.returns?.returnQty || 'Qty'}</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>{t.returns?.refund || 'Refund'}</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>{t.returns?.reason || 'Reason'}</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>{t.returns?.date || 'Date'}</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.slice(0, 20).map(record => (
                    <tr key={record.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px' }}>{record.customerName}</td>
                      <td style={{ padding: '8px' }}>{record.originalInvoiceId}</td>
                      <td style={{ padding: '8px' }}>{record.medicineName}</td>
                      <td style={{ textAlign: 'center', padding: '8px' }}>{record.returnQuantity}</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>৳{Number(record.refundAmount || 0).toFixed(2)}</td>
                      <td style={{ padding: '8px', textTransform: 'capitalize' }}>{record.reason}</td>
                      <td style={{ padding: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(record.returnDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
