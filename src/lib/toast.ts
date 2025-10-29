import type { ToastType } from '@/hooks/useToast';

// 🔄 Instance globale de toast pour les besoins hors-composants
// Cette approche évite les contraintes des hooks dans React Query

class GlobalToast {
  private listeners: ((message: string, type: ToastType) => void)[] = []

  subscribe(listener: (message: string, type: ToastType) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notify(message: string, type: ToastType) {
    this.listeners.forEach(listener => listener(message, type))
  }

  success(message: string) {
    this.notify(message, 'success')
  }

  error(message: string) {
    this.notify(message, 'error')
  }

  info(message: string) {
    this.notify(message, 'info')
  }
}

export const toast = new GlobalToast()
