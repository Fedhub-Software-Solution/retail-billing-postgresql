import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store/store'
import { removeToast } from '../../store/slices/uiSlice'
import { cn } from '../../lib/utils'

const ToastContainer = () => {
  const dispatch = useDispatch()
  const toasts = useSelector((state: RootState) => state.ui.toasts)

  const handleClose = (id: string) => {
    dispatch(removeToast(id))
  }

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      case 'error':
        return <AlertCircle className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      case 'info':
        return <Info className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getStyles = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'relative flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right-5 fade-in-0',
            getStyles(toast.severity)
          )}
          role="alert"
        >
          <div className="flex-shrink-0 mt-0.5">{getIcon(toast.severity)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
          <button
            onClick={() => handleClose(toast.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          {/* Auto-dismiss progress bar */}
          {toast.duration && (
            <div
              className="absolute bottom-0 left-0 h-1 bg-current opacity-20 rounded-b-lg animate-shrink"
              style={{
                animationDuration: `${toast.duration}ms`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
