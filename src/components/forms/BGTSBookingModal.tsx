'use client'

import { useState, useCallback, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, ChevronDown, ArrowLeft, ArrowRight, Check, CheckCircle, Hash, Truck, Weight } from 'lucide-react'
import { useBookingModal } from '@/contexts/BookingModalContext'
import { cn } from '@/lib/utils'

// ─── Transport Vehicles (18) ───────────────────────────────────────────────

type VehicleCategory = 'Small' | 'Medium' | 'Heavy' | 'Container' | 'ODC'

interface Vehicle {
  id: string
  name: string
  category: VehicleCategory
  maxLoad: string
  size?: string
}

const VEHICLES: Vehicle[] = [
  // Small
  { id: '4-wheeler-pickup',    name: '4 Wheeler Pickup',       category: 'Small',     size: '8×4.8 ft',  maxLoad: '1.5 Ton' },
  // Medium
  { id: 'tata-407',            name: 'TATA 407',               category: 'Medium',    size: '10×5.5 ft', maxLoad: '2.5 Ton' },
  { id: 'vehicle-14ft',        name: 'Vehicle 14 FEET',        category: 'Medium',    size: '14×7 ft',   maxLoad: '4 Ton'   },
  { id: 'vehicle-17ft',        name: 'Vehicle 17 FEET',        category: 'Medium',    size: '17×7 ft',   maxLoad: '5 Ton'   },
  { id: 'vehicle-19ft',        name: 'Vehicle 19 FEET',        category: 'Medium',    size: '19×7.5 ft', maxLoad: '7–9 Ton' },
  { id: 'vehicle-22ft',        name: 'Vehicle 22 FEET',        category: 'Medium',    size: '22×7.5 ft', maxLoad: '10 Ton'  },
  // Heavy
  { id: 'vehicle-9t',          name: 'Vehicle 9T',             category: 'Heavy',     maxLoad: '9 Ton'   },
  { id: 'vehicle-16t',         name: 'Vehicle 16T',            category: 'Heavy',     maxLoad: '16 Ton'  },
  { id: 'vehicle-21t',         name: 'Vehicle 21T',            category: 'Heavy',     maxLoad: '21 Ton'  },
  { id: 'vehicle-25t',         name: 'Vehicle 25T',            category: 'Heavy',     maxLoad: '25 Ton'  },
  // Container
  { id: 'container-20ft',      name: 'Container 20 FT',        category: 'Container', size: '20×8 ft',   maxLoad: '6.5 Ton' },
  { id: 'container-32ft-sxl',  name: 'Container 32 FT SXL',   category: 'Container', size: '32×8 ft',   maxLoad: '7 Ton'   },
  { id: 'container-32ft-mxl',  name: 'Container 32 FT MXL',   category: 'Container', size: '32×8.5 ft', maxLoad: '14 Ton'  },
  { id: 'container-32ft-hq',   name: 'Container 32 FT HQ',    category: 'Container', size: '32×9.5 ft', maxLoad: '14 Ton'  },
  // ODC
  { id: 'odc-20ft',            name: '20 FT Open ODC',         category: 'ODC',       size: '20×8 ft',   maxLoad: '7 Ton'   },
  { id: 'odc-32ft-trailer',    name: '32 FT Trailer ODC',      category: 'ODC',       size: '32×8 ft',   maxLoad: '25 Ton'  },
  { id: 'odc-40ft-trailer',    name: '40 FT Open Trailer ODC', category: 'ODC',       size: '40×8 ft',   maxLoad: '32 Ton'  },
  { id: 'vehicle-max-42t',     name: 'Vehicle Max 42T',        category: 'ODC',       size: '40+ ft',    maxLoad: '42 Ton'  },
]

// Auto-lock weight range from vehicle max load
const VEHICLE_WEIGHT_AUTO: Record<string, string> = {
  '4-wheeler-pickup':   '1–5 Ton',
  'tata-407':           '1–5 Ton',
  'vehicle-14ft':       '1–5 Ton',
  'vehicle-17ft':       '1–5 Ton',
  'vehicle-19ft':       '5–10 Ton',
  'vehicle-22ft':       '5–10 Ton',
  'vehicle-9t':         '5–10 Ton',
  'vehicle-16t':        '10–20 Ton',
  'vehicle-21t':        'Above 20 Ton',
  'vehicle-25t':        'Above 20 Ton',
  'container-20ft':     '5–10 Ton',
  'container-32ft-sxl': '5–10 Ton',
  'container-32ft-mxl': '10–20 Ton',
  'container-32ft-hq':  '10–20 Ton',
  'odc-20ft':           '5–10 Ton',
  'odc-32ft-trailer':   'Above 20 Ton',
  'odc-40ft-trailer':   'Above 20 Ton',
  'vehicle-max-42t':    'Above 20 Ton',
}

// ─── Category colours ──────────────────────────────────────────────────────

const CAT_DOT: Record<VehicleCategory, string> = {
  'Small':     'bg-blue-500',
  'Medium':    'bg-emerald-500',
  'Heavy':     'bg-orange-500',
  'Container': 'bg-purple-500',
  'ODC':       'bg-red-500',
}

const CAT_BADGE: Record<VehicleCategory, string> = {
  'Small':     'bg-blue-50 text-blue-700',
  'Medium':    'bg-emerald-50 text-emerald-700',
  'Heavy':     'bg-orange-50 text-orange-700',
  'Container': 'bg-purple-50 text-purple-700',
  'ODC':       'bg-red-50 text-red-700',
}

// ─── Category tab data ──────────────────────────────────────────────────────

const TABS = [
  {
    id: 'pickup',
    label: 'Pickup',
    short: 'Pickup',
    color: 'from-blue-600 to-blue-400',
    dot: 'bg-blue-500',
    ids: ['4-wheeler-pickup', 'tata-407'],
  },
  {
    id: 'light',
    label: 'Light Commercial',
    short: 'Light',
    color: 'from-emerald-600 to-emerald-400',
    dot: 'bg-emerald-500',
    ids: ['vehicle-14ft', 'vehicle-17ft', 'vehicle-19ft', 'vehicle-22ft'],
  },
  {
    id: 'heavy',
    label: 'Heavy Commercial',
    short: 'Heavy',
    color: 'from-orange-600 to-orange-400',
    dot: 'bg-orange-500',
    ids: ['vehicle-9t', 'vehicle-16t', 'vehicle-21t', 'vehicle-25t'],
  },
  {
    id: 'container',
    label: 'Container',
    short: 'Container',
    color: 'from-purple-600 to-purple-400',
    dot: 'bg-purple-500',
    ids: ['container-20ft', 'container-32ft-sxl', 'container-32ft-mxl', 'container-32ft-hq'],
  },
  {
    id: 'odc',
    label: 'ODC / Specialized',
    short: 'ODC',
    color: 'from-rose-600 to-rose-400',
    dot: 'bg-rose-500',
    ids: ['odc-20ft', 'odc-32ft-trailer', 'odc-40ft-trailer', 'vehicle-max-42t'],
  },
] as const

// ─── Per-vehicle SVG illustrations ─────────────────────────────────────────

function VehicleSVG({ id, className }: { id: string; className?: string }) {
  // Pickup / small van
  if (id === '4-wheeler-pickup' || id === 'tata-407') {
    return (
      <svg viewBox="0 0 120 56" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="22" width="64" height="22" rx="3" fill="white" fillOpacity="0.25"/>
        <rect x="30" y="12" width="38" height="14" rx="3" fill="white" fillOpacity="0.35"/>
        <circle cx="24" cy="45" r="8" fill="white" fillOpacity="0.9"/>
        <circle cx="24" cy="45" r="4" fill="white" fillOpacity="0.4"/>
        <circle cx="80" cy="45" r="8" fill="white" fillOpacity="0.9"/>
        <circle cx="80" cy="45" r="4" fill="white" fillOpacity="0.4"/>
        <rect x="70" y="22" width="30" height="18" rx="2" fill="white" fillOpacity="0.2"/>
        <rect x="74" y="26" width="8" height="8" rx="1" fill="white" fillOpacity="0.5"/>
        <rect x="94" y="30" width="14" height="4" rx="1" fill="white" fillOpacity="0.3"/>
        <line x1="8" y1="44" x2="14" y2="44" stroke="white" strokeOpacity="0.4" strokeWidth="1.5"/>
        <line x1="34" y1="44" x2="66" y2="44" stroke="white" strokeOpacity="0.4" strokeWidth="1.5"/>
        <line x1="90" y1="44" x2="110" y2="44" stroke="white" strokeOpacity="0.4" strokeWidth="1.5"/>
      </svg>
    )
  }
  // Light/Medium truck (14–22ft body)
  if (['vehicle-14ft','vehicle-17ft','vehicle-19ft','vehicle-22ft'].includes(id)) {
    const bodyW = id === 'vehicle-14ft' ? 52 : id === 'vehicle-17ft' ? 60 : id === 'vehicle-19ft' ? 66 : 72
    return (
      <svg viewBox="0 0 140 56" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="20" width={bodyW} height="24" rx="2" fill="white" fillOpacity="0.25"/>
        <rect x={bodyW+6} y="20" width="30" height="20" rx="3" fill="white" fillOpacity="0.30"/>
        <rect x={bodyW+10} y="24" width="10" height="10" rx="1" fill="white" fillOpacity="0.5"/>
        <circle cx="22" cy="46" r="8" fill="white" fillOpacity="0.9"/>
        <circle cx="22" cy="46" r="4" fill="white" fillOpacity="0.35"/>
        <circle cx={bodyW+20} cy="46" r="8" fill="white" fillOpacity="0.9"/>
        <circle cx={bodyW+20} cy="46" r="4" fill="white" fillOpacity="0.35"/>
        <rect x={bodyW+38} y="32" width="16" height="6" rx="1" fill="white" fillOpacity="0.25"/>
      </svg>
    )
  }
  // Heavy truck (multi-axle)
  if (['vehicle-9t','vehicle-16t','vehicle-21t','vehicle-25t'].includes(id)) {
    return (
      <svg viewBox="0 0 150 56" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="18" width="80" height="26" rx="2" fill="white" fillOpacity="0.22"/>
        <rect x="84" y="20" width="34" height="22" rx="3" fill="white" fillOpacity="0.30"/>
        <rect x="88" y="24" width="12" height="12" rx="1" fill="white" fillOpacity="0.50"/>
        <circle cx="18" cy="46" r="8" fill="white" fillOpacity="0.9"/>
        <circle cx="18" cy="46" r="4" fill="white" fillOpacity="0.35"/>
        <circle cx="36" cy="46" r="8" fill="white" fillOpacity="0.9"/>
        <circle cx="36" cy="46" r="4" fill="white" fillOpacity="0.35"/>
        <circle cx="98" cy="46" r="8" fill="white" fillOpacity="0.9"/>
        <circle cx="98" cy="46" r="4" fill="white" fillOpacity="0.35"/>
        <circle cx="116" cy="46" r="8" fill="white" fillOpacity="0.9"/>
        <circle cx="116" cy="46" r="4" fill="white" fillOpacity="0.35"/>
        <rect x="120" y="32" width="20" height="6" rx="1" fill="white" fillOpacity="0.22"/>
      </svg>
    )
  }
  // Container truck
  if (id.startsWith('container')) {
    return (
      <svg viewBox="0 0 160 56" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="14" width="96" height="28" rx="2" fill="white" fillOpacity="0.22"/>
        {/* container lines */}
        <line x1="28" y1="14" x2="28" y2="42" stroke="white" strokeOpacity="0.2" strokeWidth="1"/>
        <line x1="52" y1="14" x2="52" y2="42" stroke="white" strokeOpacity="0.2" strokeWidth="1"/>
        <line x1="76" y1="14" x2="76" y2="42" stroke="white" strokeOpacity="0.2" strokeWidth="1"/>
        <rect x="100" y="20" width="34" height="22" rx="3" fill="white" fillOpacity="0.30"/>
        <rect x="104" y="24" width="12" height="12" rx="1" fill="white" fillOpacity="0.50"/>
        <circle cx="20" cy="46" r="8" fill="white" fillOpacity="0.9"/>
        <circle cx="20" cy="46" r="4" fill="white" fillOpacity="0.35"/>
        <circle cx="60" cy="46" r="8" fill="white" fillOpacity="0.9"/>
        <circle cx="60" cy="46" r="4" fill="white" fillOpacity="0.35"/>
        <circle cx="116" cy="46" r="8" fill="white" fillOpacity="0.9"/>
        <circle cx="116" cy="46" r="4" fill="white" fillOpacity="0.35"/>
        <rect x="136" y="32" width="18" height="6" rx="1" fill="white" fillOpacity="0.22"/>
      </svg>
    )
  }
  // ODC flatbed/trailer
  return (
    <svg viewBox="0 0 170 56" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Trailer flatbed */}
      <rect x="4" y="30" width="110" height="10" rx="2" fill="white" fillOpacity="0.22"/>
      {/* Cargo block */}
      <rect x="10" y="16" width="60" height="14" rx="2" fill="white" fillOpacity="0.18"/>
      <line x1="25" y1="16" x2="25" y2="30" stroke="white" strokeOpacity="0.15" strokeWidth="1"/>
      <line x1="40" y1="16" x2="40" y2="30" stroke="white" strokeOpacity="0.15" strokeWidth="1"/>
      <line x1="55" y1="16" x2="55" y2="30" stroke="white" strokeOpacity="0.15" strokeWidth="1"/>
      {/* Cab */}
      <rect x="116" y="20" width="32" height="22" rx="3" fill="white" fillOpacity="0.30"/>
      <rect x="120" y="24" width="11" height="11" rx="1" fill="white" fillOpacity="0.50"/>
      {/* Wheels */}
      <circle cx="18" cy="44" r="8" fill="white" fillOpacity="0.9"/>
      <circle cx="18" cy="44" r="4" fill="white" fillOpacity="0.35"/>
      <circle cx="40" cy="44" r="8" fill="white" fillOpacity="0.9"/>
      <circle cx="40" cy="44" r="4" fill="white" fillOpacity="0.35"/>
      <circle cx="80" cy="44" r="8" fill="white" fillOpacity="0.9"/>
      <circle cx="80" cy="44" r="4" fill="white" fillOpacity="0.35"/>
      <circle cx="130" cy="44" r="8" fill="white" fillOpacity="0.9"/>
      <circle cx="130" cy="44" r="4" fill="white" fillOpacity="0.35"/>
      <circle cx="148" cy="44" r="8" fill="white" fillOpacity="0.9"/>
      <circle cx="148" cy="44" r="4" fill="white" fillOpacity="0.35"/>
      <rect x="150" y="32" width="14" height="5" rx="1" fill="white" fillOpacity="0.22"/>
    </svg>
  )
}

// ─── Step 1 — Vehicle selection with category tabs ────────────────────────

function StepVehicle({ selected, onSelect, onNext, onClose }: {
  selected: string; onSelect: (id: string) => void; onNext: () => void; onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('pickup')

  // Auto-switch tab to show the selected vehicle
  const tab = TABS.find(t => (t.ids as readonly string[]).includes(selected))
  const displayTab = activeTab

  const currentTab    = TABS.find(t => t.id === displayTab)!
  const tabVehicles   = VEHICLES.filter(v => (currentTab.ids as readonly string[]).includes(v.id))
  const gradientClass = currentTab.color

  return (
    <div className="flex flex-col bg-gray-50">
      {/* ── Top header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
            <Truck size={15} className="text-white" />
          </div>
          <div>
            <p className="font-display font-black text-sm text-gray-900 leading-none">Select Your Vehicle</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Step 1 of 3 · 18 vehicles across 5 categories</p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close"
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
          <X size={15} className="text-gray-500" />
        </button>
      </div>

      {/* ── Category tabs ── */}
      {/* ── Category tabs ── */}
      <div className="shrink-0 bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {TABS.map(t => {
            const isActive = t.id === displayTab
            const hasSelected = (t.ids as readonly string[]).includes(selected)
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  'shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-bold transition-all duration-150 whitespace-nowrap',
                  isActive
                    ? 'bg-brand text-white border-brand shadow-md shadow-brand/25'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-brand hover:text-brand hover:bg-brand/5 hover:shadow-sm'
                )}
              >
                <span className={cn(
                  'w-2 h-2 rounded-full shrink-0',
                  isActive ? 'bg-white/70' : t.dot
                )} />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.short}</span>
                {hasSelected && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Vehicle cards ── */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {tabVehicles.map(v => {
            const isSelected = selected === v.id
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelect(v.id)}
                className={cn(
                  'relative text-left rounded-2xl border-2 overflow-hidden transition-all duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                  'hover:shadow-lg hover:-translate-y-1',
                  isSelected
                    ? 'border-brand shadow-md shadow-brand/20 scale-[1.02]'
                    : 'border-gray-200 bg-white hover:border-brand/50'
                )}
              >
                {/* Gradient illustration area */}
                <div className={cn(
                  'relative w-full bg-gradient-to-br px-3 pt-6 pb-3',
                  gradientClass
                )}>
                  <VehicleSVG id={v.id} className="w-full h-14" />
                  {/* Selected check badge */}
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md">
                      <Check size={12} className="text-brand" />
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className={cn(
                  'px-3 py-3 bg-white',
                  isSelected && 'bg-brand/[0.03]'
                )}>
                  <p className={cn(
                    'font-display font-black text-base leading-tight mb-1',
                    isSelected ? 'text-brand' : 'text-gray-900'
                  )}>
                    {v.name}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    Max {v.maxLoad}
                  </p>
                  {v.size && (
                    <p className="text-[10px] text-gray-400 mt-0.5">{v.size}</p>
                  )}
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full">
                      <Check size={8} /> Selected
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-3.5 border-t border-gray-200 bg-white flex items-center justify-between shrink-0">
        <p className="text-sm text-gray-500">
          {selected
            ? <span className="text-brand font-semibold flex items-center gap-1.5">
                <Check size={13} className="shrink-0" />
                {VEHICLES.find(v => v.id === selected)?.name}
              </span>
            : <span className="text-gray-400">No vehicle selected yet</span>
          }
        </p>
        <button
          type="button"
          onClick={onNext}
          disabled={!selected}
          className={cn(
            'inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all',
            selected
              ? 'bg-brand text-white hover:bg-brand/90 shadow-md shadow-brand/20 hover:-translate-y-0.5'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          Continue <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
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
  'Under 1 Ton', '1–5 Ton', '5–10 Ton', '10–20 Ton', 'Above 20 Ton',
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

// ─── Step 2 — Booking form ────────────────────────────────────────────────

function StepForm({ control, register, errors, selectedId, setValue, onBack, onNext }: {
  control: any; register: any; errors: any; setValue: any
  selectedId: string; onBack: () => void; onNext: () => void
}) {
  const vehicle    = VEHICLES.find(v => v.id === selectedId)
  const autoWeight = VEHICLE_WEIGHT_AUTO[selectedId] ?? null

  useEffect(() => {
    if (autoWeight) {
      setValue('weightRange', autoWeight, { shouldValidate: true })
    }
  }, [autoWeight, setValue])

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors" aria-label="Back">
            <ArrowLeft size={14} className="text-gray-500" />
          </button>
          <div>
            <p className="font-display font-black text-sm text-gray-900 leading-none">Step 2 of 3 — Shipment Details</p>
            <p className="text-[11px] text-gray-500">{vehicle?.name} · Max {vehicle?.maxLoad}</p>
          </div>
        </div>
        <Dialog.Close asChild>
          <button type="button" aria-label="Close"
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X size={14} className="text-gray-500" />
          </button>
        </Dialog.Close>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
        <div className="grid md:grid-cols-2 gap-x-5 gap-y-3.5">
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
            {autoWeight ? (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-brand/30 bg-brand/5">
                <Weight size={14} className="text-brand shrink-0" aria-hidden="true" />
                <span className="text-sm font-semibold text-brand">{autoWeight}</span>
                <span className="ml-auto text-[10px] text-brand/70 font-bold bg-brand/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Auto · Vehicle capacity
                </span>
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
            {errors.weightRange && !autoWeight && <Err msg={errors.weightRange?.message} />}
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
      <div className="px-5 py-3.5 border-t border-gray-100 bg-white flex justify-end shrink-0">
        <button type="button" onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand/90 shadow-md shadow-brand/20 hover:-translate-y-0.5 transition-all">
          Review Booking <ArrowRight size={14} />
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
    ['Vehicle',  vehicle?.name ?? ''],
    ['Max Load', vehicle?.maxLoad ?? ''],
    ['From',     data.pickupCity],
    ['To',       data.deliveryCity],
    ['Date',     data.pickupDate],
    ['Time',     data.pickupTime],
    ['Goods',    data.goodsType],
    ['Weight',   data.weightRange],
    ...(data.numberOfPackages   ? [['Packages', data.numberOfPackages]   as [string,string]] : []),
    ...(data.additionalServices ? [['Add-ons',  data.additionalServices] as [string,string]] : []),
    ['Name',     data.fullName],
    ['Mobile',   data.mobile],
    ['Email',    data.email],
    ...(data.companyName         ? [['Company', data.companyName]         as [string,string]] : []),
    ...(data.specialInstructions ? [['Notes',   data.specialInstructions] as [string,string]] : []),
  ]

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors" aria-label="Back">
            <ArrowLeft size={14} className="text-gray-500" />
          </button>
          <div>
            <p className="font-display font-black text-sm text-gray-900 leading-none">Step 3 of 3 — Confirm Booking</p>
            <p className="text-[11px] text-gray-500">Review and confirm your booking</p>
          </div>
        </div>
        <Dialog.Close asChild>
          <button type="button" aria-label="Close"
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X size={14} className="text-gray-500" />
          </button>
        </Dialog.Close>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
        <h2 className="font-display font-black text-xl text-gray-900 mb-1">Booking Summary</h2>
        <p className="text-sm text-gray-500 mb-4">Please review before confirming.</p>
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          {rows.map(([k, v], i) => (
            <div key={k} className={cn('flex px-4 py-2.5 text-sm', i % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
              <span className="w-24 shrink-0 text-gray-500 font-medium text-xs uppercase tracking-wide mt-0.5">{k}</span>
              <span className="text-gray-900 font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
        <p className="text-xs text-gray-400">Response within 30 min · GST invoice guaranteed</p>
        <button type="submit" disabled={submitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand/90 transition-all disabled:opacity-60 shadow-lg shadow-brand/20 hover:-translate-y-0.5">
          {submitting ? 'Submitting…' : 'Confirm Booking →'}
        </button>
      </div>
    </div>
  )
}

// ─── Success ──────────────────────────────────────────────────────────────

function SuccessScreen({ bookingRef, data, emailWarning, onClose }: { bookingRef: string; data: FormData; emailWarning?: boolean; onClose: () => void }) {
  const vehicle = VEHICLES.find(v => v.id === data.vehicleId)
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mb-5">
        <CheckCircle size={32} className="text-brand" />
      </div>
      <h3 className="font-display font-black text-2xl text-gray-900 mb-2">Booking Confirmed!</h3>
      <p className="text-gray-500 text-sm mb-4 max-w-md">
        Thank you for booking with BGTS. Our team will confirm within 30 minutes on {data.email}.
      </p>
      {emailWarning && (
        <div className="mb-4 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs max-w-sm text-center">
          ⚠️ Booking saved but notification email could not be sent. Please call <strong>+91 63 5722 5722</strong> to confirm.
        </div>
      )}
      <div className="inline-flex items-center gap-3 bg-brand/5 border border-brand/20 rounded-xl px-6 py-3.5 mb-6">
        <Hash size={16} className="text-brand" />
        <div className="text-left">
          <p className="text-xs text-gray-500">Booking Reference</p>
          <p className="font-display font-black text-xl text-brand tracking-wider">{bookingRef}</p>
        </div>
      </div>
      <div className="bg-gray-50 rounded-xl p-4 w-full max-w-xs text-left mb-6 space-y-2 text-sm">
        {vehicle && <div className="flex justify-between"><span className="text-gray-500">Vehicle</span><span className="font-semibold">{vehicle.name}</span></div>}
        <div className="flex justify-between"><span className="text-gray-500">Route</span><span className="font-semibold">{data.pickupCity} → {data.deliveryCity}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Pickup</span><span className="font-semibold">{data.pickupDate} · {data.pickupTime}</span></div>
      </div>
      <button type="button" onClick={onClose}
        className="px-8 py-3 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand/90 transition-colors shadow-md shadow-brand/20">
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
    setTimeout(() => { setStep(1); setSubmitted(false); setSubmitting(false); setEmailWarning(false); reset() }, 300)
  }, [closeModal, reset])

  const goToSummary = handleSubmit(data => {
    setSummaryData(data)
    setStep(3)
  })

  const [emailWarning, setEmailWarning] = useState(false)

  const confirmSubmit = useCallback(async () => {
    if (!summaryData) return
    setSubmitting(true)
    const vehicle = VEHICLES.find(v => v.id === summaryData.vehicleId)
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...summaryData,
          bookingRef,
          serviceType: 'BGTS Transport Booking',
          vehicleType: vehicle ? `${vehicle.name} (Max ${vehicle.maxLoad})` : summaryData.vehicleId,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || json.success === false) {
        console.error('[booking] API error:', json.error)
        setEmailWarning(true)
      }
    } catch (err) {
      console.error('[booking] fetch error:', err)
      setEmailWarning(true)
    }
    // Fire Google Ads conversion on successful booking
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      ;(window as any).gtag('event', 'conversion', {
        send_to:  'AW-18267437854/96quCNSL0cQcEJ72y4ZE',
        value:    1.0,
        currency: 'INR',
      })
    }
    setSubmitting(false)
    setSubmitted(true)
  }, [summaryData, bookingRef])

  return (
    <Dialog.Root open={open} onOpenChange={o => !o && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed z-[101] flex flex-col bg-[#FAFAF8] shadow-2xl outline-none overflow-hidden',
            'inset-0 rounded-none',
            'sm:inset-auto sm:rounded-2xl',
            'sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
            'sm:w-[92vw] sm:max-w-[1100px] sm:max-h-[90vh]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:zoom-out-95',
            'data-[state=open]:slide-in-from-bottom-3 data-[state=closed]:slide-out-to-bottom-3',
          )}
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">BGTS Transport Booking</Dialog.Title>

          {submitted && summaryData ? (
            <SuccessScreen bookingRef={bookingRef} data={summaryData} emailWarning={emailWarning} onClose={handleClose} />
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
                selectedId={selectedId} setValue={setValue}
                onBack={() => setStep(1)} onNext={goToSummary}
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
