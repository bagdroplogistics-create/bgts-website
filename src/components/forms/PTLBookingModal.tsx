'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, ChevronRight, ChevronLeft, Check, PackageOpen, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PTLModalProps {
  open: boolean
  onClose: () => void
}

const STEPS = [
  { title: 'Route',     subtitle: 'Where is your cargo going?' },
  { title: 'Shipment',  subtitle: 'Tell us about your goods' },
  { title: 'Services',  subtitle: 'Optional add-ons' },
  { title: 'Contact',   subtitle: 'Your contact details' },
  { title: 'Review',    subtitle: 'Confirm & submit' },
]

const ADD_ONS = [
  { id: 'packaging',     label: 'Packaging & Wrapping' },
  { id: 'insurance',     label: 'Cargo Insurance' },
  { id: 'door-pickup',   label: 'Door Pickup' },
  { id: 'door-delivery', label: 'Door Delivery' },
  { id: 'loading',       label: 'Loading / Unloading Assistance' },
]

const inputCls =
  'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors'

function genRef() {
  return 'PTL-' + Math.random().toString(36).toUpperCase().slice(2, 8)
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm border-b border-brand/10 last:border-0">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-900 font-medium text-right">{value}</span>
    </div>
  )
}

function SuccessView({ bookingRef, onClose }: { bookingRef: string; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-10">
      <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mb-4">
        <Check size={28} className="text-brand" />
      </div>
      <h3 className="font-display font-black text-2xl text-gray-900 mb-2">Booking Received!</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-xs leading-relaxed">
        Our team will contact you within 30 minutes to confirm your PTL shipment.
      </p>
      <div className="bg-brand/5 border border-brand/20 rounded-xl px-8 py-5 mb-6">
        <p className="text-xs text-brand font-bold uppercase tracking-widest mb-1">Reference Number</p>
        <p className="font-display font-black text-2xl text-brand tracking-widest">{bookingRef}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="px-8 py-3 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand/90 transition-colors"
      >
        Close
      </button>
    </div>
  )
}

export function PTLBookingModal({ open, onClose }: PTLModalProps) {
  const [step, setStep]           = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending]     = useState(false)
  const [bookingRef, setBookingRef] = useState('')

  // Step 1
  const [originCity, setOriginCity]           = useState('')
  const [destinationCity, setDestinationCity] = useState('')
  // Step 2
  const [goodsType, setGoodsType] = useState('')
  const [weight, setWeight]       = useState('')
  const [packages, setPackages]   = useState('')
  // Step 3
  const [addons, setAddons] = useState<string[]>([])
  // Step 4
  const [fullName, setFullName]   = useState('')
  const [mobile, setMobile]       = useState('')
  const [email, setEmail]         = useState('')
  const [company, setCompany]     = useState('')

  function reset() {
    setStep(1); setSubmitted(false); setSending(false); setBookingRef('')
    setOriginCity(''); setDestinationCity('')
    setGoodsType(''); setWeight(''); setPackages('')
    setAddons([]); setFullName(''); setMobile(''); setEmail(''); setCompany('')
  }

  function handleClose() { reset(); onClose() }

  function toggleAddon(id: string) {
    setAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
  }

  function canNext(): boolean {
    if (step === 1) return !!(originCity.trim() && destinationCity.trim())
    if (step === 2) return !!(goodsType.trim() && weight.trim() && packages.trim())
    return true
  }

  async function handleSubmit() {
    setSending(true)
    const ref = genRef()
    setBookingRef(ref)
    try {
      await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingRef: ref,
          serviceType: 'PTL — Part Truck Load',
          pickupCity:  originCity,
          deliveryCity: destinationCity,
          goodsType,
          weightRange: `${weight} kg`,
          numberOfPackages: packages,
          additionalServices: addons.length
            ? ADD_ONS.filter(a => addons.includes(a.id)).map(a => a.label).join(', ')
            : 'None',
          fullName,
          mobile,
          email,
          companyName: company,
        }),
      })
    } catch (e) {
      console.error('[PTL booking]', e)
    }
    setSending(false)
    setSubmitted(true)
  }

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
        <Dialog.Content
          className={cn(
            'fixed z-[70] bg-white shadow-2xl flex flex-col overflow-hidden',
            // mobile full-screen
            'inset-0 rounded-none',
            // desktop centred
            'sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
            'sm:rounded-2xl sm:w-[95vw] sm:max-w-[560px] sm:max-h-[90vh]',
          )}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center">
                <PackageOpen size={18} className="text-brand" />
              </div>
              <div>
                <Dialog.Title className="font-display font-bold text-gray-900 text-sm leading-none">
                  PTL Booking
                </Dialog.Title>
                {!submitted && (
                  <p className="text-xs text-gray-400 mt-0.5">{STEPS[step - 1]?.subtitle}</p>
                )}
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          {/* ── Step progress ── */}
          {!submitted && (
            <div className="px-6 pt-4 pb-0 shrink-0">
              <div className="flex gap-1.5 mb-2">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1 rounded-full flex-1 transition-all duration-300',
                      i < step ? 'bg-brand' : 'bg-gray-100'
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400">
                Step {step} of {STEPS.length} — {STEPS[step - 1]?.title}
              </p>
            </div>
          )}

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {submitted ? (
              <SuccessView bookingRef={bookingRef} onClose={handleClose} />
            ) : (
              <>
                {/* Step 1 — Route */}
                {step === 1 && (
                  <div className="space-y-4">
                    <Field label="Origin City *">
                      <input
                        className={inputCls}
                        placeholder="Enter origin city"
                        value={originCity}
                        onChange={e => setOriginCity(e.target.value)}
                      />
                    </Field>
                    <Field label="Destination City *">
                      <input
                        className={inputCls}
                        placeholder="Enter destination city"
                        value={destinationCity}
                        onChange={e => setDestinationCity(e.target.value)}
                      />
                    </Field>
                  </div>
                )}

                {/* Step 2 — Shipment */}
                {step === 2 && (
                  <div className="space-y-4">
                    <Field label="Goods Type *">
                      <input
                        className={inputCls}
                        placeholder="e.g. Textiles, Chemicals, FMCG"
                        value={goodsType}
                        onChange={e => setGoodsType(e.target.value)}
                      />
                    </Field>
                    <Field label="Total Weight (kg) *">
                      <input
                        className={inputCls}
                        type="number"
                        min="1"
                        placeholder="e.g. 500"
                        value={weight}
                        onChange={e => setWeight(e.target.value)}
                      />
                    </Field>
                    <Field label="Number of Packages *">
                      <input
                        className={inputCls}
                        type="number"
                        min="1"
                        placeholder="e.g. 10"
                        value={packages}
                        onChange={e => setPackages(e.target.value)}
                      />
                    </Field>
                  </div>
                )}

                {/* Step 3 — Additional services */}
                {step === 3 && (
                  <div className="space-y-2.5">
                    <p className="text-sm text-gray-500 mb-4">
                      Select any optional services you need:
                    </p>
                    {ADD_ONS.map(svc => (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => toggleAddon(svc.id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all',
                          addons.includes(svc.id)
                            ? 'border-brand bg-brand/5 text-brand'
                            : 'border-gray-200 text-gray-700 hover:border-brand/40'
                        )}
                      >
                        <div className={cn(
                          'w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all',
                          addons.includes(svc.id)
                            ? 'bg-brand border-brand'
                            : 'border-gray-300'
                        )}>
                          {addons.includes(svc.id) && <Check size={11} className="text-white" />}
                        </div>
                        <span className="text-sm font-medium">{svc.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 4 — Contact */}
                {step === 4 && (
                  <div className="space-y-4">
                    <Field label="Full Name *">
                      <input
                        className={inputCls}
                        placeholder="Your full name"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                      />
                    </Field>
                    <Field label="Mobile Number *">
                      <input
                        className={inputCls}
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={mobile}
                        onChange={e => setMobile(e.target.value)}
                      />
                    </Field>
                    <Field label="Email Address">
                      <input
                        className={inputCls}
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </Field>
                    <Field label="Company Name">
                      <input
                        className={inputCls}
                        placeholder="Company (optional)"
                        value={company}
                        onChange={e => setCompany(e.target.value)}
                      />
                    </Field>
                  </div>
                )}

                {/* Step 5 — Review */}
                {step === 5 && (
                  <div>
                    <div className="bg-brand/5 rounded-xl p-5 space-y-0.5">
                      <p className="text-xs font-bold text-brand uppercase tracking-widest mb-3">Route</p>
                      <ReviewRow label="From"        value={originCity} />
                      <ReviewRow label="To"          value={destinationCity} />

                      <p className="text-xs font-bold text-brand uppercase tracking-widest mb-3 mt-5">Shipment</p>
                      <ReviewRow label="Goods"       value={goodsType} />
                      <ReviewRow label="Weight"      value={`${weight} kg`} />
                      <ReviewRow label="Packages"    value={packages} />
                      {addons.length > 0 && (
                        <ReviewRow
                          label="Add-ons"
                          value={ADD_ONS.filter(a => addons.includes(a.id)).map(a => a.label).join(', ')}
                        />
                      )}

                      <p className="text-xs font-bold text-brand uppercase tracking-widest mb-3 mt-5">Contact</p>
                      <ReviewRow label="Name"        value={fullName} />
                      <ReviewRow label="Mobile"      value={mobile} />
                      {email   && <ReviewRow label="Email"   value={email} />}
                      {company && <ReviewRow label="Company" value={company} />}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Footer actions ── */}
          {!submitted && (
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={14} /> Back
                </button>
              )}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={() => canNext() && setStep(s => s + 1)}
                  disabled={!canNext()}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all',
                    canNext()
                      ? 'bg-brand text-white hover:bg-brand/90'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  )}
                >
                  Continue <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={sending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand/90 disabled:opacity-60 transition-all"
                >
                  {sending
                    ? <><Loader2 size={14} className="animate-spin" /> Submitting…</>
                    : <><Check size={14} /> Confirm Booking</>}
                </button>
              )}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
