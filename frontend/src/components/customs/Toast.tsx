import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const Toast = ({ message, type = 'info', duration = 6000, onClose }) => {
  return (
    <div 
      className={`fixed top-0 left-0 w-full p-4 rounded-md shadow-lg z-50 flex items-center justify-center ${
        type === 'error' ? 'bg-red-500' : 'bg-green-500'
      } text-white`}
      style={{ lineHeight: '1.5', minHeight: '50px' }}
    >
      <span className="text-center font-bold flex-1">{message}</span>
      <button onClick={onClose} className="absolute right-4 text-white hover:text-gray-200">
        <X size={18} />
      </button>
    </div>
  );
};

export const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info', duration = 10000) => {
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
