import React, { ReactNode } from 'react';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ui/ToastContainer';
import { ToastContext } from './ToastContext-only';
import type { ToastContextType } from './toast-types';

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const toast = useToast();

  const value: ToastContextType = {
    success: toast.success,
    error: toast.error,
    info: toast.info,
    addToast: toast.addToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};