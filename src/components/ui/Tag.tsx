import { cn } from '@/lib/utils'

interface TagProps {
  children: React.ReactNode
  variant?: 'brand' | 'eko' | 'neutral' | 'success' | 'warning'
  size?: 'sm' | 'md'
  className?: string
}

const tagVariants: Record<string, string> = {
  brand:   'bg-brand-subtle text-brand border-brand/15',
  eko:     'bg-eko-50 text-eko border-eko/15',
  neutral: 'bg-surface-mid text-ink-muted border-ink-ghost/30',
  success: 'bg-success-light text-success border-success/15',
  warning: 'bg-warning-light text-warning border-warning/15',
}

export function Tag({
  children,
  variant = 'neutral',
  size = 'md',
  className,
}: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-display font-semibold uppercase tracking-wider border rounded-pill',
        size === 'sm' ? 'text-2xs px-2.5 py-0.5' : 'text-xs px-3 py-1',
        tagVariants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
