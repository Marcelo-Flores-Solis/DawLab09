import { createContext } from 'react'

export type ToastType = 'success' | 'error'

export interface Toast {
  id: number
  message: string
  type: ToastType
}

export interface ToastContextValue {
  notify: (message: string, type?: ToastType) => void
}

// El objeto Context vive en su propio módulo para que ToastContext.tsx sólo
// exporte el componente Provider (react-refresh / fast refresh).
export const ToastContext = createContext<ToastContextValue | null>(null)
