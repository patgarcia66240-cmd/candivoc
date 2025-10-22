import { useContext } from 'react';
import { ToastContext } from './ToastContext-only';
import type { ToastContextType } from './toast-types';

export const useToastContext = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};