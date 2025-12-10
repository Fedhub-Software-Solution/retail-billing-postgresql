import { cn } from '../../lib/utils'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
  className?: string
}

const LoadingSpinner = ({ message, size = 'md', fullScreen = false, className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-2',
    lg: 'h-16 w-16 border-4',
  }

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm'
    : 'flex items-center justify-center py-20'

  return (
    <div className={cn(containerClasses, className)}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div
            className={cn(
              'animate-spin rounded-full border-t-purple-600 border-r-indigo-600 border-b-purple-600 border-l-transparent',
              sizeClasses[size]
            )}
          />
          <div
            className={cn(
              'absolute inset-0 animate-spin rounded-full border-t-transparent border-r-transparent border-b-indigo-400 border-l-purple-400 opacity-50',
              sizeClasses[size],
              '[animation-duration:1.5s]'
            )}
          />
        </div>
        {message && (
          <p className="text-sm text-gray-600 animate-pulse">{message}</p>
        )}
      </div>
    </div>
  )
}

export default LoadingSpinner
