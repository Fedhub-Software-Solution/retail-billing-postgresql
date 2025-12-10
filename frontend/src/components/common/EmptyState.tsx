import { LucideIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
  iconSize?: 'sm' | 'md' | 'lg'
}

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  iconSize = 'lg',
}: EmptyStateProps) => {
  const iconSizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full blur-xl opacity-50 animate-pulse" />
        <div className="relative w-20 h-20 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-full flex items-center justify-center">
          <Icon className={cn('text-gray-400', iconSizes[iconSize])} />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-sm max-w-md mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
