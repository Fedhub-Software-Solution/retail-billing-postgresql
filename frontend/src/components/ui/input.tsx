import * as React from 'react'
import { cn } from '../../lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm transition-all',
          'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'placeholder:text-gray-400',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }

