'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  MapPin, Package, Settings, CheckCircle,
  ArrowRight, ArrowLeft, Truck, Shield, FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Tag } from '@/components/ui/Tag'
import { cn, formatRs, generateLRNumber } from '@/lib/utils'
import { calculateFreightQuote, CITIES } from '@/lib/freight-calculator'
import {
  routeSchema, cargoSchema, serviceOptionsSchema, contactSchema,
  type RouteFormData, type CargoFormData,
  type ServiceOptionsData, type ContactFormData,
} from '@/lib/schemas'
import type { QuoteResult } from '@/types'

// ─── Step config ──────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Route',   icon: MapPin,       title: 'Where are you shipping?' },
  { id: 2, label: 'Cargo',   icon: Package,      title: 'Tell us about your cargo' },
  { id: 3, label: 'Service', icon: Settings,     title: 'Service preferences' },
  { id: 4, label: 'Confirm', icon: CheckCircle,  title: 'Your contact details' },
]

const SERVICE_OPTIONS = [
  { value: 'full-truck-load', label: 'Full Truck Load (FTL)' },
  { value: 'part-truck-load', label: 'Part Truck Load (PTL)' },
  { value: 'express-parcel',  label: 'Express Parcel'        },
  { value: 'heavy-odc',       label: 'Heavy & ODC'           },
  { value: 'multimodal',      label: 'Multimodal'            },
]

const CITY_OPTIONS = CITIES.map((c) => ({ value: c, label: c }))

// ─── Step indicator ───────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <nav aria-label="Booking steps" className="mb-10">
      <ol className="flex items-center gap-0">
        {STEPS.map((step, i) => {
          const Icon = step.icon
          const done    = current > step.id
          const active  = current === step.id
          const pending = current < step.id

          return (
            <li key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-base',
                    done    && 'bg-brand text-white',
                    active  && 'bg-brand text-white ring-4 ring-brand/20',
                    pending && 'bg-surface-mid text-ink-ghost border border-ink-ghost/30'
                  )}
                  aria-current={active ? 'step' : undefined}
                >
                  <Icon size={15} aria-hidden="true" />
                </div>
                <span
                  className={cn(
                    'text-2xs font-semibold hidden sm:block',
                    active  && 'text-brand',
                    done    && 'text-ink-muted',
                    pending && 'text-ink-ghost'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-px mx-2 mb-5 transition-colors duration-base',
                    done ? 'bg-brand' : 'bg-ink-ghost/30'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// ─── Quote result card ────────────────────────────────────────────────────
function QuoteCard({
  result,
  data,
  lrNumber,
}: {
  result: QuoteResult
  data: { originCity: string; destinationCity: string; serviceType: string; companyName: string }
  lrNumber: string
}) {
  return (
    <div className="mt-8 rounded-2xl border border-brand/20 bg-brand-subtle overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-energy px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-0.5">
            Freight Estimate
          </p>
          <p className="text-white font-display font-black text-3xl">
            {formatRs(result.totalRs)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-white/70 text-xs mb-1">LR Reference</p>
          <p className="text-white font-mono font-semibold text-sm">{lrNumber}</p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="px-6 py-5 space-y-3">
        <div className="flex items-center justify-between text-sm pb-3 border-b border-ink-ghost/10">
          <span className="text-ink-muted">Route</span>
          <span className="font-semibold text-ink-strong">
            {data.originCity} → {data.destinationCity}
          </span>
        </div>

        {[
          { label: 'Base Freight',  value: result.baseFreightRs,  note: `${result.breakdown.distanceKm} km × ₹${result.breakdown.ratePerKm}/km × ${result.breakdown.vehicles} vehicle(s)` },
          { label: 'Insurance',     value: result.insuranceRs,    note: '0.2% of declared value' },
          { label: 'E-way Bill',    value: result.ewayBillRs,     note: 'Flat fee' },
          { label: 'GST (12%)',     value: result.gstRs,          note: '' },
        ].map(({ label, value, note }) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <div>
              <span className="text-ink-body">{label}</span>
              {note && <span className="text-ink-ghost text-xs ml-1.5">({note})</span>}
            </div>
            <span className="font-mono text-ink-strong">{formatRs(value)}</span>
          </div>
        ))}

        <div className="flex items-center justify-between pt-3 border-t border-ink-ghost/10">
          <span className="font-display font-bold text-ink-strong">Total (incl. GST)</span>
          <span className="font-display font-black text-brand text-lg">
            {formatRs(result.totalRs)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-2">
          <Tag variant="brand" size="sm">Est. transit: {result.estimatedTransitDays}</Tag>
          <Tag variant="neutral" size="sm">Valid 24 hrs</Tag>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-5 flex flex-col sm:flex-row gap-3">
        <Button variant="primary" size="lg" className="flex-1" icon={<Truck size={16} />} iconPosition="left">
          Confirm Booking
        </Button>
        <Button variant="secondary" size="lg">
          Download Quote PDF
        </Button>
      </div>
    </div>
  )
}

// ─── Step 1: Route ────────────────────────────────────────────────────────
function Step1Route({
  onNext,
  defaults,
}: {
  onNext: (data: RouteFormData) => void
  defaults?: Partial<RouteFormData>
}) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
    defaultValues: defaults,
  })

  const origin = watch('originCity')

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <Select
        label="Origin City"
        required
        placeholder="Select origin"
        options={CITY_OPTIONS}
        error={errors.originCity?.message}
        {...register('originCity')}
      />
      <Select
        label="Destination City"
        required
        placeholder="Select destination"
        options={CITY_OPTIONS.filter((c) => c.value !== origin)}
        error={errors.destinationCity?.message}
        {...register('destinationCity')}
      />
      <Select
        label="Service Type"
        required
        placeholder="Select service"
        options={SERVICE_OPTIONS}
        error={errors.serviceType?.message}
        {...register('serviceType')}
      />
      <Input
        label="Preferred Pickup Date"
        type="date"
        min={new Date().toISOString().split('T')[0]}
        {...register('preferredDate')}
      />
      <Button type="submit" variant="primary" size="lg" className="w-full" icon={<ArrowRight size={16} />}>
        Next — Cargo Details
      </Button>
    </form>
  )
}

// ─── Step 2: Cargo ────────────────────────────────────────────────────────
function Step2Cargo({
  onNext,
  onBack,
  defaults,
}: {
  onNext: (data: CargoFormData) => void
  onBack: () => void
  defaults?: Partial<CargoFormData>
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<CargoFormData>({
    resolver: zodResolver(cargoSchema),
    defaultValues: defaults,
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <Input
        label="Total Weight (kg)"
        type="number"
        required
        min={1}
        placeholder="e.g. 2500"
        error={errors.weightKg?.message}
        hint="Total shipment weight in kilograms"
        suffix={<span className="text-xs">kg</span>}
        {...register('weightKg', { valueAsNumber: true })}
      />
      <Input
        label="Number of Packages"
        type="number"
        min={1}
        placeholder="e.g. 10"
        error={errors.packagesCount?.message}
        {...register('packagesCount', { valueAsNumber: true })}
      />
      <Input
        label="Declared Cargo Value (₹)"
        type="number"
        min={0}
        placeholder="e.g. 500000"
        error={errors.declaredValueRs?.message}
        hint="Required for insurance calculation"
        prefix={<span className="text-xs font-semibold">₹</span>}
        {...register('declaredValueRs', { valueAsNumber: true })}
      />
      <Input
        label="Cargo Description"
        required
        placeholder="e.g. Machine parts, FMCG goods, Chemicals"
        error={errors.cargoType?.message}
        {...register('cargoType')}
      />
      <div className="flex gap-3">
        <Button type="button" variant="secondary" size="lg" className="flex-1" icon={<ArrowLeft size={16} />} iconPosition="left" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" variant="primary" size="lg" className="flex-1" icon={<ArrowRight size={16} />}>
          Next — Service Options
        </Button>
      </div>
    </form>
  )
}

// ─── Step 3: Service options ──────────────────────────────────────────────
function Step3Service({
  onNext,
  onBack,
  defaults,
}: {
  onNext: (data: ServiceOptionsData) => void
  onBack: () => void
  defaults?: Partial<ServiceOptionsData>
}) {
  const { register, handleSubmit } = useForm<ServiceOptionsData>({
    resolver: zodResolver(serviceOptionsSchema),
    defaultValues: { requireEwayBill: true, requireInsurance: false, urgency: 'standard', ...defaults },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      {/* Urgency */}
      <fieldset>
        <legend className="text-sm font-medium text-ink-strong mb-3">
          Delivery Priority
        </legend>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'economy', label: 'Economy', note: '+1–2 days, lowest cost' },
            { value: 'standard', label: 'Standard', note: 'Regular transit' },
            { value: 'express', label: 'Express', note: 'Fastest available' },
          ].map((opt) => (
            <label
              key={opt.value}
              className="relative flex flex-col gap-1 p-3 rounded-xl border border-ink-ghost/20 cursor-pointer hover:border-brand/40 has-[:checked]:border-brand has-[:checked]:bg-brand-subtle transition-all"
            >
              <input
                type="radio"
                value={opt.value}
                className="sr-only"
                {...register('urgency')}
              />
              <span className="font-semibold text-sm text-ink-strong">{opt.label}</span>
              <span className="text-xs text-ink-muted">{opt.note}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Add-ons */}
      <fieldset>
        <legend className="text-sm font-medium text-ink-strong mb-3">Add-on Services</legend>
        <div className="space-y-3">
          {[
            {
              field: 'requireEwayBill' as const,
              icon: FileText,
              label: 'E-way Bill Generation',
              desc: 'Mandatory for cargo value > ₹50,000. ₹80 flat.',
            },
            {
              field: 'requireInsurance' as const,
              icon: Shield,
              label: 'Cargo Insurance',
              desc: '0.2% of declared value. BGTS-arranged transit insurance.',
            },
          ].map(({ field, icon: Icon, label, desc }) => (
            <label
              key={field}
              className="flex items-start gap-3 p-4 rounded-xl border border-ink-ghost/20 cursor-pointer hover:border-brand/40 has-[:checked]:border-brand has-[:checked]:bg-brand-subtle transition-all"
            >
              <input type="checkbox" className="mt-0.5 accent-brand" {...register(field)} />
              <div>
                <div className="flex items-center gap-1.5">
                  <Icon size={14} className="text-brand" aria-hidden="true" />
                  <span className="font-semibold text-sm text-ink-strong">{label}</span>
                </div>
                <p className="text-xs text-ink-muted mt-0.5">{desc}</p>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex gap-3">
        <Button type="button" variant="secondary" size="lg" className="flex-1" icon={<ArrowLeft size={16} />} iconPosition="left" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" variant="primary" size="lg" className="flex-1" icon={<ArrowRight size={16} />}>
          Next — Your Details
        </Button>
      </div>
    </form>
  )
}

// ─── Step 4: Contact + quote result ──────────────────────────────────────
function Step4Confirm({
  onBack,
  routeData,
  cargoData,
  serviceData,
}: {
  onBack: () => void
  routeData: RouteFormData
  cargoData: CargoFormData
  serviceData: ServiceOptionsData
}) {
  const [quote, setQuote]       = useState<QuoteResult | null>(null)
  const [lrNumber, setLrNumber] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<ContactFormData>({ resolver: zodResolver(contactSchema) })

  const onSubmit = async (contact: ContactFormData) => {
    const result = calculateFreightQuote({
      originCity:       routeData.originCity,
      destinationCity:  routeData.destinationCity,
      serviceType:      routeData.serviceType,
      weightKg:         cargoData.weightKg,
      declaredValueRs:  cargoData.declaredValueRs,
      requireInsurance: serviceData.requireInsurance,
      requireEwayBill:  serviceData.requireEwayBill,
    })
    setQuote(result)
    setLrNumber(generateLRNumber())
    setSubmitted(true)
  }

  if (submitted && quote) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="text-success" size={20} />
          <h3 className="font-display font-bold text-lg text-ink-strong">
            Your quote is ready
          </h3>
        </div>
        <p className="text-sm text-ink-muted mb-4">
          Our team will call you within 2 hours to confirm the booking.
        </p>
        <QuoteCard
          result={quote}
          data={{ ...routeData, companyName: '' }}
          lrNumber={lrNumber}
        />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Company Name"
          required
          placeholder="Your company name"
          error={errors.companyName?.message}
          {...register('companyName')}
        />
        <Input
          label="Contact Name"
          required
          placeholder="Your full name"
          error={errors.contactName?.message}
          {...register('contactName')}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Mobile Number"
          required
          type="tel"
          placeholder="10-digit mobile"
          error={errors.contactPhone?.message}
          prefix={<span className="text-xs font-semibold">+91</span>}
          {...register('contactPhone')}
        />
        <Input
          label="Email Address"
          required
          type="email"
          placeholder="you@company.com"
          error={errors.contactEmail?.message}
          {...register('contactEmail')}
        />
      </div>
      <Input
        label="GSTIN (optional)"
        placeholder="e.g. 24AABCU9603R1ZX"
        hint="For GST invoice generation"
        error={errors.gstin?.message}
        {...register('gstin')}
      />

      <div className="flex gap-3">
        <Button type="button" variant="secondary" size="lg" className="flex-1" icon={<ArrowLeft size={16} />} iconPosition="left" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" variant="primary" size="lg" className="flex-1" loading={isSubmitting} icon={<ArrowRight size={16} />}>
          Book Now
        </Button>
      </div>

      <p className="text-xs text-ink-muted text-center">
        By submitting, you agree to BGTS contacting you regarding this enquiry.
        No spam, ever.
      </p>
    </form>
  )
}

// ─── Main QuoteForm ───────────────────────────────────────────────────────
export function QuoteForm() {
  const [step, setStep] = useState(1)

  // Accumulated form data across steps
  const [routeData, setRouteData]     = useState<RouteFormData | undefined>()
  const [cargoData, setCargoData]     = useState<CargoFormData | undefined>()
  const [serviceData, setServiceData] = useState<ServiceOptionsData | undefined>()

  const currentStep = STEPS[step - 1]

  return (
    <div className="bg-white rounded-2xl border border-ink-ghost/10 shadow-card p-6 md:p-8">
      <StepIndicator current={step} />

      <h2 className="font-display font-bold text-xl text-ink-strong mb-6">
        {currentStep.title}
      </h2>

      {step === 1 && (
        <Step1Route
          defaults={routeData}
          onNext={(data) => { setRouteData(data); setStep(2) }}
        />
      )}
      {step === 2 && (
        <Step2Cargo
          defaults={cargoData}
          onNext={(data) => { setCargoData(data); setStep(3) }}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <Step3Service
          defaults={serviceData}
          onNext={(data) => { setServiceData(data); setStep(4) }}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && routeData && cargoData && serviceData && (
        <Step4Confirm
          routeData={routeData}
          cargoData={cargoData}
          serviceData={serviceData}
          onBack={() => setStep(3)}
        />
      )}
    </div>
  )
}
