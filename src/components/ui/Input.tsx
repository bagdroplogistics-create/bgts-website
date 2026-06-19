import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'prefix' | 'suffix'
  > {
  label?: string
  error?: string
  hint?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      prefix,
      suffix,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-ink-strong"
          >
            {label}
            {props.required && (
              <span className="text-error ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {prefix && (
            <div className="absolute left-3 flex items-center text-ink-muted">
              {prefix}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full rounded-lg border bg-white text-sm text-ink-strong',
              'placeholder:text-ink-ghost',
              'transition-colors duration-fast',
              'focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-error focus:ring-error'
                : 'border-ink-ghost hover:border-ink-subtle',
              prefix ? 'pl-10' : 'pl-3',
              suffix ? 'pr-10' : 'pr-3',
              'py-2.5',
              className
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={
              error
                ? `${inputId}-error`
                : hint
                ? `${inputId}-hint`
                : undefined
            }
            {...props}
          />

          {suffix && (
            <div className="absolute right-3 flex items-center text-ink-muted">
              {suffix}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {!error && hint && (
          <p
            id={`${inputId}-hint`}
            className="text-xs text-ink-muted"
          >
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'