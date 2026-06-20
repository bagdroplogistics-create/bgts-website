'use client'

import { useState, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Truck, Package, MapPin, Calendar, User, CheckCircle,
  ArrowRight, ArrowLeft, Zap, Clock, Weight, Phone,
  Mail, MessageSquare, Building2, ChevronDown, Hash, Star
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

// ─── Schema ───────────────────────────────────────────────────────────────

const bookingSchema = z.object({
  vehicle: z.enum(['mini-ev', 'pickup-ev', 'van-ev', 'truck-ev'], {
    required_error: 'Please select a vehicle',
  }),
  pickupCity: z.string().min(1, 'Select pickup city'),
  pickupArea: z.string().min(1, 'Enter pickup area'),
  pickupDate: z.string().min(1, 'Select pickup date'),
  pickupTime: z.string().min(1, 'Select pickup time'),
  pickupAddress: z.string().min(5, 'Enter full pickup address'),
  deliveryCity: z.string().min(1, 'Select delivery city'),
  deliveryArea: z.string().min(1, 'Enter delivery area'),
  deliveryDate: z.string().min(1, 'Select delivery date'),
  deliveryAddress: z.string().min(5, 'Enter full delivery address'),
  goodsType: z.string().min(1, 'Select goods type'),
  packageSize: z.enum(['small', 'medium', 'large', 'extra-large'], {
    required_error: 'Select package size',
  }),
  weightRange: z.string().min(1, 'Select weight range'),
  numPackages: z.coerce.number().min(1, 'Minimum 1 package'),
  specialInstructions: z.string().optional(),
  fullName: z.string().min(2, 'Enter your full name'),
  companyName: z.string().optional(),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'),
  email: z.string().email('Enter valid email address'),
  confirmWhatsApp: z.boolean().optional(),
  confirmEmail: z.boolean().optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

// ─── Constants ────────────────────────────────────────────────────────────

const VEHICLES = [
  {
    id: 'mini-ev' as const,
    name: 'Mini EV Cargo',
    capacity: '200–400 kg',
    desc: 'Ideal for small loads, last-mile delivery in city lanes.',
    icon: '🛺',
    color: 'from-green-500 to-emerald-600',
    badge: 'City Delivery',
    specs: ['Payload: 200–400 kg', 'Range: 100 km/charge', 'Width: 1.4 m', 'Best for: E-commerce, FMCG'],
  },
  {
    id: 'pickup-ev' as const,
    name: 'Electric Pickup',
    capacity: '500–800 kg',
    desc: 'Versatile pickup for medium loads and urban logistics.',
    icon: '🚐',
    color: 'from-blue-500 to-cyan-600',
    badge: 'Urban Freight',
    specs: ['Payload: 500–800 kg', 'Range: 150 km/charge', 'Width: 1.7 m', 'Best for: Retail, Pharma'],
  },
  {
    id: 'van-ev' as const,
    name: 'Electric Delivery Van',
    capacity: '1,000–1,500 kg',
    desc: 'Enclosed van for secure, weather-protected cargo movement.',
    icon: '🚚',
    color: 'from-purple-500 to-violet-600',
    badge: 'Secure Cargo',
    specs: ['Payload: 1,000–1,500 kg', 'Range: 180 km/charge', 'Enclosed body', 'Best for: Electronics, Docs'],
  },
  {
    id: 'truck-ev' as const,
    name: 'Heavy EV Cargo Truck',
    capacity: '3,000–7,000 kg',
    desc: 'High-capacity EV truck for inter-city and bulk freight.',
    icon: '🚛',
    color: 'from-orange-500 to-amber-600',
    badge: 'Heavy Freight',
    specs: ['Payload: 3,000–7,000 kg', 'Range: 200 km/charge', 'Multi-axle', 'Best for: Industrial, Bulk'],
  },
]

const CITIES = [
  'Ahmedabad', 'Vadodara', 'Surat', 'Rajkot', 'Gandhinagar',
  'Anand', 'Bharuch', 'Bhavnagar', 'Jamnagar', 'Junagadh',
  'Nadiad', 'Navsari', 'Valsad', 'Morbi', 'Mehsana',
  'Mumbai', 'Pune', 'Nashik', 'Thane', 'Navi Mumbai',
  'Nagpur', 'Aurangabad', 'Kolhapur', 'Solapur',
]

const GOODS_TYPES = [
  'Electronics', 'FMCG', 'Industrial Materials', 'Retail Products',
  'Documents', 'E-commerce Packages', 'Food Products', 'Pharma & Healthcare',
  'Textiles & Apparel', 'Auto Parts', 'Other',
]

const WEIGHT_RANGES = [
  'Under 50 KG', '50–200 KG', '200–500 KG', '500 KG–1 Ton', 'Above 1 Ton',
]

const TIME_SLOTS = [
  '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM',
  '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM',
]

// ─── Distance / cost estimates ─────────────────────────────────────────────

const CITY_DISTANCES: Record<string, Record<string, number>> = {
  Ahmedabad: { Vadodara: 110, Surat: 265, Rajkot: 215, Mumbai: 540, Pune: 660, Nashik: 540 },
  Vadodara: { Ahmedabad: 110, Surat: 155, Mumbai: 430, Pune: 550, Rajkot: 195 },
  Surat: { Ahmedabad: 265, Vadodara: 155, Mumbai: 290, Pune: 415 },
  Rajkot: { Ahmedabad: 215, Vadodara: 195, Mumbai: 660 },
  Mumbai: { Ahmedabad: 540, Vadodara: 430, Surat: 290, Pune: 150, Nashik: 165 },
  Pune: { Mumbai: 150, Nashik: 210, Nagpur: 700, Ahmedabad: 660 },
}

function getDistance(from: string, to: string): number {
  return CITY_DISTANCES[from]?.[to] ?? CITY_DISTANCES[to]?.[from] ?? 200
}

function getEstimates(from: string, to: string, weight: string) {
  const dist = getDistance(from, to)
  const baseRate = weight.includes('Above') ? 18 : weight.includes('1 Ton') ? 14 : weight.includes('500') ? 10 : weight.includes('200') ? 7 : 4
  const cost = Math.round(dist * baseRate / 100) * 100
  const hours = dist < 100 ? '2–4 hrs' : dist < 300 ? '4–8 hrs' : dist < 500 ? '8–14 hrs' : '14–24 hrs'
  return { dist, cost, hours }
}

function genRef(): string {
  return 'BGTSEV' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

// ─── Step config ──────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Vehicle',  icon: Truck },
  { label: 'Pickup',   icon: MapPin },
  { label: 'Delivery', icon: MapPin },
  { label: 'Shipment', icon: Package },
  { label: 'Contact',  icon: User },
  { label: 'Summary',  icon: CheckCircle },
]

// ─── Sub-components ───────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-ink-strong mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-red-500">{msg}</p>
}

function SelectField({
  value, onChange, options, placeholder, error,
}: {
  value: string; onChange: (v: string) => void
  options: string[]; placeholder: string; error?: string
}) {
  return (
    <div>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className={cn(
            'w-full appearance-none rounded-xl border px-4 py-3 text-sm bg-white',
            'focus:outline-none focus:ring-2 focus:ring-eko/40 focus:border-eko',
            'transition-colors pr-10',
            error ? 'border-red-400' : 'border-ink-ghost/30 hover:border-eko/50',
            !value && 'text-ink-ghost'
          )}
        >
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-ghost pointer-events-none" />
      </div>
      <FieldError msg={error} />
    </div>
  )
}

function InputField({
  value, onChange, placeholder, type = 'text', error, icon: Icon,
}: {
  value: string; onChange: (v: string) => void
  placeholder: string; type?: string; error?: string
  icon?: React.ElementType
}) {
  return (
    <div>
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-ghost" />}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-xl border px-4 py-3 text-sm bg-white',
            'focus:outline-none focus:ring-2 focus:ring-eko/40 focus:border-eko',
            'transition-colors',
            Icon && 'pl-9',
            error ? 'border-red-400' : 'border-ink-ghost/30 hover:border-eko/50'
          )}
        />
      </div>
      <FieldError msg={error} />
    </div>
  )
}

// ─── Steps ────────────────────────────────────────────────────────────────

function StepVehicle({ control, errors, watch }: any) {
  const selected = watch('vehicle')
  return (
    <div>
      <h2 className="font-display font-black text-2xl text-ink-strong mb-2">Choose Your Vehicle</h2>
      <p className="text-ink-muted text-sm mb-6">Select the EV vehicle type that fits your cargo requirements.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {VEHICLES.map(v => (
          <Controller
            key={v.id}
            name="vehicle"
            control={control}
            render={({ field }) => (
              <button
                type="button"
                onClick={() => field.onChange(v.id)}
                className={cn(
                  'relative text-left rounded-2xl border-2 p-4 transition-all duration-200',
                  'hover:shadow-lg hover:-translate-y-0.5',
                  field.value === v.id
                    ? 'border-eko bg-eko/5 shadow-md shadow-eko/10'
                    : 'border-ink-ghost/20 bg-white hover:border-eko/40'
                )}
              >
                {/* Badge */}
                <span className="absolute top-3 right-3 text-2xs px-2 py-0.5 rounded-full bg-eko/10 text-eko font-semibold">
                  {v.badge}
                </span>
                {/* Icon & name */}
                <div className="text-4xl mb-3">{v.icon}</div>
                <div className="font-display font-bold text-base text-ink-strong mb-1">{v.name}</div>
                <div className="text-xs font-semibold text-eko mb-2">{v.capacity}</div>
                <p className="text-xs text-ink-muted mb-3 leading-relaxed">{v.desc}</p>
                {/* Specs */}
                <ul className="space-y-1">
                  {v.specs.map(s => (
                    <li key={s} className="flex items-center gap-1.5 text-2xs text-ink-muted">
                      <span className="w-1 h-1 rounded-full bg-eko shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
                {/* Selected tick */}
                {field.value === v.id && (
                  <div className="absolute top-3 left-3 w-5 h-5 rounded-full bg-eko flex items-center justify-center">
                    <CheckCircle size={12} className="text-white" />
                  </div>
                )}
              </button>
            )}
          />
        ))}
      </div>
      {errors.vehicle && <p className="mt-3 text-xs text-red-500">{errors.vehicle.message}</p>}
    </div>
  )
}

function StepPickup({ control, errors }: any) {
  return (
    <div>
      <h2 className="font-display font-black text-2xl text-ink-strong mb-2">Pickup Information</h2>
      <p className="text-ink-muted text-sm mb-6">Where should we collect your shipment?</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Origin City</FieldLabel>
          <Controller name="pickupCity" control={control} render={({ field }) => (
            <InputField value={field.value} onChange={field.onChange} placeholder="Enter Pickup City" error={errors.pickupCity?.message} icon={MapPin} />
          )} />
        </div>
        <div>
          <FieldLabel required>Area / Locality</FieldLabel>
          <Controller name="pickupArea" control={control} render={({ field }) => (
            <InputField value={field.value} onChange={field.onChange} placeholder="e.g. Navrangpura" error={errors.pickupArea?.message} />
          )} />
        </div>
        <div>
          <FieldLabel required>Pickup Date</FieldLabel>
          <Controller name="pickupDate" control={control} render={({ field }) => (
            <InputField value={field.value} onChange={field.onChange} placeholder="" type="date" error={errors.pickupDate?.message} icon={Calendar} />
          )} />
        </div>
        <div>
          <FieldLabel required>Preferred Time</FieldLabel>
          <Controller name="pickupTime" control={control} render={({ field }) => (
            <SelectField value={field.value} onChange={field.onChange} options={TIME_SLOTS} placeholder="Select time" error={errors.pickupTime?.message} />
          )} />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel required>Full Pickup Address</FieldLabel>
          <Controller name="pickupAddress" control={control} render={({ field }) => (
            <div>
              <textarea
                value={field.value}
                onChange={e => field.onChange(e.target.value)}
                placeholder="Building, Street, Landmark..."
                rows={3}
                className={cn(
                  'w-full rounded-xl border px-4 py-3 text-sm bg-white resize-none',
                  'focus:outline-none focus:ring-2 focus:ring-eko/40 focus:border-eko transition-colors',
                  errors.pickupAddress ? 'border-red-400' : 'border-ink-ghost/30 hover:border-eko/50'
                )}
              />
              <FieldError msg={errors.pickupAddress?.message} />
            </div>
          )} />
        </div>
      </div>
    </div>
  )
}

// ─── Page wrapper (standalone /ekohaul/book route) ─────────────────────────

export function BookingWizard() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-header">
      <BookingWizardContent />
    </div>
  )
}

function StepDelivery({ control, errors }: any) {
  return (
    <div>
      <h2 className="font-display font-black text-2xl text-ink-strong mb-2">Delivery Information</h2>
      <p className="text-ink-muted text-sm mb-6">Where should we deliver your shipment?</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Destination City</FieldLabel>
          <Controller name="deliveryCity" control={control} render={({ field }) => (
            <InputField value={field.value} onChange={field.onChange} placeholder="Enter Delivery City" error={errors.deliveryCity?.message} icon={MapPin} />
          )} />
        </div>
        <div>
          <FieldLabel required>Area / Locality</FieldLabel>
          <Controller name="deliveryArea" control={control} render={({ field }) => (
            <InputField value={field.value} onChange={field.onChange} placeholder="e.g. Bandra West" error={errors.deliveryArea?.message} />
          )} />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel required>Expected Delivery Date</FieldLabel>
          <Controller name="deliveryDate" control={control} render={({ field }) => (
            <InputField value={field.value} onChange={field.onChange} placeholder="" type="date" error={errors.deliveryDate?.message} icon={Calendar} />
          )} />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel required>Full Delivery Address</FieldLabel>
          <Controller name="deliveryAddress" control={control} render={({ field }) => (
            <div>
              <textarea
                value={field.value}
                onChange={e => field.onChange(e.target.value)}
                placeholder="Building, Street, Landmark..."
                rows={3}
                className={cn(
                  'w-full rounded-xl border px-4 py-3 text-sm bg-white resize-none',
                  'focus:outline-none focus:ring-2 focus:ring-eko/40 focus:border-eko transition-colors',
                  errors.deliveryAddress ? 'border-red-400' : 'border-ink-ghost/30 hover:border-eko/50'
                )}
              />
              <FieldError msg={errors.deliveryAddress?.message} />
            </div>
          )} />
        </div>
      </div>
    </div>
  )
}

function StepShipment({ control, errors }: any) {
  return (
    <div>
      <h2 className="font-display font-black text-2xl text-ink-strong mb-2">Shipment Details</h2>
      <p className="text-ink-muted text-sm mb-6">Tell us about your cargo.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Goods Type</FieldLabel>
          <Controller name="goodsType" control={control} render={({ field }) => (
            <SelectField value={field.value} onChange={field.onChange} options={GOODS_TYPES} placeholder="Select goods type" error={errors.goodsType?.message} />
          )} />
        </div>
        <div>
          <FieldLabel required>Weight Range</FieldLabel>
          <Controller name="weightRange" control={control} render={({ field }) => (
            <SelectField value={field.value} onChange={field.onChange} options={WEIGHT_RANGES} placeholder="Select weight range" error={errors.weightRange?.message} />
          )} />
        </div>
        <div>
          <FieldLabel required>Package Size</FieldLabel>
          <Controller name="packageSize" control={control} render={({ field }) => (
            <div className="grid grid-cols-2 gap-2">
              {(['small', 'medium', 'large', 'extra-large'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => field.onChange(s)}
                  className={cn(
                    'py-2.5 px-3 rounded-xl border text-xs font-semibold capitalize transition-all',
                    field.value === s
                      ? 'border-eko bg-eko text-white'
                      : 'border-ink-ghost/30 text-ink-body hover:border-eko/50'
                  )}
                >
                  {s === 'extra-large' ? 'Extra Large' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          )} />
          {errors.packageSize && <FieldError msg={errors.packageSize.message} />}
        </div>
        <div>
          <FieldLabel required>Number of Packages</FieldLabel>
          <Controller name="numPackages" control={control} render={({ field }) => (
            <InputField value={String(field.value || '')} onChange={v => field.onChange(Number(v))} placeholder="e.g. 5" type="number" error={errors.numPackages?.message} icon={Hash} />
          )} />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel>Special Instructions</FieldLabel>
          <Controller name="specialInstructions" control={control} render={({ field }) => (
            <textarea
              value={field.value || ''}
              onChange={e => field.onChange(e.target.value)}
              placeholder="Fragile, temperature-sensitive, stacking restrictions..."
              rows={3}
              className="w-full rounded-xl border border-ink-ghost/30 hover:border-eko/50 px-4 py-3 text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-eko/40 focus:border-eko transition-colors"
            />
          )} />
        </div>
      </div>
    </div>
  )
}

function StepContact({ control, errors }: any) {
  return (
    <div>
      <h2 className="font-display font-black text-2xl text-ink-strong mb-2">Contact Information</h2>
      <p className="text-ink-muted text-sm mb-6">We&apos;ll send your booking confirmation here.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Full Name</FieldLabel>
          <Controller name="fullName" control={control} render={({ field }) => (
            <InputField value={field.value} onChange={field.onChange} placeholder="Your full name" error={errors.fullName?.message} icon={User} />
          )} />
        </div>
        <div>
          <FieldLabel>Company Name</FieldLabel>
          <Controller name="companyName" control={control} render={({ field }) => (
            <InputField value={field.value || ''} onChange={field.onChange} placeholder="Optional" icon={Building2} />
          )} />
        </div>
        <div>
          <FieldLabel required>Mobile Number</FieldLabel>
          <Controller name="mobile" control={control} render={({ field }) => (
            <InputField value={field.value} onChange={field.onChange} placeholder="10-digit mobile" type="tel" error={errors.mobile?.message} icon={Phone} />
          )} />
        </div>
        <div>
          <FieldLabel required>Email Address</FieldLabel>
          <Controller name="email" control={control} render={({ field }) => (
            <InputField value={field.value} onChange={field.onChange} placeholder="you@company.com" type="email" error={errors.email?.message} icon={Mail} />
          )} />
        </div>
        <div className="sm:col-span-2 mt-2">
          <p className="text-xs font-semibold text-ink-body mb-3">Confirmation via:</p>
          <div className="flex gap-4">
            {[
              { name: 'confirmWhatsApp', label: '📱 WhatsApp' },
              { name: 'confirmEmail', label: '📧 Email' },
            ].map(opt => (
              <Controller key={opt.name} name={opt.name as any} control={control} render={({ field }) => (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!field.value}
                    onChange={e => field.onChange(e.target.checked)}
                    className="w-4 h-4 accent-eko rounded"
                  />
                  <span className="text-sm text-ink-body">{opt.label}</span>
                </label>
              )} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StepSummary({ watch }: { watch: any }) {
  const data = watch()
  const vehicle = VEHICLES.find(v => v.id === data.vehicle)
  const est = data.pickupCity && data.deliveryCity && data.weightRange
    ? getEstimates(data.pickupCity, data.deliveryCity, data.weightRange)
    : null

  const rows: [string, string][] = [
    ['Vehicle', vehicle ? `${vehicle.icon} ${vehicle.name} (${vehicle.capacity})` : '—'],
    ['Pickup', `${data.pickupArea || '—'}, ${data.pickupCity || '—'}`],
    ['Pickup Date & Time', data.pickupDate ? `${data.pickupDate} at ${data.pickupTime}` : '—'],
    ['Delivery', `${data.deliveryArea || '—'}, ${data.deliveryCity || '—'}`],
    ['Delivery Date', data.deliveryDate || '—'],
    ['Goods Type', data.goodsType || '—'],
    ['Weight Range', data.weightRange || '—'],
    ['Package Size', data.packageSize || '—'],
    ['No. of Packages', String(data.numPackages || '—')],
    ['Contact', `${data.fullName || '—'} · ${data.mobile || '—'}`],
    ['Email', data.email || '—'],
  ]

  return (
    <div>
      <h2 className="font-display font-black text-2xl text-ink-strong mb-2">Booking Summary</h2>
      <p className="text-ink-muted text-sm mb-6">Review your booking before confirming.</p>

      {/* Estimates */}
      {est && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: MapPin, label: 'Est. Distance', value: `${est.dist} km` },
            { icon: Clock, label: 'Est. Transit', value: est.hours },
            { icon: Zap, label: 'Est. Cost', value: `₹${est.cost.toLocaleString('en-IN')}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl bg-eko/5 border border-eko/15 p-3 text-center">
              <Icon size={16} className="text-eko mx-auto mb-1" />
              <div className="font-display font-black text-lg text-eko">{value}</div>
              <div className="text-2xs text-ink-muted">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Details table */}
      <div className="rounded-2xl border border-ink-ghost/15 overflow-hidden">
        {rows.map(([key, val], i) => (
          <div key={key} className={cn('flex gap-4 px-4 py-3 text-sm', i % 2 === 0 ? 'bg-white' : 'bg-surface-mid')}>
            <span className="w-36 shrink-0 text-ink-muted font-medium">{key}</span>
            <span className="text-ink-strong font-semibold">{val}</span>
          </div>
        ))}
      </div>

      {data.specialInstructions && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold text-amber-700 mb-1">Special Instructions</p>
          <p className="text-sm text-amber-800">{data.specialInstructions}</p>
        </div>
      )}

      <p className="mt-4 text-xs text-ink-ghost text-center">
        * Estimated cost is indicative. Final invoice after vehicle assignment.
      </p>
    </div>
  )
}

function Confirmation({ bookingRef, watch }: { bookingRef: string; watch: any }) {
  const data = watch()
  const vehicle = VEHICLES.find(v => v.id === data.vehicle)

  return (
    <div className="text-center py-6">
      {/* Success icon */}
      <div className="w-20 h-20 rounded-full bg-eko/10 flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-eko" />
      </div>

      <h2 className="font-display font-black text-3xl text-ink-strong mb-2">
        Thank You for Choosing BGTS EV!
      </h2>
      <p className="text-ink-muted mb-8 max-w-md mx-auto">
        Your booking has been received. Our team will confirm within 30 minutes.
      </p>

      {/* Booking ref */}
      <div className="inline-flex items-center gap-3 bg-eko/5 border border-eko/20 rounded-2xl px-6 py-4 mb-8">
        <Hash size={18} className="text-eko" />
        <div className="text-left">
          <p className="text-xs text-ink-muted">Booking Reference</p>
          <p className="font-display font-black text-2xl text-eko tracking-wider">{bookingRef}</p>
        </div>
      </div>

      {/* Mini summary */}
      <div className="bg-surface-mid rounded-2xl p-5 max-w-sm mx-auto text-left mb-8">
        <div className="space-y-2">
          {vehicle && (
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">Vehicle</span>
              <span className="font-semibold">{vehicle.icon} {vehicle.name}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-ink-muted">Pickup</span>
            <span className="font-semibold">{data.pickupCity}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-muted">Delivery</span>
            <span className="font-semibold">{data.deliveryCity}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-muted">Pickup Date</span>
            <span className="font-semibold">{data.pickupDate}</span>
          </div>
        </div>
      </div>

      {/* Stars */}
      <div className="flex justify-center gap-1 mb-6">
        {[1,2,3,4,5].map(i => <Star key={i} size={18} className="text-amber-400 fill-amber-400" />)}
      </div>
      <p className="text-xs text-ink-muted mb-8">
        Confirmation sent to <strong>{data.email}</strong>
        {data.confirmWhatsApp && ` and WhatsApp ${data.mobile}`}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="primary" asChild>
          <Link href="/ekohaul">Back to BGTS EV</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/tracking">Track My Shipment</Link>
        </Button>
      </div>
    </div>
  )
}

// ─── Step field keys for validation ───────────────────────────────────────

const STEP_FIELDS: (keyof BookingFormData)[][] = [
  ['vehicle'],
  ['pickupCity', 'pickupArea', 'pickupDate', 'pickupTime', 'pickupAddress'],
  ['deliveryCity', 'deliveryArea', 'deliveryDate', 'deliveryAddress'],
  ['goodsType', 'packageSize', 'weightRange', 'numPackages'],
  ['fullName', 'mobile', 'email'],
  [], // summary — no new fields
]

// ─── Main wizard ──────────────────────────────────────────────────────────

export function BookingWizardContent({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [bookingRef] = useState(genRef)

  const {
    control, watch, trigger, formState: { errors },
    handleSubmit,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      vehicle: undefined,
      pickupCity: '', pickupArea: '', pickupDate: '', pickupTime: '', pickupAddress: '',
      deliveryCity: '', deliveryArea: '', deliveryDate: '', deliveryAddress: '',
      goodsType: '', packageSize: undefined, weightRange: '', numPackages: 1,
      specialInstructions: '',
      fullName: '', companyName: '', mobile: '', email: '',
      confirmWhatsApp: true, confirmEmail: true,
    },
    mode: 'onChange',
  })

  const totalSteps = STEPS.length

  const goNext = useCallback(async () => {
    const fields = STEP_FIELDS[step]
    const valid = fields.length === 0 || await trigger(fields)
    if (!valid) return
    setDirection(1)
    setStep(s => Math.min(s + 1, totalSteps - 1))
  }, [step, trigger, totalSteps])

  const goPrev = useCallback(() => {
    setDirection(-1)
    setStep(s => Math.max(s - 1, 0))
  }, [])

  const onSubmit = useCallback(async (data: BookingFormData) => {
    // Fire-and-forget email to res@acasa.co
    try {
      await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, bookingRef }),
      })
    } catch {
      // Email failure should not block confirmation screen
    }
    setSubmitted(true)
    onComplete?.()
  }, [bookingRef, onComplete])

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  }

  if (submitted) {
    return (
      <div className="p-6 md:p-8">
        <Confirmation bookingRef={bookingRef} watch={watch} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="px-4 py-6 md:px-0 md:py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-eko/10 border border-eko/20 mb-4">
            <Zap size={13} className="text-eko" />
            <span className="text-eko text-xs font-bold tracking-wider uppercase">BGTS EV Booking</span>
          </div>
          <h1 className="font-display font-black text-3xl md:text-4xl text-ink-strong mb-2">
            Book Your EV Freight
          </h1>
          <p className="text-ink-muted text-sm">Complete in under 2 minutes · Zero-emission delivery</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const done = i < step
              const active = i === step
              return (
                <div key={s.label} className="flex flex-col items-center gap-1 flex-1">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                    done ? 'bg-eko text-white' : active ? 'bg-eko text-white ring-4 ring-eko/20' : 'bg-ink-ghost/15 text-ink-ghost'
                  )}>
                    {done ? <CheckCircle size={14} /> : <Icon size={14} />}
                  </div>
                  <span className={cn(
                    'text-2xs font-medium hidden sm:block',
                    active ? 'text-eko' : done ? 'text-ink-body' : 'text-ink-ghost'
                  )}>{s.label}</span>
                </div>
              )
            })}
          </div>
          <div className="relative h-1.5 bg-ink-ghost/15 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-eko rounded-full"
              animate={{ width: `${((step) / (totalSteps - 1)) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </div>
          <p className="text-xs text-ink-muted text-right mt-1">Step {step + 1} of {totalSteps}</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-ink-strong/5 border border-ink-ghost/10 overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6 md:p-8 min-h-[480px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: 'easeInOut' }}
                >
                  {step === 0 && <StepVehicle control={control} errors={errors} watch={watch} />}
                  {step === 1 && <StepPickup control={control} errors={errors} />}
                  {step === 2 && <StepDelivery control={control} errors={errors} />}
                  {step === 3 && <StepShipment control={control} errors={errors} />}
                  {step === 4 && <StepContact control={control} errors={errors} />}
                  {step === 5 && <StepSummary watch={watch} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Nav footer */}
            <div className="px-6 md:px-8 py-5 border-t border-ink-ghost/10 flex items-center justify-between bg-surface-mid">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={goPrev}
                  className="flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink-strong transition-colors"
                >
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <Link href="/ekohaul" className="flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink-strong transition-colors">
                  <ArrowLeft size={16} /> BGTS EV
                </Link>
              )}

              {step < totalSteps - 1 ? (
                <Button
                  type="button"
                  variant="eko"
                  size="md"
                  icon={<ArrowRight size={16} />}
                  onClick={goNext}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="eko"
                  size="md"
                  icon={<CheckCircle size={16} />}
                  iconPosition="left"
                >
                  Confirm Booking
                </Button>
              )}
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}
