'use client'

import { useState, useCallback } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, ChevronDown, ArrowLeft, ArrowRight, Check, CheckCircle, Hash, Truck } from 'lucide-react'
import { useBookingModal } from '@/contexts/BookingModalContext'
import { cn } from '@/lib/utils'

// ─── Transport Vehicles (20) ───────────────────────────────────────────────

type VehicleCategory = 'Small' | 'Medium' | 'Heavy' | 'Container' | 'ODC'

interface Vehicle {
  id: string
  name: string
  category: VehicleCategory
  emoji: string
  maxLoad: string
  size?: string
  householdCapacity?: string
}

const VEHICLES: Vehicle[] = [
  // Small
  { id: 'tata-ace',               name: 'TATA ACE',               category: 'Small',     emoji: '🛺', size: '7×4.8×4.8 ft', householdCapacity: '1 BHK',   maxLoad: '850 Kgs' },
  { id: 'ashok-leyland-dost',     name: 'ASHOK LEYLAND DOST',     category: 'Small',     emoji: '🚐', size: '7×4.8×4.8 ft', householdCapacity: '1 BHK',   maxLoad: '1 Ton' },
  { id: 'mahindra-bolero-pickup', name: 'MAHINDRA BOLERO PICKUP',  category: 'Small',     emoji: '🛻', size: '8×4.8×4.8 ft', householdCapacity: '1 BHK',   maxLoad: '1.5 Ton' },
  // Medium
  { id: 'tata-407',               name: 'TATA 407',                category: 'Medium',    emoji: '🚚', householdCapacity: '1.5 BHK', maxLoad: '2.5 Ton' },
  { id: 'eicher-14ft',            name: 'EICHER 14 FEET',          category: 'Medium',    emoji: '🚛', householdCapacity: '2 BHK',   maxLoad: '4 Ton' },
  { id: 'eicher-17ft',            name: 'EICHER 17 FEET',          category: 'Medium',    emoji: '🚛', householdCapacity: '2.5 BHK', maxLoad: '5 Ton' },
  { id: 'eicher-19ft',            name: 'EICHER 19 FEET',          category: 'Medium',    emoji: '🚛', householdCapacity: '2.5 BHK', maxLoad: '7–9 Ton' },
  { id: 'tata-22ft',              name: 'TATA 22 FEET',            category: 'Medium',    emoji: '🚛', householdCapacity: '3 BHK',   maxLoad: '10 Ton' },
  // Heavy
  { id: 'tata-truck-6tyre',       name: 'TATA TRUCK 6 TYRE',       category: 'Heavy',     emoji: '🚚', maxLoad: '9 Ton' },
  { id: 'taurus-16t',             name: 'TAURUS 16T 10 TYRE',      category: 'Heavy',     emoji: '🚛', maxLoad: '16 Ton' },
  { id: 'taurus-21t',             name: 'TAURUS 21T 12 TYRE',      category: 'Heavy',     emoji: '🚛', maxLoad: '21 Ton' },
  { id: 'taurus-25t',             name: 'TAURUS 25T 14 TYRE',      category: 'Heavy',     emoji: '🚛', maxLoad: '25 Ton' },
  // Container
  { id: 'container-20ft',         name: 'CONTAINER 20 FT',         category: 'Container', emoji: '📦', householdCapacity: '4 BHK', maxLoad: '6.5 Ton' },
  { id: 'container-32ft-sxl',     name: 'CONTAINER 32 FT SXL',     category: 'Container', emoji: '📦', householdCapacity: '5 BHK', maxLoad: '7 Ton' },
  { id: 'container-32ft-mxl',     name: 'CONTAINER 32 FT MXL',     category: 'Container', emoji: '📦', maxLoad: '14 Ton' },
  { id: 'container-32ft-hq',      name: 'CONTAINER 32 FT HQ',      category: 'Container', emoji: '📦', maxLoad: '7/14 Ton' },
  // ODC
  { id: 'odc-20ft',               name: '20 FT OPEN ODC',          category: 'ODC',       emoji: '🏗️', maxLoad: '7 Ton' },
  { id: 'odc-28-32ft-jcb',        name: '28–32 FT JCB ODC',        category: 'ODC',       emoji: '🏗️', maxLoad: '8 Ton' },
  { id: 'odc-32ft-trailer',       name: '32 FT TRAILER ODC',       category: 'ODC',       emoji: '🏗️', maxLoad: '25 Ton' },
  { id: 'odc-40ft-trailer',       name: '40 FT OPEN TRAILER ODC',  category: 'ODC',       emoji: '🏗️', maxLoad: '32 Ton' },
]

const BADGE_COLOR: Record<VehicleCategory, string> = {
  'Small':     'bg-blue-100 text-blue-700',
  'Medium':    'bg-emerald-100 text-emerald-700',
  'Heavy':     'bg-orange-100 text-orange-700',
  'Container': 'bg-purple-100 text-purple-700',
  'ODC':       'bg-red-100 text-red-700',
}

const BADGE_ACTIVE: Record<VehicleCategory, string> = {
  'Small':     'bg-blue-600 text-white',
  'Medium':    'bg-emerald-600 text-white',
  'Heavy':     'bg-orange-600 text-white',
  'Container': 'bg-purple-600 text-white',
  'ODC':       'bg-red-600 text-white',
}

// ─── Schema ───────────────────────────────────────────────────────────────

const schema = z.object({
  vehicleId:           z.string().min(1, 'Please select a vehicle'),
  pickupCity:          z.string().min(2, 'Enter origin city'),
  deliveryCity:        z.string().min(2, 'Enter destination city'),
  pickupDate:          z.string().min(1, 'Select pickup date'),
  pickupTime:          z.string().min(1, 'Select pickup time'),
  goodsType:           z.string().min(1, 'Select goods type'),
  weightRange:         z.string().min(1, 'Select weight range'),
  numberOfPackages:    z.string().optional(),
  additionalServices:  z.string().optional(),
  fullName:            z.string().min(2, 'Enter your full name'),
  mobile:              z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile'),
  email:               z.string().email('Enter valid email'),
  companyName:         z.string().optional(),
  specialInstructions: z.string().optional(),
})
type FormData = z.infer<typeof schema>

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
  return 'BGTS' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors ' +
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
  const categories: VehicleCategory[] = ['Small', 'Medium', 'Heavy', 'Container', 'ODC']

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
            <Truck size={15} className="text-white" />
          </div>
          <div>
            <p className="font-display font-black text-sm text-gray-900 leading-none">Step 1 of 3 — BGTS Transport</p>
            <p className="text-xs text-gray-500">Select your vehicle</p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close"
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
          <X size={15} className="text-gray-500" />
        </button>
      </div>

      {/* Body — scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <h2 className="font-display font-black text-2xl text-gray-900 mb-1">Choose Your Vehicle</h2>
        <p className="text-sm text-gray-500 mb-5">20 vehicles across 5 categories — select what fits your load</p>

        {categories.map(cat => {
          const catVehicles = VEHICLES.filter(v => v.category === cat)
          return (
            <div key={cat} className="mb-6">
              <div className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold mb-3', BADGE_COLOR[cat])}>
                {cat} Vehicles · {catVehicles.length}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {catVehicles.map(v => {
                  const active = selected === v.id
                  return (
                    <button key={v.id} type="button" onClick={() => onSelect(v.id)}
                      className={cn(
                        'relative text-left rounded-xl border-2 p-3 transition-all duration-200',
                        'hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                        active
                          ? 'border-brand bg-brand/5 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-brand/40'
                      )}>
                      {active && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand flex items-center justify-center">
                          <Check size={9} className="text-white" />
                        </div>
                      )}
                      {!active && (
                        <span className={cn('absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full font-bold', BADGE_COLOR[cat])}>
                          {cat}
                        </span>
                      )}
                      {active && (
                        <span className={cn('absolute top-2 left-2 text-[9px] px-1.5 py-0.5 rounded-full font-bold', BADGE_ACTIVE[cat])}>
                          {cat}
                        </span>
                      )}
                      <div className="text-2xl mb-1.5 mt-1">{v.emoji}</div>
                      <div className={cn('font-bold text-xs leading-tight mb-1', active ? 'text-brand' : 'text-gray-900')}>
                        {v.name}
                      </div>
                      <div className="text-xs text-gray-500">Max: {v.maxLoad}</div>
                      {v.householdCapacity && (
                        <div className="text-xs text-gray-400 mt-0.5">{v.householdCapacity}</div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer — sticky */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
        <p className="text-xs text-gray-500">
          {selected
            ? <span className="text-brand font-semibold">✓ {VEHICLES.find(v => v.id === selected)?.name}</span>
            : 'Select a vehicle to continue'}
        </p>
        <button type="button" onClick={onNext} disabled={!selected}
          className={cn(
            'inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all',
            selected
              ? 'bg-brand text-white hover:bg-brand-700 shadow-md shadow-brand/20 hover:-translate-y-0.5'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}>
          Continue <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}

// ─── Step 2 — Booking form ────────────────────────────────────────────────

function StepForm({ control, register, errors, selectedId, onBack, onNext }: {
  control: any; register: any; errors: any
  selectedId: string; onBack: () => void; onNext: () => void
}) {
  const vehicle = VEHICLES.find(v => v.id === selectedId)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors" aria-label="Back">
            <ArrowLeft size={15} className="text-gray-500" />
          </button>
          <div className="flex items-center gap-2">
            {vehicle && <span className="text-xl">{vehicle.emoji}</span>}
            <div>
              <p className="font-display font-black text-sm text-gray-900 leading-none">Step 2 of 3 — BGTS Transport</p>
              <p className="text-xs text-gray-500">{vehicle?.name} · Max {vehicle?.maxLoad}</p>
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

      {/* Body */}
      <div className="flex-1 px-6 py-5 overflow-y-auto">
        <h2 className="font-display font-black text-xl text-gray-900 mb-1">Shipment Details</h2>
        <p className="text-sm text-gray-500 mb-5">Fill in your route, cargo, and contact details.</p>

        <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
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
          <div>
            <Label req>Pickup Date</Label>
            <input type="date" {...register('pickupDate')} className={inputCls} />
            <Err msg={errors.pickupDate?.message} />
          </div>
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
          <div>
            <Label req>Weight Range</Label>
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
            <Err msg={errors.weightRange?.message} />
          </div>
          <div>
            <Label>No. of Packages</Label>
            <input type="number" {...register('numberOfPackages')} placeholder="e.g. 12" className={inputCls} />
          </div>
          <div>
            <Label>Add-on Services</Label>
            <input {...register('additionalServices')} placeholder="e.g. Loading, Insurance" className={inputCls} />
          </div>
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
              placeholder="Fragile, special handling, restricted access..."
              className={cn(inputCls, 'resize-none')} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end shrink-0">
        <button type="button" onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-700 shadow-md shadow-brand/20 hover:-translate-y-0.5 transition-all">
          Review Booking <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}

// ─── Step 3 — Summary & submit ────────────────────────────────────────────

function StepSummary({ data, onBack, onSubmit, submitting }: {
  data: FormData; onBack: () => void; onSubmit: () => void; submitting: boolean
}) {
  const vehicle = VEHICLES.find(v => v.id === data.vehicleId)
  const rows: [string, string][] = [
    ['Vehicle',    `${vehicle?.emoji ?? ''} ${vehicle?.name ?? ''}`],
    ['Max Load',   vehicle?.maxLoad ?? ''],
    ['From',       data.pickupCity],
    ['To',         data.deliveryCity],
    ['Date',       data.pickupDate],
    ['Time',       data.pickupTime],
    ['Goods',      data.goodsType],
    ['Weight',     data.weightRange],
    ...(data.numberOfPackages   ? [['Packages',   data.numberOfPackages]   as [string,string]] : []),
    ...(data.additionalServices ? [['Add-ons',    data.additionalServices] as [string,string]] : []),
    ['Name',       data.fullName],
    ['Mobile',     data.mobile],
    ['Email',      data.email],
    ...(data.companyName          ? [['Company',     data.companyName]          as [string,string]] : []),
    ...(data.specialInstructions  ? [['Notes',       data.specialInstructions]  as [string,string]] : []),
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors" aria-label="Back">
            <ArrowLeft size={15} className="text-gray-500" />
          </button>
          <div>
            <p className="font-display font-black text-sm text-gray-900 leading-none">Step 3 of 3 — BGTS Transport</p>
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

      {/* Body */}
      <div className="flex-1 px-6 py-5 overflow-y-auto">
        <h2 className="font-display font-black text-xl text-gray-900 mb-1">Booking Summary</h2>
        <p className="text-sm text-gray-500 mb-5">Please review before confirming.</p>

        <div className="rounded-xl border border-gray-200 overflow-hidden">
          {rows.map(([k, v], i) => (
            <div key={k} className={cn('flex px-4 py-2.5 text-sm', i % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
              <span className="w-28 shrink-0 text-gray-500 font-medium text-xs uppercase tracking-wide mt-0.5">{k}</span>
              <span className="text-gray-900 font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
        <p className="text-xs text-gray-400">Response within 30 min · GST invoice guaranteed</p>
        <button type="submit" disabled={submitting}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand-700 transition-all disabled:opacity-60 shadow-lg shadow-brand/20 hover:-translate-y-0.5">
          {submitting ? 'Submitting…' : 'Confirm Booking →'}
        </button>
      </div>
    </div>
  )
}

// ─── Success ──────────────────────────────────────────────────────────────

function SuccessScreen({ bookingRef, data, onClose }: { bookingRef: string; data: FormData; onClose: () => void }) {
  const vehicle = VEHICLES.find(v => v.id === data.vehicleId)
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mb-5">
        <CheckCircle size={32} className="text-brand" />
      </div>
      <h3 className="font-display font-black text-2xl text-gray-900 mb-2">Booking Confirmed!</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-md">
        Thank you for booking with BGTS. Our team will confirm within 30 minutes on {data.email}.
      </p>
      <div className="inline-flex items-center gap-3 bg-brand/5 border border-brand/20 rounded-xl px-6 py-3.5 mb-6">
        <Hash size={16} className="text-brand" />
        <div className="text-left">
          <p className="text-xs text-gray-500">Booking Reference</p>
          <p className="font-display font-black text-xl text-brand tracking-wider">{bookingRef}</p>
        </div>
      </div>
      <div className="bg-gray-50 rounded-xl p-4 w-full max-w-xs text-left mb-6 space-y-2 text-sm">
        {vehicle && <div className="flex justify-between"><span className="text-gray-500">Vehicle</span><span className="font-semibold">{vehicle.emoji} {vehicle.name}</span></div>}
        <div className="flex justify-between"><span className="text-gray-500">Route</span><span className="font-semibold">{data.pickupCity} → {data.deliveryCity}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Pickup</span><span className="font-semibold">{data.pickupDate} · {data.pickupTime}</span></div>
      </div>
      <button type="button" onClick={onClose}
        className="px-8 py-3 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand-700 transition-colors shadow-md shadow-brand/20">
        Close
      </button>
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────

export function BGTSBookingModal() {
  const { isOpen, modalType, closeModal } = useBookingModal()
  const open = isOpen && modalType === 'bgts'

  const [step, setStep]               = useState<1 | 2 | 3>(1)
  const [submitted, setSubmitted]     = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [bookingRef]                  = useState(genRef)
  const [summaryData, setSummaryData] = useState<FormData | null>(null)

  const { control, register, handleSubmit, reset, setValue, watch,
    formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicleId: '', pickupCity: '', deliveryCity: '', pickupDate: '',
      pickupTime: '', goodsType: '', weightRange: '',
      numberOfPackages: '', additionalServices: '',
      fullName: '', mobile: '', email: '', companyName: '', specialInstructions: '',
    },
  })

  const selectedId = watch('vehicleId')

  const handleClose = useCallback(() => {
    closeModal()
    setTimeout(() => { setStep(1); setSubmitted(false); setSubmitting(false); reset() }, 300)
  }, [closeModal, reset])

  // Step 2 → 3: validate then show summary
  const goToSummary = handleSubmit(data => {
    setSummaryData(data)
    setStep(3)
  })

  const confirmSubmit = useCallback(async () => {
    if (!summaryData) return
    setSubmitting(true)
    const vehicle = VEHICLES.find(v => v.id === summaryData.vehicleId)
    try {
      await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...summaryData,
          bookingRef,
          serviceType: 'BGTS Transport Booking',
          vehicleType: vehicle ? `${vehicle.emoji} ${vehicle.name} (Max ${vehicle.maxLoad})` : summaryData.vehicleId,
        }),
      })
    } catch { /* silent */ }
    setSubmitting(false)
    setSubmitted(true)
  }, [summaryData, bookingRef])

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
            'sm:w-[95vw] sm:max-w-[900px] sm:h-[92vh]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:zoom-out-95',
            'data-[state=open]:slide-in-from-bottom-3 data-[state=closed]:slide-out-to-bottom-3',
          )}
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">BGTS Transport Booking</Dialog.Title>

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
                selectedId={selectedId} onBack={() => setStep(1)} onNext={goToSummary}
              />
            </form>
          ) : summaryData ? (
            <form onSubmit={e => { e.preventDefault(); confirmSubmit() }} noValidate className="flex flex-col h-full min-h-0">
              <StepSummary
                data={summaryData} onBack={() => setStep(2)} onSubmit={confirmSubmit} submitting={submitting}
              />
            </form>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
