import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
      type === 'error' ? 'bg-red-500' : 'bg-green-500'
    } text-white flex items-center justify-between`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
        <X size={18} />
      </button>
    </div>
  );
};

export const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type, duration });
  };

  const closeToast = () => {
    setToast(null);
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(closeToast, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const ToastContainer = () => {
    return toast
      ? createPortal(
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={closeToast}
          />,
          document.body
        )
      : null;
  };

  return { showToast, ToastContainer };
};