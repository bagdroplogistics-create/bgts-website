'use client'

import * as React from 'react'
import { Slot, Slottable } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'eko' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const variantClasses: Record<string, string> = {
  primary:
    'bg-brand text-white hover:bg-brand-hover shadow-brand/30 hover:shadow-brand focus-visible:ring-brand',
  secondary:
    'bg-surface-card text-ink-strong border border-ink-ghost hover:border-brand hover:text-brand focus-visible:ring-brand',
  ghost:
    'bg-transparent text-ink-body hover:bg-brand-subtle hover:text-brand focus-visible:ring-brand',
  outline:
    'bg-transparent text-brand border border-brand hover:bg-brand hover:text-white focus-visible:ring-brand',
  eko:
    'bg-eko text-white hover:bg-eko-600 shadow-eko/30 hover:shadow-eko focus-visible:ring-eko',
  danger:
    'bg-brick text-white hover:bg-brick-600 focus-visible:ring-brick',
}

const sizeClasses: Record<string, string> = {
  sm: 'text-sm px-4 py-2 rounded-md gap-1.5',
  md: 'text-sm px-5 py-2.5 rounded-lg gap-2',
  lg: 'text-base px-6 py-3 rounded-lg gap-2',
  xl: 'text-base px-8 py-4 rounded-xl gap-2.5',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      asChild = false,
      loading = false,
      icon,
      iconPosition = 'right',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        className={cn(
          // Base
          'inline-flex items-center justify-center font-display font-semibold',
          'transition-all duration-base ease-out-expo',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'select-none whitespace-nowrap',
          // Variant
          variantClasses[variant],
          // Size
          sizeClasses[size],
          // Hover lift (except ghost/disabled)
          variant !== 'ghost' && 'hover:-translate-y-px active:translate-y-0',
          // Shadow for filled buttons
          (variant === 'primary' || variant === 'eko' || variant === 'danger') &&
            'shadow-sm hover:shadow-md',
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-0.5 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}

        {!loading && icon && iconPosition === 'left' && (
          <span className="shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}

        <Slottable>{children}</Slottable>

        {!loading && icon && iconPosition === 'right' && (
          <span className="shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
      </Comp>
    )
  }
)

Button.displayName = 'Button'
