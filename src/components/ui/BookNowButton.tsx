'use client'

import { useBookingModal } from '@/contexts/BookingModalContext'
import { cn } from '@/lib/utils'

interface BookNowButtonProps {
  className?: string
  children?: React.ReactNode
  variant?: 'primary' | 'eko' | 'ghost-white'
  size?: 'sm' | 'md' | 'lg'
  modalType?: 'bgts' | 'ev'
}

const variantClasses = {
  primary: 'bg-brand text-white hover:bg-brand-600 shadow-lg shadow-brand/25',
  eko:     'bg-eko   text-white hover:bg-eko-700   shadow-lg shadow-eko/25',
  'ghost-white': 'border border-white/40 text-white hover:bg-white/10',
}

const sizeClasses = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
}

export function BookNowButton({
  className,
  children = 'Book Now',
  variant = 'primary',
  size = 'md',
  modalType = 'bgts',
}: BookNowButtonProps) {
  const { openModal, openEVModal } = useBookingModal()
  return (
    <button
      type="button"
      onClick={modalType === 'ev' ? openEVModal : openModal}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all',
        'hover:-translate-y-0.5 active:translate-y-0',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </button>
  )
}
