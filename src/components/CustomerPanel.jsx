import React, { useMemo, useState } from 'react';
import './CustomerPanel.css';

export default function CustomerPanel({ customers, shopBalance, onAddCustomer, onUpdateCustomer, onDeleteCustomer, onReceivePayment, currentRole }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    initialDue: '0'
  });
  const [feedback, setFeedback] = useState('');
  const [activePaymentId, setActivePaymentId] = useState(null);
  const [paymentValue, setPaymentValue] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '', initialDue: '0', purchaseDate: '', paymentDate: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setFeedback('Please fill in all customer fields.');
      return;
    }

    const duplicate = customers.some(customer => customer.phone === formData.phone.trim());
    if (duplicate) {
      setFeedback('This phone number is already registered.');
      return;
    }

    const initialDue = Number(formData.initialDue || 0);
    const newCustomer = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      totalPurchaseAmount: 0,
      cashPaid: 0,
      dueAmount: Number.isFinite(initialDue) ? Math.max(0, initialDue) : 0,
      totalDue: Number.isFinite(initialDue) ? Math.max(0, initialDue) : 0,
      dueEntries: []
    };

    onAddCustomer(newCustomer);
    setFormData({ name: '', phone: '', address: '', initialDue: '0' });
    setFeedback('Customer saved successfully.');
  };

  const filteredCustomers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return customers;
    return customers.filter((customer) => {
      const haystack = `${customer.name || ''} ${customer.phone || ''}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [customers, searchTerm]);

  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      const getPriority = (customer) => {
        const age = customer.dueEntries?.length ? Math.max(...customer.dueEntries.map(entry => new Date(entry.createdAt).getTime())) : null;
        const now = Date.now();
        if (!age) return 0;
        const daysOld = (now - age) / (1000 * 60 * 60 * 24);
        if (daysOld > 30) return 2;
        if (daysOld >= 15) return 1;
        return 0;
      };
      const aPriority = getPriority(a);
      const bPriority = getPriority(b);
      if (aPriority !== bPriority) return bPriority - aPriority;
      return (b.totalDue || 0) - (a.totalDue || 0);
    });
  }, [filteredCustomers]);

  const getDueAgeInDays = (customer) => {
    const latestDueDate = customer.dueEntries?.length
      ? customer.dueEntries
          .filter(entry => entry.type === 'credit')
          .map(entry => new Date(entry.createdAt).getTime())
          .sort((a, b) => b - a)[0]
      : null;
    if (!latestDueDate) return 0;
    return Math.floor((Date.now() - latestDueDate) / (1000 * 60 * 60 * 24));
  };

  const getDueStatus = (customer) => {
    const historyEntries = (customer.paymentHistory || []).filter(entry => entry.type === 'sale' && entry.purchaseDate);
    const dueDates = [...historyEntries].map(entry => new Date(entry.purchaseDate).getTime()).filter(date => !Number.isNaN(date));

    if (dueDates.length === 0) {
      const latestDueDate = customer.dueEntries?.length
        ? customer.dueEntries
            .filter(entry => entry.type === 'credit')
            .map(entry => new Date(entry.createdAt).getTime())
            .sort((a, b) => b - a)[0]
        : null;
      if (!latestDueDate) return 'normal';
      const daysOld = (Date.now() - latestDueDate) / (1000 * 60 * 60 * 24);
      if (daysOld >= 30) return 'red';
      if (daysOld >= 15) return 'warning';
      return 'normal';
    }

    const latestDueDate = Math.max(...dueDates);
    const daysOld = (Date.now() - latestDueDate) / (1000 * 60 * 60 * 24);
    if (daysOld >= 30) return 'red';
    if (daysOld >= 15) return 'warning';
    return 'normal';
  };

  const getPaymentStatus = (customer) => {
    const totalPurchaseAmount = Number(customer.totalPurchaseAmount || 0);
    const cashPaid = Number(customer.cashPaid || 0);
    const dueAmount = Number(customer.dueAmount ?? customer.totalDue ?? 0);

    if (!totalPurchaseAmount) return 'No purchase';
    if (dueAmount <= 0) return 'Paid';
    if (cashPaid > 0) return 'Partial Due';
    return 'Full Due';
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

  const openPayment = (customer) => {
    setActivePaymentId(customer.id);
    setPaymentValue('');
    setPaymentDate(new Date().toISOString().slice(0, 10));
  };

  const submitPayment = (customerId) => {
    const amount = Number(paymentValue);
    if (!amount || amount <= 0) return;
    onReceivePayment(customerId, amount, paymentDate || new Date().toISOString());
    setActivePaymentId(null);
    setPaymentValue('');
    setPaymentDate('');
  };

  const startEdit = (customer) => {
    setEditingCustomerId(customer.id);
    setEditForm({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      initialDue: String(customer.dueAmount ?? customer.totalDue ?? 0),
      purchaseDate: customer.paymentHistory?.find(entry => entry.type === 'sale')?.purchaseDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      paymentDate: customer.paymentHistory?.find(entry => entry.type === 'sale' && entry.duePaymentDate)?.duePaymentDate?.slice(0, 10) || ''
    });
  };

  const saveEdit = (customerId) => {
    const existingCustomer = customers.find(customer => customer.id === customerId);
    const updatedCustomer = {
      ...existingCustomer,
      name: editForm.name.trim(),
      phone: editForm.phone.trim(),
      address: editForm.address.trim(),
      dueAmount: Math.max(0, Number(editForm.initialDue || 0)),
      totalDue: Math.max(0, Number(editForm.initialDue || 0)),
      paymentHistory: (existingCustomer.paymentHistory || []).map(entry => {
        if (entry.type === 'sale') {
          return {
            ...entry,
            purchaseDate: editForm.purchaseDate ? `${editForm.purchaseDate}T00:00:00.000Z` : entry.purchaseDate,
            paymentStatus: entry.remainingDue > 0 ? (entry.amountReceived > 0 ? 'Partial Due' : 'Full Due') : 'Paid'
          };
        }
        return entry;
      })
    };
    onUpdateCustomer(updatedCustomer);
    setEditingCustomerId(null);
  };

  return (
    <div className="page-container fade-in">
      <div className="customer-panel-summary">
        <div className="glass-card customer-summary-card">
          <h3>Shop Balance</h3>
          <p className="summary-amount">৳{Number(shopBalance || 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="customer-panel-grid">
        <div className="glass-card customer-form-card">
          <h2>Customer Register</h2>
          <p className="section-description">
            Store customer details for future billing and follow-up.
          </p>

          <form className="customer-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="customerName">Customer Name</label>
              <input
                id="customerName"
                name="name"
                className="form-control"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="customerPhone">Phone Number</label>
              <input
                id="customerPhone"
                name="phone"
                className="form-control"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="customerAddress">Address</label>
              <textarea
                id="customerAddress"
                name="address"
                className="form-control customer-textarea"
                placeholder="Enter address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="customerInitialDue">Initial Due Balance</label>
              <input
                id="customerInitialDue"
                name="initialDue"
                type="number"
                min="0"
                step="any"
                className="form-control"
                placeholder="0"
                value={formData.initialDue}
                onChange={handleChange}
              />
            </div>

            {feedback && <p className="customer-feedback">{feedback}</p>}

            <button type="submit" className="btn btn-primary">
              Save Customer
            </button>
          </form>
        </div>

        <div className="glass-card customer-list-card">
          <div className="customer-list-header">
            <h3>Saved Customers</h3>
            <input
              className="form-control"
              placeholder="Search by name or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="reminder-panels">
            <div className="reminder-panel warning-panel">
              <h4>15 Days Due</h4>
              <p>15 Days Due - Payment Pending</p>
              {sortedCustomers.filter(customer => getDueStatus(customer) === 'warning').map(customer => (
                <div key={`warning-${customer.id}`} className="reminder-item">{customer.name}</div>
              ))}
            </div>
            <div className="reminder-panel danger-panel">
              <h4>1 Month Due</h4>
              <p>1 Month Due - Payment Overdue</p>
              {sortedCustomers.filter(customer => getDueStatus(customer) === 'red').map(customer => (
                <div key={`danger-${customer.id}`} className="reminder-item">{customer.name}</div>
              ))}
            </div>
          </div>

          {customers.length === 0 ? (
            <div className="empty-state">
              <p>No customers have been saved yet.</p>
            </div>
          ) : (
            <div className="customer-list">
              {sortedCustomers.map((customer) => {
                const status = getDueStatus(customer);
                const rowClass = status === 'red' ? 'customer-card customer-card-red' : status === 'warning' ? 'customer-card customer-card-warning' : 'customer-card';
                return (
                  <div key={customer.id} className={rowClass}>
                    <div className="customer-card-header">
                      <h4>{customer.name}</h4>
                      {status === 'red' && <span className="status-pill red">1 Month Due - Payment Overdue</span>}
                      {status === 'warning' && <span className="status-pill yellow">15 Days Due - Payment Pending</span>}
                    </div>
                    <p><strong>Phone:</strong> <a href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{customer.phone}</a></p>
                    <p><strong>Address:</strong> {customer.address}</p>
                    <p><strong>Total Purchase Amount:</strong> ৳{Number(customer.totalPurchaseAmount || 0).toFixed(2)}</p>
                    <p><strong>Cash Paid:</strong> ৳{Number(customer.cashPaid || 0).toFixed(2)}</p>
                    <p><strong>Due Amount:</strong> ৳{Number(customer.dueAmount ?? customer.totalDue ?? 0).toFixed(2)}</p>
                    <p><strong>Purchase Date:</strong> {getLatestPurchaseDate(customer)}</p>
                    <p><strong>Due Payment Date:</strong> {customer.paymentHistory?.find(entry => entry.type === 'sale' && entry.duePaymentDate)?.duePaymentDate?.slice(0, 10) || '—'}</p>
                    <p><strong>Payment Status:</strong> {getPaymentStatus(customer)}</p>

                    {activePaymentId === customer.id ? (
                      <div className="payment-box">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          className="form-control"
                          value={paymentValue}
                          onChange={(e) => setPaymentValue(e.target.value)}
                          placeholder="Amount"
                        />
                        <input
                          type="date"
                          className="form-control"
                          value={paymentDate}
                          onChange={(e) => setPaymentDate(e.target.value)}
                        />
                        <button className="btn btn-primary btn-sm" onClick={() => submitPayment(customer.id)}>Save</button>
                      </div>
                    ) : (
                      <div className="customer-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => openPayment(customer)}>Receive Payment</button>
                        {currentRole === 'Admin' && (
                          <>
                            <button className="btn btn-secondary btn-sm" onClick={() => startEdit(customer)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => onDeleteCustomer(customer.id)}>Delete</button>
                          </>
                        )}
                      </div>
                    )}

                    {editingCustomerId === customer.id && (
                      <div className="edit-box">
                        <input className="form-control" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                        <input className="form-control" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                        <textarea className="form-control customer-textarea" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                        <input type="number" className="form-control" value={editForm.initialDue} onChange={(e) => setEditForm({ ...editForm, initialDue: e.target.value })} />
                        <label className="form-label">Purchase Date</label>
                        <input type="date" className="form-control" value={editForm.purchaseDate} onChange={(e) => setEditForm({ ...editForm, purchaseDate: e.target.value })} />
                        <label className="form-label">Due Payment Date</label>
                        <input type="date" className="form-control" value={editForm.paymentDate} onChange={(e) => setEditForm({ ...editForm, paymentDate: e.target.value })} />
                        <div className="customer-actions">
                          <button className="btn btn-primary btn-sm" onClick={() => saveEdit(customer.id)}>Save</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditingCustomerId(null)}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
