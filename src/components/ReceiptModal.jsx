import React from 'react';
import './ReceiptModal.css';

export default function ReceiptModal({ transaction, onClose }) {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (isoStr) => {
    const d = new Date(isoStr);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  };

  return (
    <div className="receipt-overlay">
      <div className="receipt-modal-container">
        
        {/* Printable Receipt Area */}
        <div className="receipt-paper print-area" id="receipt-print-block">
          <div className="receipt-header">
            <h2 className="receipt-shop-title">UPAJELA PHARMACY</h2>
            <p className="receipt-shop-info">Upajela Pharmacy</p>
            <p className="receipt-shop-address">House 42, Road 11, Banani, Dhaka</p>
            <p className="receipt-shop-phone">Phone: +880 1711-223344</p>
          </div>

          <div className="receipt-divider" />

          <div className="receipt-meta">
            <div><strong>Invoice ID:</strong> {transaction.id}</div>
            <div><strong>Date:</strong> {formatDate(transaction.timestamp)}</div>
            <div><strong>Cashier:</strong> {transaction.salesperson}</div>
          </div>

          <div className="receipt-divider" />

          <table className="receipt-items-table">
            <thead>
              <tr>
                <th className="text-left">Medicine</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Price</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {transaction.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="text-left">{item.name}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-right">৳{item.price.toFixed(2)}</td>
                  <td className="text-right">৳{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="receipt-divider" />

          <div className="receipt-totals">
            <div className="totals-row">
              <span>Subtotal:</span>
              <span>৳{transaction.subtotal.toFixed(2)}</span>
            </div>
            {transaction.discount > 0 && (
              <div className="totals-row">
                <span>Discount:</span>
                <span>-৳{transaction.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="totals-row">
              <span>VAT / Tax (5%):</span>
              <span>৳{transaction.tax.toFixed(2)}</span>
            </div>
            <div className="receipt-divider dashed" />
            <div className="totals-row grand-total">
              <span>GRAND TOTAL:</span>
              <span>৳{transaction.total.toFixed(2)}</span>
            </div>
            <div className="receipt-divider dashed" />
            <div className="totals-row">
              <span>Cash Received:</span>
              <span>৳{transaction.cashReceived.toFixed(2)}</span>
            </div>
            <div className="totals-row">
              <span>Change Given:</span>
              <span>৳{transaction.changeGiven.toFixed(2)}</span>
            </div>
          </div>

          <div className="receipt-divider" />

          <div className="receipt-footer">
            <p>Thank you for choosing Upajela Pharmacy!</p>
            <p className="wishes">*** Get Well Soon ***</p>
            <p className="credits">Powered by Antigravity OS</p>
          </div>
        </div>

        {/* Action Buttons (Hidden during window.print()) */}
        <div className="receipt-actions no-print">
          <button className="btn btn-secondary" onClick={onClose}>
            ❌ Close &amp; New Sale
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            🖨️ Print Receipt
          </button>
        </div>

      </div>
    </div>
  );
}
