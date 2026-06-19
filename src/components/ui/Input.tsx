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
  ({ className, label, error, hint, prefix, suffix, id, ...props }, ref) => {
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
              <span className="text-error ml-1" aria-hidden="true">*</span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
         { leftIcon && (
             <div>{leftIcon}</div>
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
              prefix ? 'pl-9' : 'pl-3',
              suffix ? 'pr-9' : 'pr-3',
              'py-2.5',
              className
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />

         {rightIcon && (
           <div>{rightIcon}</div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-xs text-error" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-xs text-ink-muted">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// ─── Select ───────────────────────────────────────────────────────────────
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: { value: string; label: string; disabled?: boolean }[]
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-ink-strong">
            {label}
            {props.required && (
              <span className="text-error ml-1" aria-hidden="true">*</span>
            )}
          </label>
        )}

        <select
          id={selectId}
          ref={ref}
          className={cn(
            'w-full rounded-lg border bg-white text-sm text-ink-strong',
            'px-3 py-2.5 pr-8',
            'transition-colors duration-fast appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-error focus:ring-error'
              : 'border-ink-ghost hover:border-ink-subtle',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${selectId}-error` : undefined}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23777672' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {error && (
          <p id={`${selectId}-error`} className="text-xs text-error" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p className="text-xs text-ink-muted">{hint}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

// ─── Textarea ─────────────────────────────────────────────────────────────
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-ink-strong">
            {label}
            {props.required && (
              <span className="text-error ml-1" aria-hidden="true">*</span>
            )}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'w-full rounded-lg border bg-white text-sm text-ink-strong',
            'px-3 py-2.5 min-h-[100px] resize-y',
            'placeholder:text-ink-ghost',
            'transition-colors duration-fast',
            'focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-error focus:ring-error'
              : 'border-ink-ghost hover:border-ink-subtle',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />

        {error && (
          <p className="text-xs text-error" role="alert">{error}</p>
        )}
        {!error && hint && (
          <p className="text-xs text-ink-muted">{hint}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
