import React, { useState, useEffect } from 'react';
import ReceiptModal from './ReceiptModal';
import './POS.css';
import ConfirmDialog from './ConfirmDialog';
import { getCurrentSellingBatch, planMedicineSale } from '../utils/inventoryBatchUtils';

export default function POS({ medicines, updateMedicinesStock, onCheckoutSuccess, onCreditSale, onAddCustomer, customers, currentRole, t }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [cashReceived, setCashReceived] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [creditMode, setCreditMode] = useState(false);
  const [purchaseDateMode, setPurchaseDateMode] = useState('auto');
  const [manualPurchaseDate, setManualPurchaseDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [customerMode, setCustomerMode] = useState('existing');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [showBackConfirm, setShowBackConfirm] = useState(false);

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
  const getCartItemQty = (item) => {
    if (item.tabletsPerStrip > 1) return Number(item.totalTablets || 0);
    return Number(item.quantity || 0);
  };

  const setCartItemQty = (item, newQty) => {
    const safeQty = Math.max(1, Math.min(Number(newQty) || 1, item.stock));
    if (item.tabletsPerStrip > 1) {
      const newStrips = Math.floor(safeQty / item.tabletsPerStrip);
      const newLoose = safeQty % item.tabletsPerStrip;
      return { ...item, strips: newStrips, looseTablets: newLoose, totalTablets: safeQty };
    }
    return { ...item, quantity: safeQty };
  };

  const addToCart = (med) => {
    if (med.stock <= 0) return;
    setCheckoutError('');
    setCart(prev => {
      const existing = prev.find(item => item.id === med.id);
      if (existing) {
        const currentQty = getCartItemQty(existing);
        const newQty = currentQty + 1;
        if (newQty > med.stock) return prev;
        return prev.map(item => item.id === med.id ? setCartItemQty(item, newQty) : item);
      }
      if (med.tabletsPerStrip > 1) {
        return [...prev, { ...med, strips: 1, looseTablets: 0, totalTablets: med.tabletsPerStrip }];
      }
      return [...prev, { ...med, quantity: 1 }];
    });
  };

  const updateCartQty = (id, amount, stock) => {
    setCheckoutError('');
    setCart(prev => {
      return prev.reduce((acc, item) => {
        if (item.id !== id) return acc.concat(item);
        const currentQty = getCartItemQty(item);
        const newQty = currentQty + amount;
        if (newQty <= 0) return acc;
        if (newQty > stock) return acc.concat(item);
        return acc.concat(setCartItemQty(item, newQty));
      }, []);
    });
  };

  const updateCartStrips = (id, delta, stock) => {
    setCheckoutError('');
    setCart(prev => {
      return prev.reduce((acc, item) => {
        if (item.id !== id || item.tabletsPerStrip <= 1) return acc.concat(item);
        const currentStrips = Number(item.strips || 0);
        const currentLoose = Number(item.looseTablets || 0);
        const newStrips = Math.max(0, currentStrips + delta);
        const newTotal = newStrips * item.tabletsPerStrip + currentLoose;
        if (newTotal > stock) return acc.concat(item);
        if (newTotal <= 0) return acc.concat({ ...item, strips: 0, looseTablets: 0, totalTablets: 0 });
        return acc.concat({ ...item, strips: newStrips, totalTablets: newTotal });
      }, []);
    });
  };

  const updateCartLoose = (id, delta, stock) => {
    setCheckoutError('');
    setCart(prev => {
      return prev.reduce((acc, item) => {
        if (item.id !== id || item.tabletsPerStrip <= 1) return acc.concat(item);
        const currentStrips = Number(item.strips || 0);
        const currentLoose = Number(item.looseTablets || 0);
        const newLoose = Math.max(0, currentLoose + delta);
        const newTotal = currentStrips * item.tabletsPerStrip + newLoose;
        if (newTotal > stock) return acc.concat(item);
        if (newTotal <= 0) return acc.concat({ ...item, strips: 0, looseTablets: 0, totalTablets: 0 });
        return acc.concat({ ...item, looseTablets: newLoose, totalTablets: newTotal });
      }, []);
    });
  };

  const removeFromCart = (id) => {
    setCheckoutError('');
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Delete confirmation for cart items
  const [cartDeleteId, setCartDeleteId] = useState(null);
  const [isCartDeleteDialogOpen, setIsCartDeleteDialogOpen] = useState(false);

  const handleCartDeleteClick = (id) => {
    setCartDeleteId(id);
    setIsCartDeleteDialogOpen(true);
  };

  const confirmCartDelete = () => {
    if (cartDeleteId != null) {
      removeFromCart(cartDeleteId);
    }
    setCartDeleteId(null);
    setIsCartDeleteDialogOpen(false);
  };

  const cancelCartDelete = () => {
    setCartDeleteId(null);
    setIsCartDeleteDialogOpen(false);
  };

  const salePlan = cart.flatMap((item) => {
    const currentMedicine = medicines.find((medicine) => medicine.id === item.id) || item;
    const qty = item.tabletsPerStrip > 1 ? (item.totalTablets || 0) : (item.quantity || 0);
    const plan = planMedicineSale(currentMedicine, qty);
    return plan.saleLines.map((line) => ({
      ...line,
      cartItemId: item.id,
    }));
  });

  const salePlanByCartItem = salePlan.reduce((acc, line) => {
    if (!acc[line.cartItemId]) acc[line.cartItemId] = [];
    acc[line.cartItemId].push(line);
    return acc;
  }, {});

  // Calculations
  const subtotal = salePlan.reduce((sum, line) => sum + Number(line.lineTotal || 0), 0);
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
    setCheckoutError('');
    if (isProcessing) return;
    if (cart.length === 0) {
      setCheckoutError(t.pos?.emptyCartTitle || 'Cart is empty.');
      return;
    }
    if (remainingDue > 0 && !customerReady) {
      setCheckoutError(t.pos?.customerRequired || 'Customer information is required for due sales.');
      return;
    }

    if (!Array.isArray(salePlan) || salePlan.length === 0) {
      setCheckoutError(t.pos?.noSellableBatches || 'No sellable batches available for the selected items.');
      return;
    }

    setIsProcessing(true);

    try {
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

      const transactionItems = salePlan.map((line) => {
        const cartItem = cart.find(ci => ci.id === line.medicineId);
        return {
          id: `${line.medicineId}-${line.batchNumber}`,
          medicineId: line.medicineId,
          name: line.medicineName,
          genericName: line.genericName,
          category: line.category,
          batchNumber: line.batchNumber,
          batchNo: line.batchLabel,
          quantity: line.quantity,
          price: line.price,
          cost: line.cost,
          expiryDate: line.expiryDate,
          shelfLocation: line.shelfLocation,
          strips: cartItem?.tabletsPerStrip > 1 ? (cartItem.strips || 0) : undefined,
          looseTablets: cartItem?.tabletsPerStrip > 1 ? (cartItem.looseTablets || 0) : undefined,
          totalTablets: cartItem?.tabletsPerStrip > 1 ? (cartItem.totalTablets || line.quantity) : undefined,
          tabletsPerStrip: cartItem?.tabletsPerStrip > 1 ? cartItem.tabletsPerStrip : undefined,
        };
      });

      const calculatedSubtotal = salePlan.reduce((sum, line) => sum + Number(line.lineTotal || 0), 0);
      const calculatedTax = (calculatedSubtotal - discount) > 0 ? (calculatedSubtotal - discount) * 0.05 : 0;
      const calculatedTotal = Math.max(0, calculatedSubtotal - discount + calculatedTax);
      const enteredPayment = Number(cashReceived || 0);
      const paidAmountForReceipt = cashReceived === '' ? (creditMode ? 0 : calculatedTotal) : enteredPayment;
      const cashAmount = Math.min(Math.max(0, paidAmountForReceipt), calculatedTotal);
      const changeGiven = cashAmount > calculatedTotal ? cashAmount - calculatedTotal : 0;
      const remainingDueForReceipt = Math.max(0, calculatedTotal - cashAmount);
      const paymentType = remainingDueForReceipt === 0 ? 'cash' : cashAmount === 0 ? 'due' : 'partial';
      const selectedPurchaseDate = purchaseDateMode === 'manual' && manualPurchaseDate
        ? new Date(manualPurchaseDate).toISOString()
        : new Date().toISOString();

      const transaction = {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: selectedPurchaseDate,
        salesperson: currentRole === 'Admin' ? 'Upazila (Admin)' : 'Assistant',
        items: transactionItems,
        subtotal: calculatedSubtotal,
        discount,
        tax: calculatedTax,
        total: calculatedTotal,
        cashReceived: cashAmount,
        changeGiven,
        customer: customerInfo,
        paymentType,
        salePlan: transactionItems,
      };

      if (customerId && calculatedTotal > 0) {
        onCreditSale(customerId, {
          products: transactionItems,
          totalAmount: calculatedTotal,
          cashAmount,
          dueAmount: remainingDueForReceipt,
          paymentType,
          purchaseDate: selectedPurchaseDate,
          invoiceNumber: transaction.id
        });
      }

      updateMedicinesStock(transactionItems);
      onCheckoutSuccess(transaction);

      setCurrentTransaction(transaction);
      setShowReceipt(true);
    } catch (err) {
      console.error('Checkout failed:', err);
      setCheckoutError(err?.message || 'Something went wrong while completing the sale. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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

  const handleBackClick = () => {
    if (cart.length > 0) {
      setShowBackConfirm(true);
    } else {
      clearCartAndReset();
    }
  };

  const clearCartAndReset = () => {
    setCart([]);
    setDiscount(0);
    setCashReceived('');
    setSearchQuery('');
    setSelectedCustomerId('');
    setCreditMode(false);
    setCustomerMode('existing');
    setCustomerForm({ name: '', phone: '', address: '' });
    setShowBackConfirm(false);
  };

  const confirmBackAndLeave = () => {
    clearCartAndReset();
  };

  const cancelBack = () => {
    setShowBackConfirm(false);
  };

  return (
    <div>
      <div className="page-container pos-page-layout fade-in">
      
      {/* Left panel: Medicine search and grid */}
      <div className="pos-search-panel">
        <div className="glass-card catalog-card">
          <div className="catalog-header">
            <h3>{t.pos.catalogTitle}</h3>
            <p className="catalog-subtitle">{t.pos.catalogSubtitle}</p>
          </div>
          <div className="search-bar-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder={t.pos.searchPlaceholder}
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
              const inCartQty = cart.find(c => c.id === m.id) ? (cart.find(c => c.id === m.id).tabletsPerStrip > 1 ? (cart.find(c => c.id === m.id).totalTablets || 0) : (cart.find(c => c.id === m.id).quantity || 0)) : 0;
              const remainingStock = m.stock - inCartQty;
              const isLowStock = remainingStock < 15;
              const currentSellingBatch = getCurrentSellingBatch(m);

              return (
                <div key={m.id} className="search-med-item">
                  <div className="med-primary-info">
                    <div className="med-name-category">
                      <h4>{m.name}</h4>
                      <span className="badge badge-info">{m.category}</span>
                    </div>
                    <span className="med-generic">{m.genericName}</span>
                    <span className="med-location">📍 Shelf: {m.location}</span>
                    {currentSellingBatch && (
                      <span className="current-selling-batch-indicator">
                        Current Selling Batch: <strong>{currentSellingBatch.batchLabel}</strong> — Stock: {currentSellingBatch.quantity}
                      </span>
                    )}
                  </div>
                  <div className="med-status-action">
                    <div className="med-price-stock">
                      <span className="med-price">৳ {m.price.toFixed(2)}</span>
                      <span className={`med-stock ${remainingStock <= 0 ? 'out-of-stock' : isLowStock ? 'text-warning' : 'in-stock'}`}>
                        {remainingStock <= 0 ? t.pos.outOfStock : t.pos.available.replace('{count}', remainingStock)}
                      </span>
                      <span className="med-stock" style={{ color: 'var(--text-muted)' }}>
                        Available Stock: {currentSellingBatch ? currentSellingBatch.quantity : m.stock}
                      </span>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => addToCart(m)}
                      disabled={remainingStock <= 0}
                    >
                      {t.pos.add}
                    </button>
                  </div>
                </div>
              );
            })}

            {searchQuery.trim() && searchResults.length === 0 && (
              <div className="empty-results-msg">
                <span>{t.pos.noResults}</span>
              </div>
            )}

            {!searchQuery.trim() && (
              <div className="search-prompt-box">
                <span className="prompt-icon">💊</span>
                <h4>{t.pos.readyTitle}</h4>
                <p>{t.pos.readyDesc}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right panel: Checkout and Cart details */}
      <div className="pos-checkout-panel">
        <form className="glass-card cart-card" onSubmit={handleCheckout}>
          <div className="cart-header">
            <div className="cart-header-left">
              <button type="button" className="btn btn-secondary cart-back-btn" onClick={handleBackClick} title="Clear cart and start over">
                {t.pos.backButton || '← Back'}
              </button>
              <h3>{t.pos.cartTitle}</h3>
            </div>
            <span className="cart-count-badge">
              {cart.reduce((sum, item) => sum + (item.totalTablets || item.quantity || 0), 0)} {t.pos.itemsLabel}
            </span>
          </div>

          <div className="cart-items-container">
            {cart.map(item => (
              (() => {
                const currentMedicine = medicines.find((medicine) => medicine.id === item.id) || item;
                const currentSellingBatch = getCurrentSellingBatch(currentMedicine);

                return (
              <div key={item.id} className="cart-item-row">
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  {item.tabletsPerStrip > 1 && (
                    <span className="cart-item-unit" style={{ color: 'var(--info)', fontWeight: 600 }}>
                      1 {t.pos?.stripUnit || 'Strip'} = {item.tabletsPerStrip} {t.pos?.tabletUnit || 'Tablets'}
                    </span>
                  )}
                  <span className="cart-item-unit">
                    {salePlanByCartItem[item.id]?.length > 0 && salePlanByCartItem[item.id].length > 1
                      ? t.pos.batchWiseBilling || 'Batch-wise pricing'
                      : `৳ ${item.price.toFixed(2)} ${item.tabletsPerStrip > 1 ? t.pos?.perTablet || 'per tablet' : t.pos?.each || 'each'}`}
                  </span>
                  {salePlanByCartItem[item.id]?.length > 0 && (
                    <span className="cart-item-unit" style={{ display: 'block', fontSize: '11px' }}>
                      {salePlanByCartItem[item.id].map((line) => line.batchLabel).join(', ')}
                    </span>
                  )}
                  <span className="cart-item-unit" style={{ display: 'block', fontSize: '11px' }}>
                    Current Selling Batch: {currentSellingBatch?.batchLabel || '-'} · Available Stock: {currentSellingBatch?.quantity ?? currentMedicine.stock ?? 0}
                  </span>
                </div>
                <div className="cart-item-controls">
                  {item.tabletsPerStrip > 1 ? (
                    <div className="strip-qty-controls">
                      <div className="strip-qty-row">
                        <span className="strip-label">{t.pos?.stripsLabel || 'Strips'}:</span>
                      <div className="qty-selectors">
                        <button type="button" className="qty-btn" onClick={() => updateCartStrips(item.id, -1, item.stock)} disabled={Number(item.strips || 0) <= 0}>-</button>
                        <span className="qty-value">{Number(item.strips || 0)}</span>
                        <button type="button" className="qty-btn" onClick={() => updateCartStrips(item.id, 1, item.stock)} disabled={(Number(item.strips || 0) * item.tabletsPerStrip) >= item.stock}>+</button>
                      </div>
                    </div>
                    <div className="strip-qty-row">
                      <span className="strip-label">{t.pos?.looseTabletsLabel || 'Loose Tablets'}:</span>
                      <div className="qty-selectors">
                        <button type="button" className="qty-btn" onClick={() => updateCartLoose(item.id, -1, item.stock)} disabled={Number(item.looseTablets || 0) <= 0}>-</button>
                        <span className="qty-value">{Number(item.looseTablets || 0)}</span>
                        <button type="button" className="qty-btn" onClick={() => updateCartLoose(item.id, 1, item.stock)} disabled={(Number(item.strips || 0) * item.tabletsPerStrip + Number(item.looseTablets || 0)) >= item.stock}>+</button>
                      </div>
                    </div>
                    <div className="strip-qty-row total-tablets-row">
                      <span className="strip-label">{t.pos?.totalTabletsLabel || 'Total Tablets'}:</span>
                      <span className="qty-value total-tablets-value">{Number(item.totalTablets || 0)}</span>
                    </div>
                    </div>
                  ) : (
                    <div className="qty-selectors">
                      <button type="button" className="qty-btn" onClick={() => updateCartQty(item.id, -1, item.stock)} disabled={getCartItemQty(item) <= 1}>-</button>
                      <span className="qty-value">{getCartItemQty(item)}</span>
                      <button type="button" className="qty-btn" onClick={() => updateCartQty(item.id, 1, item.stock)} disabled={getCartItemQty(item) >= item.stock}>+</button>
                    </div>
                  )}
                  <span className="cart-item-total">৳ {(salePlanByCartItem[item.id]?.reduce((sum, line) => sum + Number(line.lineTotal || 0), 0) || (Number(item.price || 0) * getCartItemQty(item))).toFixed(2)}</span>
                  <button type="button" className="delete-item-btn" onClick={() => handleCartDeleteClick(item.id)} title="Remove item">🗑️</button>
                </div>
              </div>
                );
              })()
            ))}

            {cart.length === 0 && (
              <div className="empty-cart-msg">
                <span className="basket-icon">🧺</span>
                <h4>{t.pos.emptyCartTitle}</h4>
                <p>{t.pos.emptyCartDesc}</p>
              </div>
            )}
          </div>

          <div className="cart-calculation-divider" />

          {/* Pricing Calculations */}
          <div className="billing-summary">
            <div className="summary-row">
              <span>{t.pos.subtotal}</span>
              <span>৳ {subtotal.toFixed(2)}</span>
            </div>

            <div className="summary-row form-row">
              <span>{t.pos.discount}</span>
              <input
                type="number"
                min="0"
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
              <span>{t.pos.tax}</span>
              <span>৳ {calculatedTax.toFixed(2)}</span>
            </div>

            <div className="summary-row grand-total-row">
              <span>{t.pos.total}</span>
              <span className="grand-total-val">৳ {total.toFixed(2)}</span>
            </div>

            <div className="summary-row form-row cash-received-row">
              <span>{remainingDue > 0 ? t.pos.amountPaid : t.pos.cashReceived}</span>
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
                <span>{t.pos.dueHint}</span>
              </div>
            )}

            <div className="summary-row form-row">
              <span>{t.pos.paymentMode}</span>
              <label className="checkbox-row">
                <input type="checkbox" checked={creditMode} onChange={(e) => setCreditMode(e.target.checked)} />
                <span>{t.pos.sellOnDue}</span>
              </label>
            </div>

            <div className="summary-row form-row">
              <span>{t.pos.billingDateLabel}</span>
              <div className="billing-date-controls">
                <label className="radio-row">
                  <input
                    type="radio"
                    name="purchaseDateMode"
                    value="auto"
                    checked={purchaseDateMode === 'auto'}
                    onChange={() => setPurchaseDateMode('auto')}
                  />
                  <span>{t.pos.autoDateLabel}</span>
                </label>
                <label className="radio-row">
                  <input
                    type="radio"
                    name="purchaseDateMode"
                    value="manual"
                    checked={purchaseDateMode === 'manual'}
                    onChange={() => setPurchaseDateMode('manual')}
                  />
                  <span>{t.pos.manualDateLabel}</span>
                </label>
              </div>
            </div>

            {purchaseDateMode === 'manual' ? (
              <div className="summary-row form-row">
                <span>{t.pos.purchaseDate}</span>
                <input
                  type="datetime-local"
                  className="form-control billing-date-input"
                  value={manualPurchaseDate}
                  onChange={(e) => setManualPurchaseDate(e.target.value)}
                  max={new Date().toISOString().slice(0, 16)}
                />
              </div>
            ) : (
              <div className="summary-row form-row">
                <span>{t.pos.purchaseDate}</span>
                <span className="billing-date-note">{t.pos.dateNow}</span>
              </div>
            )}

            <div className="summary-row form-row">
              <span>{t.pos.customer}</span>
              <select
                className="form-control"
                value={customerMode}
                onChange={(e) => setCustomerMode(e.target.value)}
                disabled={cart.length === 0}
              >
                <option value="existing">{t.pos.existingCustomer}</option>
                <option value="new">{t.pos.newCustomer}</option>
              </select>
            </div>

            {customerMode === 'existing' && (
              <div className="summary-row form-row">
                <span>{t.pos.selectCustomer}</span>
                <select
                  className="form-control"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                >
                  <option value="">{t.pos.selectPlaceholder}</option>
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
            disabled={!canCompleteSale || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Complete Sale & Print Invoice 🖨️'}
          </button>
          {checkoutError && (
            <div style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '8px', fontWeight: 600 }}>
              {checkoutError}
            </div>
          )}
        </form>
      </div>
    </div>

    {/* Printable receipt rendering portal */}
    {showReceipt && currentTransaction && (
      <ReceiptModal 
        transaction={currentTransaction} 
        onClose={handleCloseReceipt}
        t={t}
      />
    )}

    <ConfirmDialog
      open={isCartDeleteDialogOpen}
      title={t.common.confirmDeleteTitle}
      message={t.common.confirmDelete}
      onConfirm={confirmCartDelete}
      onCancel={cancelCartDelete}
      t={t}
    />

    <ConfirmDialog
      open={showBackConfirm}
      title={t.pos.backTitle || 'Clear Cart?'}
      message={t.pos.backMessage || 'You have unsaved items in your cart. Do you want to clear the cart and start over, or continue your current sale?'}
      onConfirm={confirmBackAndLeave}
      onCancel={cancelBack}
      t={t}
      confirmLabel={t.pos.clearCart || 'Clear Cart'}
      cancelLabel={t.pos.continueSale || 'Continue Sale'}
    />
    </div>
  );
}
