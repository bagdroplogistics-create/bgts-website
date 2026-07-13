'use client'

import { useState, useEffect, useCallback } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, ChevronDown, ArrowLeft, ArrowRight, Check, CheckCircle, Hash, Zap } from 'lucide-react'
import { useBookingModal } from '@/contexts/BookingModalContext'
import { cn } from '@/lib/utils'

// ─── EV Vehicles ──────────────────────────────────────────────────────────

const EV_VEHICLES = [
  {
    id: 'ev-3w',
    emoji: '🛺',
    name: '3-Wheeler Cargo EV',
    capacity: 'Up to 400 KG',
    evCost: '₹8–9/km',
    dieselEquiv: '₹11–13/km',
    badge: 'City Delivery',
  },
  {
    id: 'ev-mini',
    emoji: '🚐',
    name: 'Mini Truck 1–2 MT EV',
    capacity: '500 KG – 2 Ton',
    evCost: '₹10–12/km',
    dieselEquiv: '₹15–18/km',
    badge: 'Urban Freight',
  },
  {
    id: 'ev-scv',
    emoji: '🚛',
    name: 'SCV 2–4 MT EV',
    capacity: '2,000 – 4,000 KG',
    evCost: '₹13–16/km',
    dieselEquiv: '₹19–24/km',
    badge: 'Enclosed Cargo',
  },
  {
    id: 'ev-icv',
    emoji: '🚛',
    name: 'ICV 5–7.5 MT EV',
    capacity: '5,000 – 7,500 KG',
    evCost: '₹22–28/km',
    dieselEquiv: '₹30–38/km',
    badge: 'Heavy Freight',
  },
]

// All EV vehicle IDs have their weight auto-locked to vehicle capacity
const VEHICLE_WEIGHT_AUTO: Record<string, string> = {
  'ev-3w':   'Up to 400 KG',
  'ev-mini': '500 KG – 2 Ton',
  'ev-scv':  '2,000 – 4,000 KG',
  'ev-icv':  '5,000 – 7,500 KG',
}

// Plans that do NOT need a pickup date (dedicated / enterprise)
const PLANS_WITHOUT_DATE = new Set(['dedi-ev', 'fleet-ev'])

// ─── Schema ───────────────────────────────────────────────────────────────

const schema = z.object({
  vehicleId:           z.string().min(1, 'Please select a vehicle'),
  pickupCity:          z.string().min(2, 'Enter origin city'),
  deliveryCity:        z.string().min(2, 'Enter destination city'),
  pickupDate:          z.string().optional(),
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

const GOODS_TYPES = [
  'Electronics', 'FMCG', 'Industrial Materials', 'Retail Products',
  'E-commerce Packages', 'Food Products', 'Pharma & Healthcare',
  'Textiles & Apparel', 'Auto Parts', 'Other',
]
const WEIGHT_RANGES = [
  'Under 50 KG', '50–200 KG', '200–500 KG', '500 KG–1 Ton',
  '1–2 Ton', '2–4 Ton', '4–7.5 Ton',
]
const TIME_SLOTS = [
  '06:00 AM','07:00 AM','08:00 AM','09:00 AM','10:00 AM',
  '11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM',
  '04:00 PM','05:00 PM','06:00 PM','07:00 PM','08:00 PM',
]

function genRef() {
  return 'EV' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-eko/30 focus:border-eko transition-colors ' +
  'placeholder-gray-400'

const selectCls = inputCls + ' appearance-none pr-9'

function Label({ children, req }: { children: React.ReactNode; req?: boolean }) {
  return (
    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
      {children}{req && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}
function Err({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-xs text-red-500">{msg}</p> : null
}

// ─── Step 1 — Vehicle selection ───────────────────────────────────────────

function StepVehicle({ selected, onSelect, onNext, onClose }: {
  selected: string; onSelect: (id: string) => void; onNext: () => void; onClose: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-eko flex items-center justify-center">
            <Zap size={15} className="text-white" />
          </div>
          <div>
            <p className="font-display font-black text-sm text-gray-900 leading-none">Step 1 of 3 — BGTS EV</p>
            <p className="text-xs text-gray-500">Select your EV vehicle</p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close"
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
          <X size={15} className="text-gray-500" />
        </button>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto">
        <h2 className="font-display font-black text-2xl text-gray-900 mb-1">Choose Your EV Vehicle</h2>
        <p className="text-sm text-gray-500 mb-6">Zero-emission freight · Rates shown are per km estimates</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EV_VEHICLES.map(v => {
            const active = selected === v.id
            return (
              <button key={v.id} type="button" onClick={() => onSelect(v.id)}
                className={cn(
                  'relative text-left rounded-2xl border-2 p-5 transition-all duration-200',
                  'hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-eko',
                  active
                    ? 'border-eko bg-eko/5 shadow-md shadow-eko/10'
                    : 'border-gray-200 bg-white hover:border-eko/40'
                )}>
                <span className={cn(
                  'absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-bold',
                  active ? 'bg-eko text-white' : 'bg-eko/10 text-eko'
                )}>{v.badge}</span>

                {active && (
                  <div className="absolute top-3 left-3 w-5 h-5 rounded-full bg-eko flex items-center justify-center">
                    <Check size={11} className="text-white" />
                  </div>
                )}

                <div className="text-4xl mb-3 mt-1">{v.emoji}</div>
                <div className={cn('font-display font-bold text-base mb-0.5', active ? 'text-eko' : 'text-gray-900')}>
                  {v.name}
                </div>
                <div className="text-sm text-gray-500 mb-3">{v.capacity}</div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">⚡ EV Rate</span>
                    <span className={cn('font-bold', active ? 'text-eko' : 'text-green-600')}>{v.evCost}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">🔥 Diesel equiv.</span>
                    <span className="text-gray-400 line-through">{v.dieselEquiv}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
        <p className="text-xs text-gray-500">
          {selected
            ? <span className="text-eko font-semibold">✓ {EV_VEHICLES.find(v => v.id === selected)?.name}</span>
            : 'Select a vehicle to continue'}
        </p>
        <button type="button" onClick={onNext} disabled={!selected}
          className={cn(
            'inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all',
            selected
              ? 'bg-eko text-white hover:bg-eko-700 shadow-md shadow-eko/20 hover:-translate-y-0.5'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}>
          Continue <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}

// ─── Step 2 — Booking form ────────────────────────────────────────────────

function StepForm({ control, register, errors, selectedId, showPickupDate, onBack, onNext }: {
  control: any; register: any; errors: any
  selectedId: string; showPickupDate: boolean
  onBack: () => void; onNext: () => void
}) {
  const vehicle    = EV_VEHICLES.find(v => v.id === selectedId)
  const autoWeight = VEHICLE_WEIGHT_AUTO[selectedId]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            aria-label="Back">
            <ArrowLeft size={15} className="text-gray-500" />
          </button>
          <div className="flex items-center gap-2">
            {vehicle && <span className="text-2xl">{vehicle.emoji}</span>}
            <div>
              <p className="font-display font-black text-sm text-gray-900 leading-none">Step 2 of 3 — BGTS EV</p>
              <p className="text-xs text-gray-500">{vehicle?.name} · {vehicle?.evCost}</p>
            </div>
          </div>
        </div>
        <Dialog.Close asChild>
          <button type="button" aria-label="Close"
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X size={15} className="text-gray-500" />
          </button>
        </Dialog.Close>
      </div>

      <div className="flex-1 px-6 py-5 overflow-y-auto">
        <h2 className="font-display font-black text-xl text-gray-900 mb-1">Booking Details</h2>
        <p className="text-sm text-gray-500 mb-5">Fill in your shipment and contact details.</p>

        <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Route */}
          <div>
            <Label req>Origin City</Label>
            <input {...register('pickupCity')} placeholder="Enter origin city" className={inputCls} />
            <Err msg={errors.pickupCity?.message} />
          </div>
          <div>
            <Label req>Destination City</Label>
            <input {...register('deliveryCity')} placeholder="Enter destination city" className={inputCls} />
            <Err msg={errors.deliveryCity?.message} />
          </div>

          {/* Pickup Date — shown only for FlexEV or no specific plan */}
          {showPickupDate && (
            <div>
              <Label req>Pickup Date</Label>
              <input type="date" {...register('pickupDate')} className={inputCls} />
              <Err msg={errors.pickupDate?.message} />
            </div>
          )}

          {/* Pickup Time */}
          <div>
            <Label req>Pickup Time</Label>
            <Controller name="pickupTime" control={control} render={({ field: f }) => (
              <div className="relative">
                <select value={f.value} onChange={e => f.onChange(e.target.value)}
                  className={cn(selectCls, !f.value && 'text-gray-400')}>
                  <option value="">Select time</option>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            )} />
            <Err msg={errors.pickupTime?.message} />
          </div>

          {/* Goods type */}
          <div>
            <Label req>Goods Type</Label>
            <Controller name="goodsType" control={control} render={({ field: f }) => (
              <div className="relative">
                <select value={f.value} onChange={e => f.onChange(e.target.value)}
                  className={cn(selectCls, !f.value && 'text-gray-400')}>
                  <option value="">Select goods type</option>
                  {GOODS_TYPES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            )} />
            <Err msg={errors.goodsType?.message} />
          </div>

          {/* Weight Range — auto-locked for 3-Wheeler, dropdown for others */}
          <div>
            <Label req>Weight Range</Label>
            {autoWeight ? (
              <div className={cn(inputCls, 'bg-eko/5 border-eko/30 text-gray-700 flex items-center justify-between cursor-not-allowed select-none')}>
                <span>{autoWeight}</span>
                <span className="text-xs font-bold text-eko ml-2 shrink-0">Auto · Vehicle capacity</span>
              </div>
            ) : (
              <Controller name="weightRange" control={control} render={({ field: f }) => (
                <div className="relative">
                  <select value={f.value} onChange={e => f.onChange(e.target.value)}
                    className={cn(selectCls, !f.value && 'text-gray-400')}>
                    <option value="">Select weight</option>
                    {WEIGHT_RANGES.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              )} />
            )}
            <Err msg={errors.weightRange?.message} />
          </div>

          {/* Contact */}
          <div>
            <Label req>Full Name</Label>
            <input {...register('fullName')} placeholder="Your full name" className={inputCls} />
            <Err msg={errors.fullName?.message} />
          </div>
          <div>
            <Label req>Mobile Number</Label>
            <input type="tel" {...register('mobile')} placeholder="10-digit mobile" className={inputCls} />
            <Err msg={errors.mobile?.message} />
          </div>
          <div>
            <Label req>Email Address</Label>
            <input type="email" {...register('email')} placeholder="you@company.com" className={inputCls} />
            <Err msg={errors.email?.message} />
          </div>
          <div>
            <Label>Company Name</Label>
            <input {...register('companyName')} placeholder="Optional" className={inputCls} />
          </div>
          <div className="md:col-span-2">
            <Label>Special Instructions</Label>
            <textarea {...register('specialInstructions')} rows={2}
              placeholder="Fragile, temperature-sensitive, special handling..."
              className={cn(inputCls, 'resize-none')} />
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end shrink-0">
        <button type="button" onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-eko text-white text-sm font-bold hover:bg-eko-700 shadow-md shadow-eko/20 hover:-translate-y-0.5 transition-all">
          Review Booking <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}

// ─── Step 3 — Summary & submit ────────────────────────────────────────────

function StepSummary({ data, selectedId, onBack, onSubmit, submitting }: {
  data: FormData; selectedId: string; onBack: () => void
  onSubmit: () => void; submitting: boolean
}) {
  const vehicle = EV_VEHICLES.find(v => v.id === selectedId)
  const rows: [string, string][] = [
    ['Vehicle',  `${vehicle?.emoji ?? ''} ${vehicle?.name ?? ''}`],
    ['EV Rate',  vehicle?.evCost ?? ''],
    ['From',     data.pickupCity],
    ['To',       data.deliveryCity],
    ...(data.pickupDate ? [['Date', data.pickupDate] as [string, string]] : []),
    ['Time',     data.pickupTime],
    ['Goods',    data.goodsType],
    ['Weight',   data.weightRange],
    ['Name',     data.fullName],
    ['Mobile',   data.mobile],
    ['Email',    data.email],
    ...(data.companyName ? [['Company', data.companyName] as [string, string]] : []),
    ...(data.specialInstructions ? [['Notes', data.specialInstructions] as [string, string]] : []),
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors" aria-label="Back">
            <ArrowLeft size={15} className="text-gray-500" />
          </button>
          <div>
            <p className="font-display font-black text-sm text-gray-900 leading-none">Step 3 of 3 — BGTS EV</p>
            <p className="text-xs text-gray-500">Review and confirm your booking</p>
          </div>
        </div>
        <Dialog.Close asChild>
          <button type="button" aria-label="Close"
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X size={15} className="text-gray-500" />
          </button>
        </Dialog.Close>
      </div>

      <div className="flex-1 px-6 py-5 overflow-y-auto">
        <h2 className="font-display font-black text-xl text-gray-900 mb-1">Booking Summary</h2>
        <p className="text-sm text-gray-500 mb-5">Please review your details before confirming.</p>

        <div className="rounded-xl border border-gray-200 overflow-hidden">
          {rows.map(([k, v], i) => (
            <div key={k} className={cn('flex px-4 py-2.5 text-sm', i % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
              <span className="w-28 shrink-0 text-gray-500 font-medium text-xs uppercase tracking-wide mt-0.5">{k}</span>
              <span className="text-gray-900 font-medium">{v}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-eko/5 border border-eko/20 rounded-xl text-sm text-eko font-medium">
          ⚡ You save 25–35% vs diesel with BGTS EV
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
        <p className="text-xs text-gray-400">Our team will call you as soon as possible · GST invoice guaranteed</p>
        <button type="submit" disabled={submitting}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-eko text-white font-bold text-sm hover:bg-eko-700 transition-all disabled:opacity-60 shadow-lg shadow-eko/20 hover:-translate-y-0.5">
          {submitting ? 'Submitting…' : 'Confirm EV Booking →'}
        </button>
      </div>
    </div>
  )
}

// ─── Success ──────────────────────────────────────────────────────────────

function SuccessScreen({ bookingRef, data, onClose }: { bookingRef: string; data: FormData; onClose: () => void }) {
  const vehicle = EV_VEHICLES.find(v => v.id === data.vehicleId)
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-eko/10 flex items-center justify-center mb-5">
        <CheckCircle size={32} className="text-eko" />
      </div>
      <h3 className="font-display font-black text-2xl text-gray-900 mb-2">EV Booking Confirmed!</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-md">
        Thank you for choosing BGTS EV. Our team will call you as soon as possible.
      </p>
      <div className="inline-flex items-center gap-3 bg-eko/5 border border-eko/20 rounded-xl px-6 py-3.5 mb-6">
        <Hash size={16} className="text-eko" />
        <div className="text-left">
          <p className="text-xs text-gray-500">Booking Reference</p>
          <p className="font-display font-black text-xl text-eko tracking-wider">{bookingRef}</p>
        </div>
      </div>
      <div className="bg-gray-50 rounded-xl p-4 w-full max-w-xs text-left mb-6 space-y-2 text-sm">
        {vehicle && (
          <div className="flex justify-between">
            <span className="text-gray-500">Vehicle</span>
            <span className="font-semibold">{vehicle.emoji} {vehicle.name}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">Route</span>
          <span className="font-semibold">{data.pickupCity} → {data.deliveryCity}</span>
        </div>
        {data.pickupDate && (
          <div className="flex justify-between">
            <span className="text-gray-500">Pickup</span>
            <span className="font-semibold">{data.pickupDate} · {data.pickupTime}</span>
          </div>
        )}
      </div>
      <button type="button" onClick={onClose}
        className="px-8 py-3 rounded-xl bg-eko text-white font-bold text-sm hover:bg-eko-700 transition-colors shadow-md shadow-eko/20">
        Close
      </button>
    </div>
  )
}

// ─── Main modal ────────────────────────────────────────────────────────────

export function BGTSEVBookingModal() {
  const { isOpen, modalType, evPlan, closeModal } = useBookingModal()
  const open = isOpen && modalType === 'ev'

  // Show pickup date unless plan is DediEV or FleetEV
  const showPickupDate = !PLANS_WITHOUT_DATE.has(evPlan ?? '')

  const [step, setStep]             = useState<1 | 2 | 3>(1)
  const [submitted, setSubmitted]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [bookingRef]                = useState(genRef)
  const [summaryData, setSummaryData] = useState<FormData | null>(null)

  const { control, register, handleSubmit, reset, setValue, watch,
    formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicleId: '', pickupCity: '', deliveryCity: '', pickupDate: '',
      pickupTime: '', goodsType: '', weightRange: '', fullName: '',
      mobile: '', email: '', companyName: '', specialInstructions: '',
    },
  })

  const selectedId = watch('vehicleId')

  // Auto-populate weight range for 3-Wheeler (and clear when switching away)
  useEffect(() => {
    const autoWeight = VEHICLE_WEIGHT_AUTO[selectedId]
    if (autoWeight) {
      setValue('weightRange', autoWeight, { shouldValidate: true })
    } else if (selectedId) {
      // Switching from 3-Wheeler to another vehicle — clear auto value
      const current = watch('weightRange')
      if (Object.values(VEHICLE_WEIGHT_AUTO).includes(current)) {
        setValue('weightRange', '', { shouldValidate: false })
      }
    }
  }, [selectedId, setValue, watch])

  const handleClose = useCallback(() => {
    closeModal()
    setTimeout(() => { setStep(1); setSubmitted(false); setSubmitting(false); reset() }, 300)
  }, [closeModal, reset])

  const goToSummary = handleSubmit(data => {
    setSummaryData(data)
    setStep(3)
  })

  const confirmSubmit = useCallback(async () => {
    if (!summaryData) return
    setSubmitting(true)
    const vehicle = EV_VEHICLES.find(v => v.id === summaryData.vehicleId)
    try {
      await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...summaryData,
          bookingRef,
          evPlan: evPlan ?? 'general',
          serviceType: 'BGTS EV Booking',
          vehicleType: vehicle ? `${vehicle.emoji} ${vehicle.name} — EV ${vehicle.evCost}` : summaryData.vehicleId,
        }),
      })
    } catch { /* silent */ }
    setSubmitting(false)
    setSubmitted(true)
  }, [summaryData, bookingRef, evPlan])

  return (
    <Dialog.Root open={open} onOpenChange={o => !o && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed z-[101] flex flex-col bg-[#FAFAF8] shadow-2xl outline-none',
            'inset-0 rounded-none',
            'sm:inset-auto sm:rounded-2xl',
            'sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
            'sm:w-[95vw] sm:max-w-[820px] sm:h-[92vh]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:zoom-out-95',
            'data-[state=open]:slide-in-from-bottom-3 data-[state=closed]:slide-out-to-bottom-3',
          )}
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">BGTS EV Booking</Dialog.Title>

          {submitted && summaryData ? (
            <SuccessScreen bookingRef={bookingRef} data={summaryData} onClose={handleClose} />
          ) : step === 1 ? (
            <StepVehicle
              selected={selectedId}
              onSelect={id => setValue('vehicleId', id)}
              onNext={() => setStep(2)}
              onClose={handleClose}
            />
          ) : step === 2 ? (
            <form noValidate className="flex flex-col h-full min-h-0">
              <StepForm
                control={control} register={register} errors={errors}
                selectedId={selectedId} showPickupDate={showPickupDate}
                onBack={() => setStep(1)} onNext={goToSummary}
              />
            </form>
          ) : summaryData ? (
            <form onSubmit={e => { e.preventDefault(); confirmSubmit() }} noValidate className="flex flex-col h-full min-h-0">
              <StepSummary
                data={summaryData} selectedId={selectedId}
                onBack={() => setStep(2)} onSubmit={confirmSubmit} submitting={submitting}
              />
            </form>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
