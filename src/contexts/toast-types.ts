export type ToastType = 'success' | 'error' | 'info';

export interface ToastContextType {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  addToast: (message: string, type: ToastType, duration?: number) => void;
}