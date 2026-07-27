import React, { useState, useEffect, useCallback } from 'react';
import './FinanceAuth.css';

const PIN_KEY = 'shabab_finance_pin';

const getStoredPin = () => localStorage.getItem(PIN_KEY) || '1234';
const setStoredPin = (pin) => localStorage.setItem(PIN_KEY, pin);

export default function FinanceAuth({ onVerified, onLocked, t }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isSetup, setIsSetup] = useState(() => !localStorage.getItem(PIN_KEY));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isSetup) {
      if (pin.length < 4) {
        setError('PIN must be at least 4 digits');
        return;
      }
      setStoredPin(pin);
      setIsSetup(false);
      onVerified?.();
      return;
    }

    if (pin === getStoredPin()) {
      onVerified?.();
    } else {
      setError('Incorrect PIN. Please try again.');
    }
    setPin('');
  };

  const handleCancel = () => {
    setPin('');
    setError('');
    onLocked?.();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container finance-auth-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🔒 {isSetup ? 'Set Security PIN' : 'Enter Security PIN'}</h3>
        </div>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px', lineHeight: 1.6 }}>
          {isSetup
            ? 'Create a 4-6 digit PIN to protect financial reports. This PIN will be required every time you access Financial Reports.'
            : 'Please enter your security PIN to access financial reports and profit information.'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{isSetup ? 'Create PIN' : 'Enter PIN'}</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]*"
              className="form-control"
              style={{ fontSize: '24px', textAlign: 'center', letterSpacing: '8px' }}
              placeholder="••••"
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setPin(val);
                setError('');
              }}
              autoFocus
            />
          </div>

          {error && (
            <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={pin.length < 4}>
              {isSetup ? 'Set PIN' : 'Verify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
