import { useState, useEffect } from 'react';

let toastState = {
  message: '',
  type: 'error',
  visible: false,
};

const listeners = new Set();

const notify = (message, type = 'error') => {
  toastState = { message, type, visible: true };
  listeners.forEach(listener => listener(toastState));
};

export const useToast = () => {
  const [toast, setToast] = useState(toastState);

  useEffect(() => {
    const listener = (state) => setToast(state);
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  const hide = () => {
    toastState = { message: '', type: 'error', visible: false };
    listeners.forEach(listener => listener(toastState));
  };

  return { toast, hide, notify };
};

export default useToast;
