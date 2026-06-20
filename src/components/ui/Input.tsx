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

// ─── Textarea ─────────────────────────────────────────────────────────────
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={fieldId} className="text-sm font-medium text-ink-strong">
            {label}
            {props.required && <span className="text-error ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          id={fieldId}
          ref={ref}
          className={cn(
            'w-full rounded-lg border bg-white text-sm text-ink-strong',
            'placeholder:text-ink-ghost resize-y min-h-[100px]',
            'transition-colors duration-fast px-3 py-2.5',
            'focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-error focus:ring-error' : 'border-ink-ghost hover:border-ink-subtle',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          {...props}
        />
        {error && <p id={`${fieldId}-error`} className="text-xs text-error" role="alert">{error}</p>}
        {!error && hint && <p id={`${fieldId}-hint`} className="text-xs text-ink-muted">{hint}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

// ─── Select ───────────────────────────────────────────────────────────────
export interface SelectOption { value: string; label: string }

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  placeholder?: string
  options?: SelectOption[]
  // react-hook-form spreads these from register(); accept & ignore them
  min?: string | number
  max?: string | number
  maxLength?: number
  minLength?: number
  pattern?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, placeholder, id, children, options, ...props }, ref) => {
    const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={fieldId} className="text-sm font-medium text-ink-strong">
            {label}
            {props.required && <span className="text-error ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            id={fieldId}
            ref={ref}
            className={cn(
              'w-full rounded-lg border bg-white text-sm text-ink-strong appearance-none',
              'transition-colors duration-fast px-3 py-2.5 pr-9',
              'focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error ? 'border-error focus:ring-error' : 'border-ink-ghost hover:border-ink-subtle',
              className
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options?.map((o: SelectOption) => <option key={o.value} value={o.value}>{o.label}</option>)}
            {children}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
              <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
        {error && <p id={`${fieldId}-error`} className="text-xs text-error" role="alert">{error}</p>}
        {!error && hint && <p id={`${fieldId}-hint`} className="text-xs text-ink-muted">{hint}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
