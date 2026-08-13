import React from 'react';
import './ReceiptModal.css';

export default function ReceiptModal({ transaction, onClose, t }) {
  if (!transaction) return null;

  const text = t?.receipt || {
    invoiceId: 'Invoice ID:',
    date: 'Date:',
    cashier: 'Cashier:',
    customerName: 'Customer Name:',
    phone: 'Phone:',
    medicine: 'Medicine',
    batch: 'Batch',
    qty: 'Qty',
    price: 'Price',
    total: 'Total',
    subtotal: 'Subtotal:',
    discount: 'Discount:',
    tax: 'VAT / Tax (5%):',
    grandTotal: 'GRAND TOTAL:',
    cashReceived: 'Cash Received:',
    changeGiven: 'Change Given:',
    thankYou: 'Thank you for choosing Upazila Pharmacy!',
    wishes: '*** Get Well Soon ***',
    credits: 'Powered by Antigravity OS',
    close: '❌ Close & New Sale',
    print: '🖨️ Print Receipt'
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '-';
    const d = new Date(isoStr);
    if (Number.isNaN(d.getTime())) return String(isoStr);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  };

  const safeNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  return (
    <div className="receipt-overlay">
      <div className="receipt-modal-container">
        
        {/* Printable Receipt Area */}
        <div className="receipt-paper print-area" id="receipt-print-block">
          <div className="receipt-header">
            <h2 className="receipt-shop-title">UPAZILA PHARMACY</h2>
            <p className="receipt-shop-info">Upazila Pharmacy</p>
            <p className="receipt-shop-address">Sherpur, Bogra</p>
            <p className="receipt-shop-phone">Phone: +880 1711-223344</p>
          </div>

          <div className="receipt-divider" />

          <div className="receipt-meta">
            <div><strong>{text.invoiceId}</strong> {transaction.id}</div>
            <div><strong>{text.date}</strong> {formatDate(transaction.timestamp)}</div>
            <div><strong>{text.cashier}</strong> {transaction.salesperson}</div>
            {transaction.customer?.name && (
              <div><strong>{text.customerName}</strong> {transaction.customer.name}</div>
            )}
            {transaction.customer?.phone && (
              <div><strong>{text.phone}</strong> {transaction.customer.phone}</div>
            )}
          </div>

          <div className="receipt-divider" />

          <table className="receipt-items-table">
            <thead>
              <tr>
                <th className="text-left">{text.medicine}</th>
                <th className="text-left">{text.batch}</th>
                <th className="text-center">{text.qty}</th>
                <th className="text-right">{text.price}</th>
                <th className="text-right">{text.total}</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(transaction.items) && transaction.items.map((item, idx) => {
                const isStripBased = item.tabletsPerStrip && item.tabletsPerStrip > 1;
                const qtyDisplay = isStripBased
                  ? `${safeNumber(item.strips, 0)} ${t?.pos?.stripUnit || 'str'} + ${safeNumber(item.looseTablets, 0)} ${t?.pos?.looseTabletsLabel || 'loose'} (${safeNumber(item.totalTablets, 0)})`
                  : safeNumber(item.quantity, 0);
                return (
                  <tr key={idx}>
                    <td className="text-left">{item.name || '-'}</td>
                    <td className="text-left">{item.batchNo || '-'}</td>
                    <td className="text-center">{qtyDisplay}</td>
                    <td className="text-right">৳{safeNumber(item.price, 0).toFixed(2)}</td>
                    <td className="text-right">৳{(safeNumber(item.price, 0) * safeNumber(item.quantity || item.totalTablets, 0)).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="receipt-divider" />

          <div className="receipt-totals">
            <div className="totals-row">
              <span>{text.subtotal}</span>
              <span>৳{safeNumber(transaction.subtotal, 0).toFixed(2)}</span>
            </div>
            {safeNumber(transaction.discount, 0) > 0 && (
              <div className="totals-row">
                <span>{text.discount}</span>
                <span>-৳{safeNumber(transaction.discount, 0).toFixed(2)}</span>
              </div>
            )}
            <div className="totals-row">
              <span>{text.tax}</span>
              <span>৳{safeNumber(transaction.tax, 0).toFixed(2)}</span>
            </div>
            <div className="receipt-divider dashed" />
            <div className="totals-row grand-total">
              <span>{text.grandTotal}</span>
              <span>৳{safeNumber(transaction.total, 0).toFixed(2)}</span>
            </div>
            <div className="receipt-divider dashed" />
            <div className="totals-row">
              <span>{text.cashReceived}</span>
              <span>৳{safeNumber(transaction.cashReceived, 0).toFixed(2)}</span>
            </div>
            <div className="totals-row">
              <span>{text.changeGiven}</span>
              <span>৳{safeNumber(transaction.changeGiven, 0).toFixed(2)}</span>
            </div>
          </div>

          <div className="receipt-divider" />

          <div className="receipt-footer">
            <p>{text.thankYou}</p>
            <p className="wishes">{text.wishes}</p>
            <p className="credits">{text.credits}</p>
          </div>
        </div>

        {/* Action Buttons (Hidden during window.print()) */}
        <div className="receipt-actions no-print">
          <button className="btn btn-secondary" onClick={onClose}>
            {text.close}
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            {text.print}
          </button>
        </div>

      </div>
    </div>
  );
}
