import React, { useState, useEffect } from 'react';
import ReceiptModal from './ReceiptModal';
import './POS.css';

export default function POS({ medicines, updateMedicinesStock, onCheckoutSuccess, onCreditSale, onAddCustomer, customers, currentRole }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [cashReceived, setCashReceived] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [creditMode, setCreditMode] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [customerMode, setCustomerMode] = useState('existing');

  // Search filter
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setSearchResults([]);
      return;
    }

    const filtered = medicines.filter(m => 
      m.name.toLowerCase().includes(query) ||
      m.genericName.toLowerCase().includes(query) ||
      m.category.toLowerCase().includes(query)
    );
    setSearchResults(filtered);
  }, [searchQuery, medicines]);

  // Cart operations
  const addToCart = (med) => {
    if (med.stock <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.id === med.id);
      if (existing) {
        // Limit to available stock
        if (existing.quantity >= med.stock) return prev;
        return prev.map(item => 
          item.id === med.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...med, quantity: 1 }];
    });
  };

  const updateCartQty = (id, amount, stock) => {
    setCart(prev => {
      return prev.reduce((acc, item) => {
        if (item.id !== id) return acc.concat(item);
        const newQty = item.quantity + amount;
        if (newQty <= 0) {
          // remove item when quantity goes to zero or below
          return acc;
        }
        if (newQty > stock) {
          // do not exceed available stock
          return acc.concat(item);
        }
        return acc.concat({ ...item, quantity: newQty });
      }, []);
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const calculatedTax = (subtotal - discount) > 0 ? (subtotal - discount) * 0.05 : 0; // 5% VAT
  const total = Math.max(0, subtotal - discount + calculatedTax);
  const enteredPayment = Number(cashReceived || 0);
  const paidAmount = cashReceived === '' ? (creditMode ? 0 : total) : enteredPayment;
  const cashAmount = Math.min(Math.max(0, paidAmount), total);
  const remainingDue = Math.max(0, total - cashAmount);
  const changeGiven = cashAmount > total ? cashAmount - total : 0;
  const customerReady = remainingDue > 0
    ? (customerMode === 'new'
        ? Boolean(customerForm.name.trim() && customerForm.phone.trim() && customerForm.address.trim())
        : Boolean(selectedCustomerId))
    : true;
  const canCompleteSale = cart.length > 0 && (!remainingDue || customerReady);

  // Checkout submission
  const handleCheckout = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (remainingDue > 0 && !customerReady) return;

    let customerInfo = null;
    let customerId = selectedCustomerId;

    if (customerMode === 'new' && customerForm.name.trim() && customerForm.phone.trim() && customerForm.address.trim()) {
      const newCustomer = {
        id: Date.now().toString(),
        name: customerForm.name.trim(),
        phone: customerForm.phone.trim(),
        address: customerForm.address.trim(),
        totalPurchaseAmount: 0,
        cashPaid: 0,
        dueAmount: 0,
        totalDue: 0,
        dueEntries: []
      };
      customerInfo = newCustomer;
      customerId = newCustomer.id;
      onAddCustomer?.(newCustomer);
    } else if (customerMode === 'existing' && selectedCustomerId) {
      customerInfo = customers.find(customer => customer.id === selectedCustomerId) || null;
    }

    const paymentType = remainingDue === 0 ? 'cash' : cashAmount === 0 ? 'due' : 'partial';

    const transaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      salesperson: currentRole === 'Admin' ? 'Upajela (Admin)' : 'Assistant',
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        cost: item.cost
      })),
      subtotal,
      discount,
      tax: calculatedTax,
      total,
      cashReceived: cashAmount,
      changeGiven,
      customer: customerInfo,
      paymentType
    };

    if (customerId && total > 0) {
      onCreditSale(customerId, {
        totalAmount: total,
        cashAmount,
        dueAmount: remainingDue,
        paymentType,
        purchaseDate: new Date().toISOString(),
        invoiceNumber: `TX-${Math.floor(1000 + Math.random() * 9000)}`
      });
    }

    // Update parent state (stock reduction & transaction logs)
    updateMedicinesStock(cart);
    onCheckoutSuccess(transaction);

    // Open receipt modal
    setCurrentTransaction(transaction);
    setShowReceipt(true);
  };

  const handleCloseReceipt = () => {
    // Reset local checkout states
    setCart([]);
    setDiscount(0);
    setCashReceived('');
    setSearchQuery('');
    setSelectedCustomerId('');
    setCreditMode(false);
    setCustomerMode('existing');
    setCustomerForm({ name: '', phone: '', address: '' });
    setShowReceipt(false);
    setCurrentTransaction(null);
  };

  return (
    <div className="page-container pos-page-layout fade-in">
      
      {/* Left panel: Medicine search and grid */}
      <div className="pos-search-panel">
        <div className="glass-card catalog-card">
          <div className="catalog-header">
            <h3>Medicine Catalog</h3>
            <p className="catalog-subtitle">Search by medicine name, chemical compound, or type.</p>
          </div>
          <div className="search-bar-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search e.g. Paracetamol, Napa, Syrup, Sergel..."
              className="form-control pos-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (searchResults.length > 0) {
                    addToCart(searchResults[0]);
                    setSearchQuery('');
                    setSearchResults([]);
                  }
                }
              }}
            />
          </div>

          <div className="search-results-list">
            {searchResults.map(m => {
              const inCartQty = cart.find(c => c.id === m.id)?.quantity || 0;
              const remainingStock = m.stock - inCartQty;
              const isLowStock = remainingStock < 15;

              return (
                <div key={m.id} className="search-med-item">
                  <div className="med-primary-info">
                    <div className="med-name-category">
                      <h4>{m.name}</h4>
                      <span className="badge badge-info">{m.category}</span>
                    </div>
                    <span className="med-generic">{m.genericName}</span>
                    <span className="med-location">📍 Shelf: {m.location}</span>
                  </div>
                  <div className="med-status-action">
                    <div className="med-price-stock">
                      <span className="med-price">৳ {m.price.toFixed(2)}</span>
                      <span className={`med-stock ${remainingStock <= 0 ? 'out-of-stock' : isLowStock ? 'text-warning' : 'in-stock'}`}>
                        {remainingStock <= 0 ? 'Out of stock' : `${remainingStock} available`}
                      </span>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => addToCart(m)}
                      disabled={remainingStock <= 0}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              );
            })}

            {searchQuery.trim() && searchResults.length === 0 && (
              <div className="empty-results-msg">
                <span>❌ No matching medicines found. Try another term.</span>
              </div>
            )}

            {!searchQuery.trim() && (
              <div className="search-prompt-box">
                <span className="prompt-icon">💊</span>
                <h4>Ready to Search</h4>
                <p>Type a brand name, generic formula, or drug type to begin filling a prescription.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right panel: Checkout and Cart details */}
      <div className="pos-checkout-panel">
        <form className="glass-card cart-card" onSubmit={handleCheckout}>
          <div className="cart-header">
            <h3>Active Prescription Cart</h3>
            <span className="cart-count-badge">{cart.reduce((sum, item) => sum + item.quantity, 0)} items</span>
          </div>

          <div className="cart-items-container">
            {cart.map(item => (
              <div key={item.id} className="cart-item-row">
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <span className="cart-item-unit">৳ {item.price.toFixed(2)} each</span>
                </div>
                <div className="cart-item-controls">
                  <div className="qty-selectors">
                    <button 
                      type="button" 
                      className="qty-btn"
                      onClick={() => updateCartQty(item.id, -1, item.stock)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button 
                      type="button" 
                      className="qty-btn"
                      onClick={() => updateCartQty(item.id, 1, item.stock)}
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>
                  <span className="cart-item-total">৳ {(item.price * item.quantity).toFixed(2)}</span>
                  <button 
                    type="button" 
                    className="delete-item-btn"
                    onClick={() => removeFromCart(item.id)}
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="empty-cart-msg">
                <span className="basket-icon">🧺</span>
                <h4>Cart is Empty</h4>
                <p>Select medicines from the search list to add them to this invoice.</p>
              </div>
            )}
          </div>

          <div className="cart-calculation-divider" />

          {/* Pricing Calculations */}
          <div className="billing-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>৳ {subtotal.toFixed(2)}</span>
            </div>

            <div className="summary-row form-row">
              <span>Discount (৳)</span>
              <input
                type="number"
                min="0"
                max={subtotal}
                step="any"
                className="form-control discount-input"
                value={discount === 0 ? '' : discount}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '') return setDiscount(0);
                  const n = parseFloat(v);
                  if (Number.isNaN(n)) return;
                  // clamp between 0 and subtotal
                  setDiscount(Math.max(0, Math.min(subtotal, n)));
                }}
              />
            </div>

            <div className="summary-row">
              <span>VAT / Tax (5%)</span>
              <span>৳ {calculatedTax.toFixed(2)}</span>
            </div>

            <div className="summary-row grand-total-row">
              <span>Grand Total</span>
              <span className="grand-total-val">৳ {total.toFixed(2)}</span>
            </div>

            <div className="summary-row form-row cash-received-row">
              <span>{remainingDue > 0 ? 'Amount Paid (৳)' : 'Cash Received (৳)'}</span>
              <input
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                placeholder="0.00"
                className="form-control cash-received-input"
                value={cashReceived}
                onChange={(e) => {
                  const v = e.target.value;
                  // allow empty string while typing
                  if (v === '') return setCashReceived('');
                  const n = parseFloat(v);
                  if (Number.isNaN(n)) return;
                  setCashReceived(String(Math.max(0, n)));
                }}
              />
            </div>

            {remainingDue > 0 && (
              <div className="summary-row" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>Any remaining amount will be saved as due for the customer.</span>
              </div>
            )}

            <div className="summary-row form-row">
              <span>Payment Mode</span>
              <label className="checkbox-row">
                <input type="checkbox" checked={creditMode} onChange={(e) => setCreditMode(e.target.checked)} />
                <span>Sell on due</span>
              </label>
            </div>

            <div className="summary-row form-row">
              <span>Customer</span>
              <select
                className="form-control"
                value={customerMode}
                onChange={(e) => setCustomerMode(e.target.value)}
                disabled={cart.length === 0}
              >
                <option value="existing">Existing customer</option>
                <option value="new">New customer</option>
              </select>
            </div>

            {customerMode === 'existing' && (
              <div className="summary-row form-row">
                <span>Select Customer</span>
                <select
                  className="form-control"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>{customer.name} • {customer.phone}</option>
                  ))}
                </select>
              </div>
            )}

            {customerMode === 'new' && (
              <div className="customer-pos-form">
                <input
                  className="form-control"
                  placeholder="Customer name"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                />
                <input
                  className="form-control"
                  placeholder="Phone number"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                />
                <input
                  className="form-control"
                  placeholder="Address"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                />
              </div>
            )}

            {(cashReceived !== '' || remainingDue === 0) && (
              <div className="summary-row change-row animate-fade">
                <span>{remainingDue > 0 ? 'Amount Paid' : 'Change Given'}</span>
                <span className="change-val">৳ {remainingDue > 0 ? paidAmount.toFixed(2) : changeGiven.toFixed(2)}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-checkout"
            disabled={!canCompleteSale}
          >
            Complete Sale &amp; Print Invoice 🖨️
          </button>
        </form>
      </div>

      {/* Printable receipt rendering portal */}
      {showReceipt && currentTransaction && (
        <ReceiptModal 
          transaction={currentTransaction} 
          onClose={handleCloseReceipt} 
        />
      )}
    </div>
  );
}
