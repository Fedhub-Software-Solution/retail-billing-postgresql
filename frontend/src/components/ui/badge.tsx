import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow',
        secondary:
          'border-transparent bg-gray-100 text-gray-900',
        destructive:
          'border-transparent bg-red-100 text-red-800 border-red-200',
        success:
          'border-transparent bg-green-100 text-green-800 border-green-200',
        warning:
          'border-transparent bg-orange-100 text-orange-800 border-orange-200',
        outline: 'text-gray-700 border-gray-200',
        // Status variants
        active: 'bg-green-100 text-green-800 border-green-200',
        inactive: 'bg-gray-100 text-gray-800 border-gray-200',
        // Type variants
        retail: 'bg-blue-100 text-blue-800 border-blue-200',
        wholesale: 'bg-purple-100 text-purple-800 border-purple-200',
        vip: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

