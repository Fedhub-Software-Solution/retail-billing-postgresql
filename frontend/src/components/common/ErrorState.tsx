import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { cn } from '../../lib/utils'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
  variant?: 'default' | 'minimal' | 'card'
}

const ErrorState = ({
  title = 'Something went wrong',
  message = 'An error occurred while loading. Please try again.',
  onRetry,
  className,
  variant = 'default',
}: ErrorStateProps) => {
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-2 text-red-600', className)}>
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm">{message}</span>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <Card className={cn('border-red-200 bg-red-50', className)}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">{title}</h3>
              <p className="text-sm text-red-800 mb-4">{message}</p>
              {onRetry && (
                <Button
                  onClick={onRetry}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-red-100 rounded-full blur-xl opacity-50 animate-pulse" />
        <div className="relative w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm max-w-md mb-6 text-center">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  )
}

export default ErrorState

