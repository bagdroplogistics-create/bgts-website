'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { X, Truck, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

// Derive inquiry source label from pathname
function fleetSource(pathname: string): string | null {
  if (pathname.startsWith('/fleet/pickup'))  return 'Fleet → Pickup'
  if (pathname.startsWith('/fleet/tempo'))   return 'Fleet → Tempo'
  if (pathname.startsWith('/fleet/truck'))   return 'Fleet → Truck'
  if (pathname.startsWith('/fleet/trailer')) return 'Fleet → Trailer'
  if (pathname.startsWith('/fleet'))         return 'Fleet'
  return null
}

// ── gtag helper (Google Ads tag already loaded in layout) ─────────────────
function gtag(...args: unknown[]) {
  if (typeof window !== 'undefined' && typeof (window as unknown as Record<string, unknown>).gtag === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).gtag(...args)
  }
}
function trackEvent(eventName: string, params?: Record<string, unknown>) {
  gtag('event', eventName, { event_category: 'vehicle_inquiry', ...params })
}

const VEHICLES = ['3 Wheeler', 'Bolero', 'Tempo', 'Truck', 'Trailer'] as const

type FormState = 'idle' | 'submitting' | 'success' | 'error'

interface FormData {
  name: string
  company: string
  phone: string
  email: string
  vehicle_required: string
  _hp: string // honeypot
}

const EMPTY: FormData = {
  name: '', company: '', phone: '', email: '', vehicle_required: '', _hp: '',
}

function validatePhone(p: string) {
  return /^[6-9]\d{9}$/.test(p.replace(/\s/g, ''))
}

export function VehicleInquiryPopup() {
  const pathname                  = usePathname()
  const [open, setOpen]           = useState(false)
  const [form, setForm]           = useState<FormData>(EMPTY)
  const [errors, setErrors]       = useState<Partial<Record<keyof FormData, string>>>({})
  const [state, setState]         = useState<FormState>('idle')
  const [errorMsg, setErrorMsg]   = useState('')
  const [touched, setTouched]     = useState(false)
  const firstFieldRef             = useRef<HTMLInputElement>(null)
  const dialogRef                 = useRef<HTMLDivElement>(null)

  // Focus first field when popup opens
  useEffect(() => {
    if (open) {
      setTimeout(() => firstFieldRef.current?.focus(), 80)
      trackEvent('vehicle_inquiry_popup_opened')
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  function handleClose() {
    setOpen(false)
    // Reset after animation
    setTimeout(() => {
      setForm(EMPTY); setErrors({}); setState('idle'); setErrorMsg(''); setTouched(false)
    }, 300)
  }

  function validate(data: FormData): Partial<Record<keyof FormData, string>> {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (!data.name.trim())             e.name = 'Name is required'
    if (!data.phone.trim())            e.phone = 'Phone number is required'
    else if (!validatePhone(data.phone)) e.phone = 'Enter a valid 10-digit mobile number'
    if (!data.vehicle_required)        e.vehicle_required = 'Please select a vehicle type'
    return e
  }

  function setField(k: keyof FormData, v: string) {
    setForm(prev => {
      const next = { ...prev, [k]: v }
      if (touched) setErrors(validate(next))
      return next
    })
    if (k === 'vehicle_required' && v) trackEvent('vehicle_inquiry_vehicle_selected', { vehicle: v })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    if (state === 'submitting') return
    setState('submitting')
    trackEvent('vehicle_inquiry_form_submitted')

    try {
      const source = fleetSource(pathname)
      const res = await fetch('/api/vehicle-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          phone: form.phone.replace(/\s/g, ''),
          ...(source ? { source_page: source } : {}),
        }),
      })
      const json = await res.json()
      if (json.success) {
        setState('success')
        trackEvent('vehicle_inquiry_success')
        // Fire Google Ads conversion
        gtag('event', 'conversion', { send_to: 'AW-18267437854' })
      } else {
        setState('error')
        setErrorMsg(json.error ?? 'Something went wrong. Please try again.')
        trackEvent('vehicle_inquiry_error', { reason: json.error })
      }
    } catch {
      setState('error')
      setErrorMsg('Network error. Please check your connection and try again.')
      trackEvent('vehicle_inquiry_error', { reason: 'network' })
    }
  }

  const inp = `w-full px-4 py-3 rounded-lg border text-sm text-gray-900 bg-white
    placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500
    focus:border-orange-500 transition-colors`
  const hasErr = (k: keyof FormData) => touched && errors[k]

  return (
    <>
      {/* ── Floating CTA Button ─────────────────────────────────────────── */}
      <button
        aria-label="Get a Vehicle Quote"
        onClick={() => {
          setOpen(true)
          trackEvent('vehicle_inquiry_button_clicked')
        }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2
          bg-orange-600 hover:bg-orange-700 active:bg-orange-800
          text-white font-semibold text-sm px-5 py-3.5 rounded-full
          shadow-lg hover:shadow-xl transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        style={{ fontFamily: 'var(--font-archivo, system-ui)' }}
      >
        <Truck size={17} strokeWidth={2.2} />
        <span>Get Vehicle Quote</span>
      </button>

      {/* ── Backdrop ────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vi-title"
        >
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* ── Modal card ──────────────────────────────────────────────── */}
          <div
            ref={dialogRef}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl
              overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-700 to-orange-500 px-6 pt-6 pb-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Truck size={20} className="text-orange-200" />
                    <span className="text-xs font-semibold text-orange-200 uppercase tracking-wider">
                      BGTS Transport
                    </span>
                  </div>
                  <h2
                    id="vi-title"
                    className="text-xl font-extrabold text-white"
                    style={{ fontFamily: 'var(--font-archivo, system-ui)' }}
                  >
                    Get a Vehicle Quote
                  </h2>
                  <p className="text-orange-100 text-sm mt-1">
                    Tell us your requirement — we&apos;ll call you back.
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  aria-label="Close"
                  className="shrink-0 w-8 h-8 flex items-center justify-center
                    rounded-full bg-white/20 hover:bg-white/30 text-white
                    transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {/* ── Success state ── */}
              {state === 'success' ? (
                <div className="text-center py-8">
                  <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Inquiry Received!
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Thank you! Our team will contact you shortly.
                  </p>
                  <button
                    onClick={handleClose}
                    className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700
                      text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {/* Honeypot — hidden from real users */}
                  <input
                    type="text"
                    name="_hp"
                    value={form._hp}
                    onChange={e => setField('_hp', e.target.value)}
                    tabIndex={-1}
                    aria-hidden="true"
                    style={{ display: 'none' }}
                    autoComplete="off"
                  />

                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label htmlFor="vi-name" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                        Name <span className="text-orange-600">*</span>
                      </label>
                      <input
                        ref={firstFieldRef}
                        id="vi-name"
                        type="text"
                        autoComplete="name"
                        placeholder="Enter your name"
                        value={form.name}
                        onChange={e => setField('name', e.target.value)}
                        onFocus={() => !touched && trackEvent('vehicle_inquiry_form_started')}
                        className={`${inp} ${hasErr('name') ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                      />
                      {hasErr('name') && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Company */}
                    <div>
                      <label htmlFor="vi-company" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                        Company
                      </label>
                      <input
                        id="vi-company"
                        type="text"
                        autoComplete="organization"
                        placeholder="Company name"
                        value={form.company}
                        onChange={e => setField('company', e.target.value)}
                        className={`${inp} border-gray-300`}
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="vi-phone" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                        Phone Number <span className="text-orange-600">*</span>
                      </label>
                      <input
                        id="vi-phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        value={form.phone}
                        onChange={e => setField('phone', e.target.value.replace(/\D/g, ''))}
                        className={`${inp} ${hasErr('phone') ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                      />
                      {hasErr('phone') && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="vi-email" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                        Email Address
                      </label>
                      <input
                        id="vi-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="you@company.com"
                        value={form.email}
                        onChange={e => setField('email', e.target.value)}
                        className={`${inp} border-gray-300`}
                      />
                    </div>

                    {/* Vehicle dropdown */}
                    <div>
                      <label htmlFor="vi-vehicle" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                        Vehicle Required <span className="text-orange-600">*</span>
                      </label>
                      <select
                        id="vi-vehicle"
                        value={form.vehicle_required}
                        onChange={e => setField('vehicle_required', e.target.value)}
                        className={`${inp} ${hasErr('vehicle_required') ? 'border-red-400 bg-red-50' : 'border-gray-300'}
                          appearance-none cursor-pointer`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 12px center',
                          paddingRight: '2.5rem',
                        }}
                      >
                        <option value="">Select vehicle type</option>
                        {VEHICLES.map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                      {hasErr('vehicle_required') && (
                        <p className="text-red-500 text-xs mt-1">{errors.vehicle_required}</p>
                      )}
                    </div>

                    {/* Error banner */}
                    {state === 'error' && (
                      <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                        <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                        <p className="text-red-700 text-sm">{errorMsg}</p>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={state === 'submitting'}
                      className="w-full flex items-center justify-center gap-2
                        bg-orange-600 hover:bg-orange-700 active:bg-orange-800
                        disabled:bg-orange-400 disabled:cursor-not-allowed
                        text-white font-bold text-sm py-3.5 rounded-lg
                        transition-colors focus:outline-none focus:ring-2
                        focus:ring-orange-500 focus:ring-offset-2"
                      style={{ fontFamily: 'var(--font-archivo, system-ui)' }}
                    >
                      {state === 'submitting' ? (
                        <><Loader2 size={16} className="animate-spin" /> Sending…</>
                      ) : (
                        'Send Inquiry'
                      )}
                    </button>

                    <p className="text-center text-xs text-gray-400">
                      We respond within 2 hours on working days.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
