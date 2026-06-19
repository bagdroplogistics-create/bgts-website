import { cn } from '@/lib/utils'
import type { ConsignmentStatus } from '@/types'

interface StatusBadgeProps {
  status: ConsignmentStatus
  className?: string
  size?: 'sm' | 'md'
}

const statusConfig: Record<
  ConsignmentStatus,
  { label: string; classes: string; dot: string }
> = {
  booked: {
    label: 'Booked',
    classes: 'bg-info/10 text-info border-info/20',
    dot:     'bg-info',
  },
  transit: {
    label: 'In Transit',
    classes: 'bg-brand-subtle text-brand border-brand/20',
    dot:     'bg-brand animate-pulse-brand',
  },
  delayed: {
    label: 'Delayed',
    classes: 'bg-saffron/15 text-saffron-500 border-saffron/20',
    dot:     'bg-saffron',
  },
  delivered: {
    label: 'Delivered',
    classes: 'bg-success/10 text-success border-success/20',
    dot:     'bg-success',
  },
  exception: {
    label: 'Exception',
    classes: 'bg-error/10 text-error border-error/20',
    dot:     'bg-error',
  },
}

export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  const cfg = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono font-medium border rounded-pill',
        size === 'sm' ? 'text-2xs px-2 py-0.5' : 'text-xs px-2.5 py-1',
        cfg.classes,
        className
      )}
    >
      <span
        className={cn(
          'rounded-full shrink-0',
          size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
          cfg.dot
        )}
        aria-hidden="true"
      />
      {cfg.label}
    </span>
  )
}
