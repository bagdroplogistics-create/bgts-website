'use client'

import { useState, useCallback, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  X, ChevronDown, ArrowLeft, ArrowRight, Check,
  CheckCircle, Hash, Truck, Warehouse, Layers, Package, Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Service config ────────────────────────────────────────────────────────

export interface ServiceConfig {
  name: string           // display name
  slug: string
  specificLabel: string  // label for service-specific field
  specificPlaceholder: string
  specificOptions?: string[] // if set → <select>, else → <textarea>
}

export const SERVICE_CONFIGS: Record<string, ServiceConfig> = {
  'full-truck-load': {
    name: 'Full Truck Load (FTL)',
    slug: 'full-truck-load',
    specificLabel: 'Vehicle Requirement',
    specificPlaceholder: 'e.g. 32 ft container, 10-tyre truck, flatbed...',
  },
  'warehousing': {
    name: 'Warehousing',
    slug: 'warehousing',
    specificLabel: 'Warehousing Space Required',
    specificPlaceholder: 'e.g. 5,000 sq ft, cold storage, racking required...',
  },
  'heavy-odc': {
    name: 'Heavy & ODC Transportation',
    slug: 'heavy-odc',
    specificLabel: 'ODC Cargo Details',
    specificPlaceholder: 'e.g. dimensions (L×W×H), weight, cargo type, escorts needed...',
  },
  'multimodal': {
    name: 'Multimodal Transportation',
    slug: 'multimodal',
    specificLabel: 'Transport Mode Required',
    specificPlaceholder: '',
    specificOptions: [
      'Road + Rail',
      'Road + Air',
      'Road + Sea',
      'Rail + Road + Sea',
      'Other (specify in notes)',
    ],
  },
  'contract-logistics': {
    name: 'Contract Logistics',
    slug: 'contract-logistics',
    specificLabel: 'Contract Duration',
    specificPlaceholder: '',
    specificOptions: [
      '1 Month (Trial)',
      '3 Months',
      '6 Months',
      '1 Year',
      '2+ Years',
      'Open-ended / Ongoing',
    ],
  },
}

// ─── Schema ───────────────────────────────────────────────────────────────

const schema = z.object({
  serviceSlug:         z.string(),
  fullName:            z.string().min(2, 'Enter your full name'),
  companyName:         z.string().optional(),
  mobile:              z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile'),
  email:               z.string().email('Enter valid email'),
  originCity:          z.string().min(2, 'Enter origin city'),
  destinationCity:     z.string().min(2, 'Enter destination city').optional().or(z.literal('')),
  pickupDate:          z.string().optional(),
  goodsType:           z.string().min(1, 'Select goods type'),
  weightLoad:          z.string().min(1, 'Select weight / load'),
  numberOfPackages:    z.string().optional(),
  serviceSpecific:     z.string().optional(),
  specialInstructions: z.string().optional(),
  additionalRequirements: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const GOODS_TYPES = [
  'Electronics', 'FMCG', 'Industrial Materials', 'Retail Products',
  'Pharma & Healthcare', 'Textiles & Apparel', 'Auto Parts',
  'Food Products', 'Chemicals', 'Machinery / Equipment', 'Other',
]
const WEIGHT_OPTIONS = [
  'Under 500 KG', '500 KG – 1 Ton', '1 – 5 Ton',
  '5 – 10 Ton', '10 – 20 Ton', '20 – 40 Ton', 'Above 40 Ton',
]

function genRef() {
  return 'SVC' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors ' +
  'placeholder-gray-400'
const selectCls = inputCls + ' appearance-none pr-9'
const readonlyCls =
  'w-full rounded-lg border border-brand/30 bg-brand/5 px-3.5 py-2.5 text-sm ' +
  'text-brand font-semibold cursor-default select-none'

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

// ─── Step 1 — Booking form ────────────────────────────────────────────────

function StepForm({ control, register, errors, config, onNext, onClose }: {
  control: any; register: any; errors: any
  config: ServiceConfig; onNext: () => void; onClose: () => void
}) {
  const isWarehousing = config.slug === 'warehousing'

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
            <Truck size={15} className="text-white" />
          </div>
          <div>
            <p className="font-display font-black text-sm text-gray-900 leading-none">Service Inquiry — BGTS</p>
            <p className="text-xs text-gray-500">Step 1 of 2 · Fill in your details</p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close"
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
          <X size={15} className="text-gray-500" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* Selected service banner */}
        <div className="mb-6 p-4 bg-brand/5 border border-brand/20 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
            <Layers size={16} className="text-brand" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Selected Service</p>
            <p className="text-sm font-bold text-brand">{config.name}</p>
          </div>
          <div className="ml-auto">
            <span className="text-xs bg-brand text-white px-2 py-0.5 rounded-full font-bold">Auto-selected</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Service Type — read only */}
          <div className="md:col-span-2">
            <Label>Service Type</Label>
            <div className={readonlyCls}>{config.name}</div>
          </div>

          {/* Customer info */}
          <div>
            <Label req>Full Name</Label>
            <input {...register('fullName')} placeholder="Your full name" className={inputCls} />
            <Err msg={errors.fullName?.message} />
          </div>
          <div>
            <Label>Company Name</Label>
            <input {...register('companyName')} placeholder="Optional" className={inputCls} />
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

          {/* Shipment details */}
          <div>
            <Label req>Origin City</Label>
            <input {...register('originCity')} placeholder="From city" className={inputCls} />
            <Err msg={errors.originCity?.message} />
          </div>
          <div>
            <Label>{isWarehousing ? 'Delivery City (if applicable)' : 'Destination City'}</Label>
            <input {...register('destinationCity')} placeholder="To city" className={inputCls} />
            <Err msg={errors.destinationCity?.message} />
          </div>
          <div>
            <Label>Preferred Pickup / Start Date</Label>
            <input type="date" {...register('pickupDate')} className={inputCls} />
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
            <Label req>Approximate Weight / Load</Label>
            <Controller name="weightLoad" control={control} render={({ field: f }) => (
              <div className="relative">
                <select value={f.value} onChange={e => f.onChange(e.target.value)}
                  className={cn(selectCls, !f.value && 'text-gray-400')}>
                  <option value="">Select weight / load</option>
                  {WEIGHT_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            )} />
            <Err msg={errors.weightLoad?.message} />
          </div>
          <div>
            <Label>Number of Packages</Label>
            <input type="number" {...register('numberOfPackages')} placeholder="Optional" className={inputCls} />
          </div>

          {/* Service-specific field */}
          <div className="md:col-span-2">
            <Label>{config.specificLabel}</Label>
            {config.specificOptions ? (
              <Controller name="serviceSpecific" control={control} render={({ field: f }) => (
                <div className="relative">
                  <select value={f.value ?? ''} onChange={e => f.onChange(e.target.value)}
                    className={cn(selectCls, !f.value && 'text-gray-400')}>
                    <option value="">Select {config.specificLabel.toLowerCase()}</option>
                    {config.specificOptions!.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              )} />
            ) : (
              <textarea {...register('serviceSpecific')} rows={2}
                placeholder={config.specificPlaceholder}
                className={cn(inputCls, 'resize-none')} />
            )}
          </div>

          <div className="md:col-span-2">
            <Label>Special Instructions</Label>
            <textarea {...register('specialInstructions')} rows={2}
              placeholder="Fragile, temperature-sensitive, special access..."
              className={cn(inputCls, 'resize-none')} />
          </div>
          <div className="md:col-span-2">
            <Label>Additional Requirements</Label>
            <textarea {...register('additionalRequirements')} rows={2}
              placeholder="Any other requirements or notes..."
              className={cn(inputCls, 'resize-none')} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
        <p className="text-xs text-gray-400">Response within 2 hours · Free consultation</p>
        <button type="button" onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand/90 shadow-md shadow-brand/20 hover:-translate-y-0.5 transition-all">
          Review Inquiry <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}

// ─── Step 2 — Review & submit ──────────────────────────────────────────────

function StepReview({ data, config, onBack, onSubmit, submitting }: {
  data: FormData; config: ServiceConfig
  onBack: () => void; onSubmit: () => void; submitting: boolean
}) {
  const rows: [string, string][] = [
    ['Service',     config.name],
    ['Name',        data.fullName],
    ...(data.companyName ? [['Company', data.companyName] as [string,string]] : []),
    ['Mobile',      data.mobile],
    ['Email',       data.email],
    ['From',        data.originCity],
    ...(data.destinationCity ? [['To', data.destinationCity] as [string,string]] : []),
    ...(data.pickupDate ? [['Date', data.pickupDate] as [string,string]] : []),
    ['Goods',       data.goodsType],
    ['Load',        data.weightLoad],
    ...(data.numberOfPackages ? [['Packages', data.numberOfPackages] as [string,string]] : []),
    ...(data.serviceSpecific ? [[config.specificLabel, data.serviceSpecific] as [string,string]] : []),
    ...(data.specialInstructions ? [['Instructions', data.specialInstructions] as [string,string]] : []),
    ...(data.additionalRequirements ? [['Add. Requirements', data.additionalRequirements] as [string,string]] : []),
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
            <p className="font-display font-black text-sm text-gray-900 leading-none">Service Inquiry — BGTS</p>
            <p className="text-xs text-gray-500">Step 2 of 2 · Review & confirm</p>
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
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <h2 className="font-display font-black text-xl text-gray-900 mb-1">Review Your Inquiry</h2>
        <p className="text-sm text-gray-500 mb-5">Confirm details before submitting.</p>

        <div className="rounded-xl border border-gray-200 overflow-hidden">
          {rows.map(([k, v], i) => (
            <div key={k + i} className={cn('flex px-4 py-2.5 text-sm', i % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
              <span className="w-36 shrink-0 text-gray-500 font-medium text-xs uppercase tracking-wide mt-0.5">{k}</span>
              <span className="text-gray-900 font-medium">{v}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
          📧 A confirmation email will be sent to <strong>{data.email}</strong> after submission.
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
        <p className="text-xs text-gray-400">Response within 2 hours · No obligation</p>
        <button type="submit" disabled={submitting}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand/90 transition-all disabled:opacity-60 shadow-lg shadow-brand/20 hover:-translate-y-0.5">
          {submitting ? 'Submitting…' : 'Submit Inquiry →'}
        </button>
      </div>
    </div>
  )
}

// ─── Success screen ────────────────────────────────────────────────────────

function SuccessScreen({ refNo, serviceName, email, onClose }: {
  refNo: string; serviceName: string; email: string; onClose: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-5">
        <CheckCircle size={32} className="text-green-600" />
      </div>
      <h3 className="font-display font-black text-2xl text-gray-900 mb-2">Inquiry Received!</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-md">
        Thank you for your inquiry. Our BGTS team has received your request and will contact you shortly.
      </p>
      <div className="inline-flex items-center gap-3 bg-brand/5 border border-brand/20 rounded-xl px-6 py-3.5 mb-4">
        <Hash size={16} className="text-brand" />
        <div className="text-left">
          <p className="text-xs text-gray-500">Inquiry Reference</p>
          <p className="font-display font-black text-xl text-brand tracking-wider">{refNo}</p>
        </div>
      </div>
      <div className="bg-gray-50 rounded-xl p-4 w-full max-w-sm text-left mb-6 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-gray-500">Service</span><span className="font-semibold text-brand">{serviceName}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Confirmation sent to</span><span className="font-semibold">{email}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Expected response</span><span className="font-semibold">Within 2 hours</span></div>
      </div>
      <button type="button" onClick={onClose}
        className="px-8 py-3 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand/90 transition-colors shadow-md shadow-brand/20">
        Close
      </button>
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────

interface ServiceInquiryModalProps {
  serviceSlug: string | null
  open: boolean
  onClose: () => void
}

export function ServiceInquiryModal({ serviceSlug, open, onClose }: ServiceInquiryModalProps) {
  const config = serviceSlug ? SERVICE_CONFIGS[serviceSlug] : null

  const [step, setStep]               = useState<1 | 2>(1)
  const [submitted, setSubmitted]     = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [refNo]                       = useState(genRef)
  const [reviewData, setReviewData]   = useState<FormData | null>(null)

  const { control, register, handleSubmit, reset, setValue,
    formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      serviceSlug: serviceSlug ?? '',
      fullName: '', companyName: '', mobile: '', email: '',
      originCity: '', destinationCity: '', pickupDate: '',
      goodsType: '', weightLoad: '', numberOfPackages: '',
      serviceSpecific: '', specialInstructions: '', additionalRequirements: '',
    },
  })

  // Update serviceSlug hidden field when prop changes
  useEffect(() => {
    if (serviceSlug) setValue('serviceSlug', serviceSlug)
  }, [serviceSlug, setValue])

  const handleClose = useCallback(() => {
    onClose()
    setTimeout(() => { setStep(1); setSubmitted(false); setSubmitting(false); setReviewData(null); reset() }, 300)
  }, [onClose, reset])

  const goToReview = handleSubmit(data => {
    setReviewData(data)
    setStep(2)
  })

  const confirmSubmit = useCallback(async () => {
    if (!reviewData || !config) return
    setSubmitting(true)
    try {
      await fetch('/api/service-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...reviewData, refNo, serviceName: config.name }),
      })
    } catch { /* silent */ }
    setSubmitting(false)
    setSubmitted(true)
  }, [reviewData, config, refNo])

  if (!config) return null

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
            'sm:w-[95vw] sm:max-w-[780px] sm:h-[92vh]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:zoom-out-95',
            'data-[state=open]:slide-in-from-bottom-3 data-[state=closed]:slide-out-to-bottom-3',
          )}
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">{config.name} Inquiry</Dialog.Title>

          {submitted && reviewData ? (
            <SuccessScreen
              refNo={refNo} serviceName={config.name}
              email={reviewData.email} onClose={handleClose}
            />
          ) : step === 1 ? (
            <form noValidate className="flex flex-col h-full min-h-0">
              <StepForm
                control={control} register={register} errors={errors}
                config={config} onNext={goToReview} onClose={handleClose}
              />
            </form>
          ) : reviewData ? (
            <form onSubmit={e => { e.preventDefault(); confirmSubmit() }} noValidate className="flex flex-col h-full min-h-0">
              <StepReview
                data={reviewData} config={config}
                onBack={() => setStep(1)} onSubmit={confirmSubmit} submitting={submitting}
              />
            </form>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
