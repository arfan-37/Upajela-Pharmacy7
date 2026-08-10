import React from 'react';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, t, confirmLabel, cancelLabel }) {
  if (!open) return null;

  const text = t?.common || {};
  const dialogConfirmLabel = confirmLabel || text.yes || 'Yes';
  const dialogCancelLabel = cancelLabel || text.no || 'No';
  const dialogTitle = title || text.confirmDeleteTitle || 'Confirm Delete';
  const dialogMessage = message || text.confirmDelete || 'Are you sure you want to delete this record?';

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{dialogTitle}</h3>
          <button className="modal-close-btn" onClick={onCancel}>×</button>
        </div>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
          {dialogMessage}
        </p>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>{cancelLabel}</button>
          <button className="btn btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
