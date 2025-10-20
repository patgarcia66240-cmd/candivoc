import React from 'react';
import { Toast } from './Toast';
import { useToast } from '../../hooks/useToast';

interface ToastContainerProps {
  limit?: number;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ limit = 3 }) => {
  const { toasts, removeToast } = useToast();

  // Limiter le nombre de toasts affichés
  const visibleToasts = toasts.slice(-limit);

  return (
    <>
      {visibleToasts.map((toast, index) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </>
  );
};

export default ToastContainer;