/* eslint-disable react-refresh/only-export-components */
import React, { createContext } from 'react';
import type { ReactNode } from 'react';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ui/ToastContainer';
import type { ToastContextType } from './toast-types';

export const ToastContext = createContext<ToastContextType | undefined>(undefined);


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

export default ToastProvider;