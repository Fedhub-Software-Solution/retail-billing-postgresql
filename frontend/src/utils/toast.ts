import { store } from '../store/store'
import { addToast } from '../store/slices/uiSlice'

export const showToast = (
  message: string,
  severity: 'success' | 'error' | 'warning' | 'info' = 'info',
  duration?: number
) => {
  // Default duration is 3 seconds (3000ms) if not specified
  const toastDuration = duration ?? 3000
  store.dispatch(addToast({ message, severity, duration: toastDuration }))
}

export const showSuccess = (message: string, duration?: number) => {
  showToast(message, 'success', duration)
}

export const showError = (message: string, duration?: number) => {
  showToast(message, 'error', duration)
}

export const showWarning = (message: string, duration?: number) => {
  showToast(message, 'warning', duration)
}

export const showInfo = (message: string, duration?: number) => {
  showToast(message, 'info', duration)
}

