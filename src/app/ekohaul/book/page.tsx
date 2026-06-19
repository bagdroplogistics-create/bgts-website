'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'
import { ekoFleetPlans } from '@/data/ekohaul-vehicles'
import type { EkoFleetTier } from '@/types/ekohaul'
import { CheckCircle, ArrowLeft, Truck } from 'lucide-react'

// ─── Schema ───────────────────────────────────────────────────────────────

const ekoBookingSchema = z.object({
  tier: z.enum(['flex-ev', 'dedi-ev', 'fleet-ev'], {
    required_error: 'Please select a fleet plan',
  }),
  vehicleType: z.enum(['3w', 'mini', 'scv', 'icv'], {
    required_error: 'Please select a vehicle type',
  }),
  quantity: z
    .number({ invalid_type_error: 'Enter number of vehicles' })
    .min(1, 'Minimum 1 vehicle')
    .max(500, 'Maximum 500 vehicles'),
  dailyDistanceKm: z
    .number({ invalid_type_error: 'Enter daily distance' })
    .min(20, 'Minimum 20 km/day')
    .max(300, 'Maximum 300 km/day'),
  operatingCity: z.string().min(2, 'Enter operating city'),
  startDate: z.string().min(1, 'Select a preferred start date'),
  companyName: z.string().min(2, 'Company name required'),
  contactName: z.string().min(2, 'Contact name required'),
  contactPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'),
  contactEmail: z.string().email('Enter valid email'),
  gstin: z.string().optional(),
  industry: z.string().min(2, 'Select industry'),
  message: z.string().optional(),
})

type EkoBookingFormData = z.infer<typeof ekoBookingSchema>

// ─── Constants ────────────────────────────────────────────────────────────

const VEHICLE_OPTIONS = [
  { value: '3w',   label: 'Euler HiLoad EV — 3-Wheeler (688 kg)' },
  { value: 'mini', label: 'Tata Ace EV — Mini Truck (550 kg)' },
  { value: 'scv',  label: 'Switch IeV3 — Small CV (1,000 kg)' },
  { value: 'icv',  label: 'Tata Ultra E.7 — Intermediate CV (7,000 kg)' },
]

const INDUSTRIES = [
  'E-commerce / D2C',
  'FMCG & Consumer Goods',
  'Retail / Modern Trade',
  'Pharma & Healthcare',
  'Food & Beverage',
  'Automotive',
  'Textile & Apparel',
  'Other',
]

// ─── Tier card ────────────────────────────────────────────────────────────

function TierCard({
  plan,
  selected,
  onClick,
}: {
  plan: (typeof ekoFleetPlans)[0]
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
        selected
          ? 'border-eko bg-eko-50'
          : 'border-ink-ghost/20 bg-white hover:border-eko/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display font-bold text-ink-strong">{plan.name}</p>
          <p className="text-xs text-eko mt-0.5">{plan.tagline}</p>
          <p className="text-2xs text-ink-ghost mt-1">
            {plan.minVehicles}{plan.maxVehicles ? `–${plan.maxVehicles}` : '+'} vehicles
            {plan.commitmentMonths > 0 && ` · ${plan.commitmentMonths}-month commitment`}
          </p>
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${
            selected ? 'border-eko bg-eko' : 'border-ink-ghost/40'
          }`}
        >
          {selected && <CheckCircle size={12} className="text-white" aria-hidden="true" />}
        </div>
      </div>
    </button>
  )
}

// ─── Input wrapper ────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
  required,
}: {
  label: string
  error?: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-ink-strong mb-1.5">
        {label}
        {required && <span className="text-brick ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-brick mt-1">{error}</p>}
    </div>
  )
}

const inputCls =
  'w-full border border-ink-ghost/30 rounded-lg px-3 py-2.5 text-sm text-ink-strong placeholder:text-ink-ghost focus:outline-none focus:ring-2 focus:ring-eko/40 focus:border-eko transition-colors'

// ─── Success view ─────────────────────────────────────────────────────────

function SuccessView({ name, tier }: { name: string; tier: string }) {
  const plan = ekoFleetPlans.find((p) => p.tier === tier)
  return (
    <div className="text-center py-12 px-6 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-eko flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={32} className="text-white" aria-hidden="true" />
      </div>
      <h2 className="font-display font-black text-2xl text-ink-strong mb-2">
        Fleet enquiry received
      </h2>
      <p className="text-ink-muted mb-6">
        Thank you, {name}. Your {plan?.name ?? tier} enquiry has been submitted.
        Our EkoHaul fleet team will contact you within 48 hours with a customised
        proposal.
      </p>
      <div className="bg-eko-50 border border-eko/15 rounded-xl p-4 mb-8 text-left space-y-2">
        <p className="text-xs text-ink-muted">What happens next:</p>
        <p className="text-sm text-ink-body">
          1. Fleet assessment call (30 min) with our EV specialist
        </p>
        <p className="text-sm text-ink-body">
          2. Route analysis and vehicle recommendation
        </p>
        <p className="text-sm text-ink-body">
          3. Customised {plan?.name} proposal with ROI model
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="eko" size="md" asChild>
          <Link href="/ekohaul">Back to EkoHaul</Link>
        </Button>
        <Button variant="ghost" size="md" className="text-eko hover:bg-eko/10" asChild>
          <Link href="/ekohaul/esg">Try Carbon Calculator</Link>
        </Button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function EkoHaulBookPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitterName, setSubmitterName] = useState('')
  const [submittedTier, setSubmittedTier] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EkoBookingFormData>({
    resolver: zodResolver(ekoBookingSchema),
    defaultValues: {
      tier: 'dedi-ev',
      vehicleType: 'mini',
      quantity: 5,
      dailyDistanceKm: 80,
    },
  })

  const selectedTier = watch('tier')

  function onSubmit(data: EkoBookingFormData) {
    // In production: POST to /api/ekohaul-enquiry
    console.log('EkoHaul booking:', data)
    setSubmitterName(data.contactName)
    setSubmittedTier(data.tier)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="pt-header min-h-screen bg-surface-page flex items-center">
        <div className="container-xl">
          <SuccessView name={submitterName} tier={submittedTier} />
        </div>
      </div>
    )
  }

  return (
    <div className="pt-header min-h-screen bg-surface-page">

      {/* Header */}
      <div
        className="py-12 md:py-16 border-b border-ink-ghost/10"
        style={{ background: 'linear-gradient(135deg, #0C5B35 0%, #138A4F 70%, #119C97 100%)' }}
      >
        <div className="container-xl">
          <Link
            href="/ekohaul"
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            EkoHaul Home
          </Link>
          <Tag variant="eko" size="sm" className="block w-fit mb-3 bg-white/15 text-white border-white/20">
            EV Fleet Enquiry
          </Tag>
          <h1 className="font-display font-black text-4xl text-white tracking-tight mb-2">
            Get your EV fleet proposal
          </h1>
          <p className="text-white/70 max-w-lg">
            Tell us about your fleet needs. Our EV specialist will send a
            customised {'{'}plan + ROI model{'}'} within 48 hours.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="container-xl py-10 md:py-14">
        <div className="grid lg:grid-cols-3 gap-10 items-start">

          <form
            className="lg:col-span-2 space-y-8"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {/* Section 1: Plan */}
            <section className="bg-white rounded-2xl border border-ink-ghost/10 p-6">
              <h2 className="font-display font-bold text-ink-strong mb-5">
                1 — Choose your fleet plan
              </h2>
              <div className="space-y-3">
                {ekoFleetPlans.map((plan) => (
                  <TierCard
                    key={plan.tier}
                    plan={plan}
                    selected={selectedTier === plan.tier}
                    onClick={() => setValue('tier', plan.tier as EkoFleetTier)}
                  />
                ))}
              </div>
              {errors.tier && (
                <p className="text-xs text-brick mt-2">{errors.tier.message}</p>
              )}
            </section>

            {/* Section 2: Fleet requirements */}
            <section className="bg-white rounded-2xl border border-ink-ghost/10 p-6">
              <h2 className="font-display font-bold text-ink-strong mb-5">
                2 — Fleet requirements
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field
                  label="Vehicle type"
                  error={errors.vehicleType?.message}
                  required
                >
                  <select
                    {...register('vehicleType')}
                    className={inputCls}
                  >
                    {VEHICLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Number of vehicles"
                  error={errors.quantity?.message}
                  required
                >
                  <input
                    type="number"
                    min={1}
                    max={500}
                    {...register('quantity', { valueAsNumber: true })}
                    className={inputCls}
                    placeholder="e.g. 10"
                  />
                </Field>

                <Field
                  label="Daily distance per vehicle (km)"
                  error={errors.dailyDistanceKm?.message}
                  required
                >
                  <input
                    type="number"
                    min={20}
                    max={300}
                    {...register('dailyDistanceKm', { valueAsNumber: true })}
                    className={inputCls}
                    placeholder="e.g. 80"
                  />
                </Field>

                <Field
                  label="Operating city"
                  error={errors.operatingCity?.message}
                  required
                >
                  <input
                    type="text"
                    {...register('operatingCity')}
                    className={inputCls}
                    placeholder="e.g. Ahmedabad"
                  />
                </Field>

                <Field
                  label="Preferred start date"
                  error={errors.startDate?.message}
                  required
                >
                  <input
                    type="date"
                    {...register('startDate')}
                    className={inputCls}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </Field>

                <Field label="Industry" error={errors.industry?.message} required>
                  <select {...register('industry')} className={inputCls}>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </section>

            {/* Section 3: Company details */}
            <section className="bg-white rounded-2xl border border-ink-ghost/10 p-6">
              <h2 className="font-display font-bold text-ink-strong mb-5">
                3 — Your details
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field
                  label="Company name"
                  error={errors.companyName?.message}
                  required
                >
                  <input
                    type="text"
                    {...register('companyName')}
                    className={inputCls}
                    placeholder="e.g. Gujarat Distributors Pvt. Ltd."
                  />
                </Field>

                <Field
                  label="Contact name"
                  error={errors.contactName?.message}
                  required
                >
                  <input
                    type="text"
                    {...register('contactName')}
                    className={inputCls}
                    placeholder="Your name"
                  />
                </Field>

                <Field
                  label="Mobile number"
                  error={errors.contactPhone?.message}
                  required
                >
                  <input
                    type="tel"
                    {...register('contactPhone')}
                    className={inputCls}
                    placeholder="10-digit mobile"
                    maxLength={10}
                  />
                </Field>

                <Field
                  label="Email"
                  error={errors.contactEmail?.message}
                  required
                >
                  <input
                    type="email"
                    {...register('contactEmail')}
                    className={inputCls}
                    placeholder="you@company.com"
                  />
                </Field>

                <Field label="GSTIN" error={errors.gstin?.message}>
                  <input
                    type="text"
                    {...register('gstin')}
                    className={inputCls}
                    placeholder="Optional"
                    maxLength={15}
                  />
                </Field>
              </div>

              <div className="mt-5">
                <Field label="Anything else we should know?" error={errors.message?.message}>
                  <textarea
                    {...register('message')}
                    rows={3}
                    className={`${inputCls} resize-none`}
                    placeholder="Current fleet size, charging setup, specific routes..."
                  />
                </Field>
              </div>
            </section>

            {/* Submit */}
            <Button
              type="submit"
              variant="eko"
              size="xl"
              loading={isSubmitting}
              icon={<Truck size={18} />}
              iconPosition="left"
              className="w-full"
            >
              Submit EV Fleet Enquiry
            </Button>

            <p className="text-xs text-ink-ghost text-center">
              No commitment. Our EV specialist will respond within 48 hours with
              a customised proposal and ROI model.
            </p>
          </form>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24">
            {/* What you get */}
            <div className="bg-eko-50 border border-eko/15 rounded-2xl p-5">
              <h3 className="font-display font-bold text-ink-strong mb-4 text-sm uppercase tracking-wider">
                What you get
              </h3>
              <ul className="space-y-2.5">
                {[
                  'Customised fleet proposal in 48 hrs',
                  'ROI model vs your diesel cost',
                  'Carbon saving projection (BRSR-ready)',
                  'Vehicle & plan recommendation',
                  'No-obligation. Zero pressure.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle size={14} className="text-eko shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-sm text-ink-body">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Plan comparison */}
            <div className="bg-white border border-ink-ghost/10 rounded-2xl p-5">
              <h3 className="font-display font-bold text-ink-strong mb-4 text-sm uppercase tracking-wider">
                Plan at a glance
              </h3>
              <div className="space-y-3">
                {ekoFleetPlans.map((plan) => (
                  <div key={plan.tier} className="flex items-start gap-3">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        selectedTier === plan.tier ? 'bg-eko' : 'bg-ink-ghost/30'
                      }`}
                      aria-hidden="true"
                    />
                    <div>
                      <p className={`text-sm font-semibold ${selectedTier === plan.tier ? 'text-eko' : 'text-ink-strong'}`}>
                        {plan.name}
                      </p>
                      <p className="text-xs text-ink-ghost">{plan.tagline}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white border border-ink-ghost/10 rounded-2xl p-5 text-center">
              <p className="text-xs text-ink-muted mb-1">Prefer a call first?</p>
              <a
                href="tel:+916357225722"
                className="font-display font-black text-eko text-lg hover:underline"
              >
                +91 63 5722 5722
              </a>
              <p className="text-xs text-ink-ghost mt-1">EkoHaul fleet desk · Mon–Sat 8am–7pm</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
