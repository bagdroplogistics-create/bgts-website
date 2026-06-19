'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search, Package, MapPin, Clock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { cn, formatDate } from '@/lib/utils'
import { trackingSchema, type TrackingFormData } from '@/lib/schemas'
import type { Consignment, ConsignmentStatus } from '@/types'

// ─── Mock consignment data (replace with API call in production) ───────────
const MOCK_CONSIGNMENTS: Record<string, Consignment> = {
  'BGTS26123456': {
    lrNumber:    'BGTS26123456',
    origin:      'Vadodara',
    destination: 'Mumbai',
    status:      'transit',
    serviceType: 'Full Truck Load (FTL)',
    vehicleType: 'Multi-Axle',
    driver:      'Ramesh Kumar (+91-98XXXXXXXX)',
    eta:         '2026-06-20T14:00:00',
    weightKg:    8500,
    packages:    12,
    events: [
      { timestamp: '2026-06-19T08:00:00', location: 'Vadodara Hub', status: 'booked',    description: 'Consignment booked and vehicle allocated' },
      { timestamp: '2026-06-19T10:30:00', location: 'Vadodara Hub', status: 'transit',   description: 'Vehicle departed from origin' },
      { timestamp: '2026-06-19T16:00:00', location: 'Bharuch Toll', status: 'transit',   description: 'Vehicle at Bharuch toll, on track' },
    ],
  },
}

// ─── Timeline event ───────────────────────────────────────────────────────
function TimelineEvent({
  event,
  isLast,
}: {
  event: Consignment['events'][0]
  isLast: boolean
}) {
  const statusColors: Record<ConsignmentStatus, string> = {
    booked:    'bg-info',
    transit:   'bg-brand',
    delayed:   'bg-saffron',
    delivered: 'bg-success',
    exception: 'bg-error',
  }

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={cn('w-3 h-3 rounded-full mt-0.5 shrink-0', statusColors[event.status])} />
        {!isLast && <div className="w-px flex-1 bg-ink-ghost/20 my-1" />}
      </div>
      <div className="pb-4">
        <p className="text-sm font-medium text-ink-strong">{event.description}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-xs text-ink-muted">
            <MapPin size={10} aria-hidden="true" />
            {event.location}
          </span>
          <span className="flex items-center gap-1 text-xs text-ink-muted">
            <Clock size={10} aria-hidden="true" />
            {new Date(event.timestamp).toLocaleString('en-IN', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Consignment result card ──────────────────────────────────────────────
function ConsignmentCard({ consignment }: { consignment: Consignment }) {
  return (
    <div className="mt-6 rounded-2xl border border-ink-ghost/10 overflow-hidden bg-white">
      {/* Header */}
      <div className="bg-surface-mid px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-ink-muted mb-1">LR Number</p>
          <p className="font-mono font-bold text-ink-strong text-lg">{consignment.lrNumber}</p>
        </div>
        <StatusBadge status={consignment.status} />
      </div>

      {/* Route */}
      <div className="px-6 py-4 grid sm:grid-cols-3 gap-4 border-b border-ink-ghost/10">
        <div>
          <p className="text-xs text-ink-muted mb-1">From</p>
          <p className="font-semibold text-ink-strong text-sm">{consignment.origin}</p>
        </div>
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 text-ink-ghost">
            <div className="h-px w-8 bg-ink-ghost/30" />
            <Package size={14} aria-hidden="true" />
            <div className="h-px w-8 bg-ink-ghost/30" />
          </div>
        </div>
        <div>
          <p className="text-xs text-ink-muted mb-1">To</p>
          <p className="font-semibold text-ink-strong text-sm">{consignment.destination}</p>
        </div>
      </div>

      {/* Details */}
      <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-ink-ghost/10">
        {[
          { label: 'Service',  value: consignment.serviceType },
          { label: 'Weight',   value: consignment.weightKg ? `${consignment.weightKg.toLocaleString('en-IN')} kg` : '—' },
          { label: 'Packages', value: consignment.packages?.toString() ?? '—' },
          { label: 'ETA',      value: consignment.eta ? formatDate(consignment.eta) : 'TBD' },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs text-ink-muted mb-0.5">{label}</p>
            <p className="text-sm font-medium text-ink-strong">{value}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="px-6 py-5">
        <h3 className="text-xs font-display font-bold uppercase tracking-wider text-ink-muted mb-4">
          Shipment Timeline
        </h3>
        {consignment.events.map((event, i) => (
          <TimelineEvent
            key={event.timestamp}
            event={event}
            isLast={i === consignment.events.length - 1}
          />
        ))}
      </div>

      {/* Driver info */}
      {consignment.driver && (
        <div className="px-6 pb-5 flex items-center gap-3 bg-brand-subtle/50 mx-4 mb-4 rounded-xl p-3">
          <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center">
            <CheckCircle size={14} className="text-brand" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs text-ink-muted">Driver</p>
            <p className="text-sm font-medium text-ink-strong">{consignment.driver}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main TrackingForm ────────────────────────────────────────────────────
export function TrackingForm() {
  const [consignment, setConsignment] = useState<Consignment | null>(null)
  const [notFound, setNotFound]       = useState(false)
  const [loading, setLoading]         = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<TrackingFormData>({
    resolver: zodResolver(trackingSchema),
  })

  const onSubmit = async ({ lrNumber }: TrackingFormData) => {
    setLoading(true)
    setNotFound(false)
    setConsignment(null)

    // Simulate API latency
    await new Promise((r) => setTimeout(r, 800))

    const result = MOCK_CONSIGNMENTS[lrNumber.toUpperCase()]
    if (result) {
      setConsignment(result)
    } else {
      setNotFound(true)
    }
    setLoading(false)
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Enter LR / Consignment number (e.g. BGTS26123456)"
              error={errors.lrNumber?.message}
              className="h-12 text-base font-mono"
              {...register('lrNumber')}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            icon={loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            iconPosition="left"
            className="shrink-0 h-12"
          >
            Track
          </Button>
        </div>
      </form>

      {notFound && !loading && (
        <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-error/5 border border-error/20">
          <AlertTriangle size={18} className="text-error shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-ink-strong">Consignment not found</p>
            <p className="text-sm text-ink-muted mt-0.5">
              Please check the LR number and try again. For assistance, call{' '}
              <a href="tel:+916357225722" className="text-brand hover:underline">
                +91 63 5722 5722
              </a>
              .
            </p>
          </div>
        </div>
      )}

      {consignment && !loading && (
        <ConsignmentCard consignment={consignment} />
      )}
    </div>
  )
}
