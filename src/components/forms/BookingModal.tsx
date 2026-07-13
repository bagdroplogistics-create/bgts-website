'use client'

import { useState, useCallback } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, CheckCircle, Zap, Hash, ChevronDown, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useBookingModal } from '@/contexts/BookingModalContext'
import { cn } from '@/lib/utils'

// ─── Schema ───────────────────────────────────────────────────────────────

const schema = z.object({
  vehicleType:         z.string().min(1, 'Please select a vehicle'),
  pickupCity:          z.string().min(2, 'Enter origin city'),
  deliveryCity:        z.string().min(2, 'Enter destination city'),
  pickupDate:          z.string().min(1, 'Select pickup date'),
  pickupTime:          z.string().min(1, 'Select pickup time'),
  goodsType:           z.string().min(1, 'Select goods type'),
  weightRange:         z.string().min(1, 'Select weight range'),
  fullName:            z.string().min(2, 'Enter your full name'),
  mobile:              z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile'),
  email:               z.string().email('Enter valid email'),
  companyName:         z.string().optional(),
  specialInstructions: z.string().optional(),
})

type FormData = z.infer<typeof schema>

// ─── Vehicle Fleet ─────────────────────────────────────────────────────────

type VehicleCategory = 'Small' | 'Medium' | 'Heavy' | 'Container' | 'ODC'

interface Vehicle {
  id: string
  name: string
  category: VehicleCategory
  emoji: string
  size?: string
  householdCapacity?: string
  maxLoad: string
}

const VEHICLES: Vehicle[] = [
  // Small
  { id: 'tata-ace',               name: 'TATA ACE',              category: 'Small',     emoji: '🛺', size: '7×4.8×4.8 ft', householdCapacity: '1 BHK',   maxLoad: '850 Kgs'  },
  { id: 'ashok-leyland-dost',     name: 'ASHOK LEYLAND DOST',    category: 'Small',     emoji: '🚐', size: '7×4.8×4.8 ft', householdCapacity: '1 BHK',   maxLoad: '1 Ton'    },
  { id: 'mahindra-bolero-pickup', name: 'MAHINDRA BOLERO PICKUP', category: 'Small',    emoji: '🛻', size: '8×4.8×4.8 ft', householdCapacity: '1 BHK',   maxLoad: '1.5 Ton'  },
  // Medium
  { id: 'tata-407',               name: 'TATA 407',              category: 'Medium',    emoji: '🚚', householdCapacity: '1.5 BHK', maxLoad: '2.5 Ton'  },
  { id: 'eicher-14ft',            name: 'EICHER 14 FEET',        category: 'Medium',    emoji: '🚛', householdCapacity: '2 BHK',   maxLoad: '4 Ton'    },
  { id: 'eicher-17ft',            name: 'EICHER 17 FEET',        category: 'Medium',    emoji: '🚛', householdCapacity: '2.5 BHK', maxLoad: '5 Ton'    },
  { id: 'eicher-19ft',            name: 'EICHER 19 FEET',        category: 'Medium',    emoji: '🚛', householdCapacity: '2.5 BHK', maxLoad: '7–9 Ton'  },
  { id: 'tata-22ft',              name: 'TATA 22 FEET',          category: 'Medium',    emoji: '🚛', householdCapacity: '3 BHK',   maxLoad: '10 Ton'   },
  // Heavy
  { id: 'tata-truck-6tyre',       name: 'TATA TRUCK 6 TYRE',    category: 'Heavy',     emoji: '🚚', maxLoad: '9 Ton'    },
  { id: 'taurus-16t',             name: 'TAURUS 16T 10 TYRE',   category: 'Heavy',     emoji: '🚛', maxLoad: '16 Ton'   },
  { id: 'taurus-21t',             name: 'TAURUS 21T 12 TYRE',   category: 'Heavy',     emoji: '🚛', maxLoad: '21 Ton'   },
  { id: 'taurus-25t',             name: 'TAURUS 25T 14 TYRE',   category: 'Heavy',     emoji: '🚛', maxLoad: '25 Ton'   },
  // Container
  { id: 'container-20ft',         name: 'CONTAINER 20 FT',      category: 'Container', emoji: '📦', householdCapacity: '4 BHK', maxLoad: '6.5 Ton'  },
  { id: 'container-32ft-sxl',     name: 'CONTAINER 32 FT SXL',  category: 'Container', emoji: '📦', householdCapacity: '5 BHK', maxLoad: '7 Ton'    },
  { id: 'container-32ft-mxl',     name: 'CONTAINER 32 FT MXL',  category: 'Container', emoji: '📦', maxLoad: '14 Ton'   },
  { id: 'container-32ft-hq',      name: 'CONTAINER 32 FT HQ',   category: 'Container', emoji: '📦', maxLoad: '7/14 Ton' },
  // ODC
  { id: 'odc-20ft',               name: '20 FT OPEN ODC',        category: 'ODC',      emoji: '🏗️', maxLoad: '7 Ton'    },
  { id: 'odc-28-32ft-jcb',        name: '28–32 FT JCB ODC',      category: 'ODC',      emoji: '🏗️', maxLoad: '8 Ton'    },
  { id: 'odc-32ft-trailer',       name: '32 FT TRAILER ODC',     category: 'ODC',      emoji: '🏗️', maxLoad: '25 Ton'   },
  { id: 'odc-40ft-trailer',       name: '40 FT TRAILER ODC',     category: 'ODC',      emoji: '🏗️', maxLoad: '32 Ton'   },
]

const BADGE_COLOR: Record<VehicleCategory, string> = {
  'Small':     'bg-blue-100 text-blue-700',
  'Medium':    'bg-green-100 text-green-700',
  'Heavy':     'bg-orange-100 text-orange-700',
  'Container': 'bg-purple-100 text-purple-700',
  'ODC':       'bg-red-100 text-red-700',
}

// ─── Form constants ────────────────────────────────────────────────────────

const GOODS_TYPES = [
  'Electronics', 'FMCG', 'Industrial Materials', 'Retail Products',
  'Documents', 'E-commerce Packages', 'Food Products',
  'Pharma & Healthcare', 'Textiles & Apparel', 'Auto Parts', 'Other',
]
const WEIGHT_RANGES = [
  'Under 50 KG', '50–200 KG', '200–500 KG', '500 KG–1 Ton',
  '1–5 Ton', '5–10 Ton', '10–20 Ton', 'Above 20 Ton',
]
const TIME_SLOTS = [
  '06:00 AM','07:00 AM','08:00 AM','09:00 AM','10:00 AM',
  '11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM',
  '04:00 PM','05:00 PM','06:00 PM','07:00 PM','08:00 PM',
]

function genRef() {
  return 'BGTSEV' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

// ─── Field helpers ─────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-bold text-ink-strong mb-1.5 uppercase tracking-wide">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}
function Err({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-red-500 font-medium">{msg}</p>
}
const field = (err?: string) => cn(
  'w-full rounded-lg border px-3.5 py-2.5 text-sm bg-white',
  'focus:outline-none focus:ring-2 focus:ring-eko/40 focus:border-eko transition-colors',
  err ? 'border-red-400 bg-red-50/30' : 'border-ink-ghost/25 hover:border-eko/50'
)
function SelectField({ value, onChange, options, placeholder, error }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string; error?: string
}) {
  return (
    <div>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)}
          className={cn(field(error), 'appearance-none pr-9', !value && 'text-ink-ghost')}>
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-ghost pointer-events-none" />
      </div>
      <Err msg={error} />
    </div>
  )
}

// ─── Step 1: Vehicle Selection ─────────────────────────────────────────────
// Layout: sticky header + scrollable grid body + sticky footer
// Cards: compact flat grid, 4 cols desktop / 3 tablet / 2 sm / 1 mobile

function StepVehicle({ selected, onSelect, onNext, onClose }: {
  selected: string; onSelect: (id: string) => void; onNext: () => void; onClose: () => void
}) {
  const selectedVehicle = VEHICLES.find(v => v.id === selected)

  return (
    <div className="flex flex-col h-full">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b border-ink-ghost/10 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-eko flex items-center justify-center shrink-0">
            <Zap size={13} className="text-white" />
          </div>
          <div>
            <p className="font-display font-black text-xs text-ink-strong leading-none">Step 1 of 2</p>
            <p className="text-2xs text-ink-muted">Select your vehicle type</p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close"
          className="w-7 h-7 rounded-full bg-ink-ghost/10 hover:bg-ink-ghost/20 flex items-center justify-center transition-colors">
          <X size={14} className="text-ink-muted" />
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4">

        <div className="mb-4">
          <h2 className="font-display font-black text-lg text-ink-strong leading-tight">
            Choose Your Vehicle
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            20 fleet options — Small, Medium, Heavy, Container & ODC
          </p>
        </div>

        {/* Flat 4-col grid — all 20 vehicles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2.5">
          {VEHICLES.map(v => {
            const active = selected === v.id
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelect(v.id)}
                className={cn(
                  'relative text-left rounded-xl border-2 p-3 transition-all duration-150',
                  'hover:shadow-sm hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-eko',
                  active
                    ? 'border-eko bg-eko/5 shadow-sm shadow-eko/15'
                    : 'border-gray-200 bg-white hover:border-eko/40'
                )}
              >
                {/* Selected tick */}
                {active && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-eko flex items-center justify-center">
                    <Check size={9} className="text-white" />
                  </div>
                )}

                {/* Category badge */}
                {!active && (
                  <span className={cn(
                    'absolute top-2 right-2 text-2xs px-1.5 py-0.5 rounded-full font-semibold leading-none',
                    BADGE_COLOR[v.category]
                  )}>
                    {v.category}
                  </span>
                )}

                {/* Emoji */}
                <div className="text-2xl leading-none mb-2">{v.emoji}</div>

                {/* Name */}
                <div className={cn(
                  'font-display font-bold text-xs leading-tight mb-1.5',
                  active ? 'text-eko' : 'text-ink-strong'
                )}>
                  {v.name}
                </div>

                {/* Specs */}
                <div className="space-y-0.5">
                  {v.householdCapacity && (
                    <div className="text-2xs text-ink-muted">{v.householdCapacity}</div>
                  )}
                  <div className={cn(
                    'text-2xs font-bold',
                    active ? 'text-eko' : 'text-ink-body'
                  )}>
                    Max: {v.maxLoad}
                  </div>
                </div>

                {/* Select label */}
                <div className={cn(
                  'mt-2 pt-2 border-t text-2xs text-center font-medium transition-colors',
                  active
                    ? 'border-eko/20 text-eko'
                    : 'border-gray-100 text-ink-ghost'
                )}>
                  {active ? '✓ Selected' : 'Select'}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Sticky footer ── */}
      <div className="sticky bottom-0 z-10 px-5 py-3 border-t border-ink-ghost/10 bg-white flex items-center justify-between shrink-0">
        <div className="text-xs">
          {selectedVehicle ? (
            <span className="text-eko font-semibold">
              ✓ {selectedVehicle.name} — {selectedVehicle.maxLoad}
            </span>
          ) : (
            <span className="text-ink-muted">Select a vehicle to continue</span>
          )}
        </div>
        <button
          type="button"
          onClick={onNext}
          disabled={!selected}
          className={cn(
            'inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold transition-all',
            selected
              ? 'bg-eko text-white hover:bg-eko-700 shadow-md shadow-eko/20 hover:-translate-y-0.5'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          Continue to Booking
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── Step 2: Booking Form ──────────────────────────────────────────────────

function StepForm({ control, register, errors, isSubmitting, selectedVehicleId, onBack }: {
  control: any; register: any; errors: any
  isSubmitting: boolean; selectedVehicleId: string; onBack: () => void
}) {
  const vehicle = VEHICLES.find(v => v.id === selectedVehicleId)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-ink-ghost/10 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack}
            className="w-8 h-8 rounded-full bg-ink-ghost/10 hover:bg-ink-ghost/20 flex items-center justify-center transition-colors"
            aria-label="Back to vehicle selection">
            <ArrowLeft size={15} className="text-ink-muted" />
          </button>
          <div className="flex items-center gap-2">
            {vehicle && <span className="text-2xl leading-none">{vehicle.emoji}</span>}
            <div>
              <p className="font-display font-black text-sm text-ink-strong leading-none">Step 2 of 2</p>
              <p className="text-xs text-ink-muted">
                {vehicle ? `${vehicle.name} · Max ${vehicle.maxLoad}` : 'Booking details'}
              </p>
            </div>
          </div>
        </div>
        <Dialog.Close asChild>
          <button type="button" aria-label="Close"
            className="w-8 h-8 rounded-full bg-ink-ghost/10 hover:bg-ink-ghost/20 flex items-center justify-center transition-colors">
            <X size={15} className="text-ink-muted" />
          </button>
        </Dialog.Close>
      </div>

      {/* Body */}
      <div className="flex-1 px-6 py-5 overflow-y-auto">

        {/* Vehicle summary banner */}
        {vehicle && (
          <div className="flex items-start gap-3 bg-eko/5 border border-eko/20 rounded-xl px-4 py-3 mb-5">
            <span className="text-2xl leading-none shrink-0 mt-0.5">{vehicle.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-eko uppercase tracking-wide mb-1">Selected Vehicle</p>
              <p className="font-display font-bold text-sm text-ink-strong">{vehicle.name}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                <span className="text-xs text-ink-muted">
                  <span className="font-semibold text-ink-body">Load:</span> {vehicle.maxLoad}
                </span>
                {vehicle.size && (
                  <span className="text-xs text-ink-muted">
                    <span className="font-semibold text-ink-body">Size:</span> {vehicle.size}
                  </span>
                )}
                {vehicle.householdCapacity && (
                  <span className="text-xs text-ink-muted">
                    <span className="font-semibold text-ink-body">Household:</span> {vehicle.householdCapacity}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <h2 className="font-display font-black text-xl text-ink-strong mb-1">Booking Details</h2>
        <p className="text-ink-muted text-sm mb-5">Fill in your shipment and contact details below.</p>

        <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <Label required>Origin City</Label>
            <input {...register('pickupCity')} placeholder="Enter pickup city" className={field(errors.pickupCity?.message)} />
            <Err msg={errors.pickupCity?.message} />
          </div>
          <div>
            <Label required>Destination City</Label>
            <input {...register('deliveryCity')} placeholder="Enter delivery city" className={field(errors.deliveryCity?.message)} />
            <Err msg={errors.deliveryCity?.message} />
          </div>
          <div>
            <Label required>Pickup Date</Label>
            <input type="date" {...register('pickupDate')} className={field(errors.pickupDate?.message)} />
            <Err msg={errors.pickupDate?.message} />
          </div>
          <div>
            <Label required>Pickup Time</Label>
            <Controller name="pickupTime" control={control} render={({ field: f }) => (
              <SelectField value={f.value} onChange={f.onChange} options={TIME_SLOTS}
                placeholder="Select time" error={errors.pickupTime?.message} />
            )} />
          </div>
          <div>
            <Label required>Goods Type</Label>
            <Controller name="goodsType" control={control} render={({ field: f }) => (
              <SelectField value={f.value} onChange={f.onChange} options={GOODS_TYPES}
                placeholder="Select goods type" error={errors.goodsType?.message} />
            )} />
          </div>
          <div>
            <Label required>Weight Range</Label>
            <Controller name="weightRange" control={control} render={({ field: f }) => (
              <SelectField value={f.value} onChange={f.onChange} options={WEIGHT_RANGES}
                placeholder="Select weight" error={errors.weightRange?.message} />
            )} />
          </div>
          <div>
            <Label required>Full Name</Label>
            <input {...register('fullName')} placeholder="Your full name" className={field(errors.fullName?.message)} />
            <Err msg={errors.fullName?.message} />
          </div>
          <div>
            <Label required>Mobile Number</Label>
            <input type="tel" {...register('mobile')} placeholder="10-digit mobile" className={field(errors.mobile?.message)} />
            <Err msg={errors.mobile?.message} />
          </div>
          <div>
            <Label required>Email Address</Label>
            <input type="email" {...register('email')} placeholder="you@company.com" className={field(errors.email?.message)} />
            <Err msg={errors.email?.message} />
          </div>
          <div>
            <Label>Company Name</Label>
            <input {...register('companyName')} placeholder="Optional" className={field()} />
          </div>
          <div className="md:col-span-2">
            <Label>Special Instructions</Label>
            <textarea {...register('specialInstructions')} rows={2}
              placeholder="Fragile, temperature-sensitive, stacking restrictions..."
              className={cn(field(), 'resize-none')} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-ink-ghost/10 bg-white flex items-center justify-between gap-4 shrink-0">
        <p className="text-xs text-ink-muted hidden sm:block">
          Confirmation sent to your email · Our team will call you as soon as possible · GST invoice guaranteed
        </p>
        <button type="submit" disabled={isSubmitting}
          className="ml-auto shrink-0 inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-eko text-white font-bold text-sm hover:bg-eko-700 transition-all disabled:opacity-60 shadow-lg shadow-eko/20 hover:-translate-y-0.5 active:translate-y-0">
          {isSubmitting ? 'Submitting…' : 'Confirm Booking →'}
        </button>
      </div>
    </div>
  )
}

// ─── Success screen ────────────────────────────────────────────────────────

function SuccessScreen({ bookingRef, data, onClose }: { bookingRef: string; data: FormData; onClose: () => void }) {
  const vehicle = VEHICLES.find(v => v.id === data.vehicleType)
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-eko/10 flex items-center justify-center mb-5">
        <CheckCircle size={32} className="text-eko" />
      </div>
      <h3 className="font-display font-black text-2xl text-ink-strong mb-2">Thank You for Choosing BGTS!</h3>
      <p className="text-ink-muted text-sm mb-6 max-w-md">
        Your booking inquiry is received. Our team will call you as soon as possible.
      </p>
      <div className="inline-flex items-center gap-3 bg-eko/5 border border-eko/20 rounded-xl px-6 py-3.5 mb-6">
        <Hash size={16} className="text-eko" />
        <div className="text-left">
          <p className="text-xs text-ink-muted">Booking Reference</p>
          <p className="font-display font-black text-xl text-eko tracking-wider">{bookingRef}</p>
        </div>
      </div>
      <div className="bg-surface-mid rounded-xl p-4 w-full max-w-sm text-left mb-6 space-y-2.5 text-sm">
        {vehicle && (
          <>
            <div className="flex justify-between">
              <span className="text-ink-muted">Vehicle</span>
              <span className="font-semibold">{vehicle.emoji} {vehicle.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Max Load</span>
              <span className="font-semibold">{vehicle.maxLoad}</span>
            </div>
          </>
        )}
        <div className="flex justify-between">
          <span className="text-ink-muted">Route</span>
          <span className="font-semibold">{data.pickupCity} → {data.deliveryCity}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-muted">Pickup</span>
          <span className="font-semibold">{data.pickupDate} · {data.pickupTime}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-muted">Goods</span>
          <span className="font-semibold">{data.goodsType} · {data.weightRange}</span>
        </div>
      </div>
      <button type="button" onClick={onClose}
        className="px-8 py-3 rounded-xl bg-eko text-white font-bold text-sm hover:bg-eko-700 transition-colors shadow-md shadow-eko/20">
        Close
      </button>
    </div>
  )
}

// ─── Main modal ────────────────────────────────────────────────────────────

export function BookingModal() {
  const { isOpen, closeModal } = useBookingModal()
  const [step, setStep] = useState<1 | 2>(1)
  const [submitted, setSubmitted] = useState(false)
  const [bookingRef] = useState(genRef)
  const [lastData, setLastData] = useState<FormData | null>(null)

  const { control, register, handleSubmit, reset, setValue, watch,
    formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicleType: '', pickupCity: '', deliveryCity: '', pickupDate: '',
      pickupTime: '', goodsType: '', weightRange: '', fullName: '',
      mobile: '', email: '', companyName: '', specialInstructions: '',
    },
  })

  const selectedVehicle = watch('vehicleType')

  const handleClose = useCallback(() => {
    closeModal()
    setTimeout(() => { setStep(1); setSubmitted(false); reset() }, 300)
  }, [closeModal, reset])

  const onSubmit = useCallback(async (data: FormData) => {
    setLastData(data)
    const vehicle = VEHICLES.find(v => v.id === data.vehicleType)
    try {
      await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          bookingRef,
          vehicleType: vehicle ? `${vehicle.emoji} ${vehicle.name} (Max ${vehicle.maxLoad})` : data.vehicleType,
        }),
      })
    } catch { /* email failure never blocks confirmation */ }
    setSubmitted(true)
  }, [bookingRef])

  return (
    <Dialog.Root open={isOpen} onOpenChange={open => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed z-[101] flex flex-col bg-[#FAFAF8] shadow-2xl outline-none',
            'inset-0 rounded-none',
            'sm:inset-auto sm:rounded-2xl',
            'sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
            'sm:w-[95vw] sm:max-w-[1100px] sm:max-h-[92vh]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:zoom-out-95',
            'data-[state=open]:slide-in-from-bottom-3 data-[state=closed]:slide-out-to-bottom-3',
          )}
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Book Freight — BGTS</Dialog.Title>

          {submitted && lastData ? (
            <SuccessScreen bookingRef={bookingRef} data={lastData} onClose={handleClose} />
          ) : step === 1 ? (
            <StepVehicle
              selected={selectedVehicle}
              onSelect={id => setValue('vehicleType', id)}
              onNext={() => setStep(2)}
              onClose={handleClose}
            />
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col flex-1 min-h-0">
              <StepForm
                control={control} register={register} errors={errors}
                isSubmitting={isSubmitting} selectedVehicleId={selectedVehicle}
                onBack={() => setStep(1)}
              />
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
