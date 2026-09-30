import React, { useEffect } from 'react';
import './Toast.css';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast.visible) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [toast.visible, onClose]);

  if (!toast.visible) return null;

  return (
    <div className={`toast toast-${toast.type}`}>
      <span>{toast.message}</span>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
}
