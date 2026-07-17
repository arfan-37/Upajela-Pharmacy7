import React from 'react';
import './ReceiptModal.css';

export default function ReceiptModal({ transaction, onClose, t }) {
  if (!transaction) return null;

  const text = t?.receipt || {
    invoiceId: 'Invoice ID:',
    date: 'Date:',
    cashier: 'Cashier:',
    medicine: 'Medicine',
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
    const d = new Date(isoStr);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
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
          </div>

          <div className="receipt-divider" />

          <table className="receipt-items-table">
            <thead>
              <tr>
                <th className="text-left">{text.medicine}</th>
                <th className="text-center">{text.qty}</th>
                <th className="text-right">{text.price}</th>
                <th className="text-right">{text.total}</th>
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
              <span>{text.subtotal}</span>
              <span>৳{transaction.subtotal.toFixed(2)}</span>
            </div>
            {transaction.discount > 0 && (
              <div className="totals-row">
                <span>{text.discount}</span>
                <span>-৳{transaction.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="totals-row">
              <span>{text.tax}</span>
              <span>৳{transaction.tax.toFixed(2)}</span>
            </div>
            <div className="receipt-divider dashed" />
            <div className="totals-row grand-total">
              <span>{text.grandTotal}</span>
              <span>৳{transaction.total.toFixed(2)}</span>
            </div>
            <div className="receipt-divider dashed" />
            <div className="totals-row">
              <span>{text.cashReceived}</span>
              <span>৳{transaction.cashReceived.toFixed(2)}</span>
            </div>
            <div className="totals-row">
              <span>{text.changeGiven}</span>
              <span>৳{transaction.changeGiven.toFixed(2)}</span>
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
