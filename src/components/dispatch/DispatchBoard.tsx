'use client'
import { useState } from 'react'
import { buildWhatsAppMessage, openWhatsApp, STAGE_LABELS } from '@/lib/whatsapp'
import type { Booking, BookingStage } from '@/types/dispatch'

// Active stages shown in dropdown
const STAGE_ORDER: BookingStage[] = [
  'BOOKING_RECEIVED','PAYMENT_PENDING','PAYMENT_RECEIVED','BOOKING_CONFIRMED',
  'VEHICLE_DISPATCHED','IN_TRANSIT','DELIVERED','INVOICE_RAISED','CANCELLED',
]

const STAGE_COLORS: Record<BookingStage, string> = {
  BOOKING_RECEIVED:  'bg-blue-100 text-blue-800',
  PAYMENT_PENDING:   'bg-amber-100 text-amber-800',
  PAYMENT_RECEIVED:  'bg-teal-100 text-teal-800',
  BOOKING_CONFIRMED: 'bg-indigo-100 text-indigo-800',
  VEHICLE_DISPATCHED:'bg-yellow-100 text-yellow-800',
  IN_TRANSIT:        'bg-orange-100 text-orange-800',
  DELIVERED:         'bg-green-100 text-green-800',
  INVOICE_RAISED:    'bg-purple-100 text-purple-800',
  CANCELLED:         'bg-red-100 text-red-800',
  // Legacy
  BOOKED:    'bg-blue-100 text-blue-800',
  DISPATCHED:'bg-yellow-100 text-yellow-800',
  INVOICED:  'bg-purple-100 text-purple-800',
}

type FilterStatus = 'ALL' | BookingStage

interface Props {
  bookings:    Booking[]
  onStageChange: (id: string, stage: BookingStage) => Promise<void>
  loading:     boolean
}

function rs(n: number | null) {
  if (!n) return '—'
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

export function DispatchBoard({ bookings, onStageChange, loading }: Props) {
  const [filter,      setFilter]      = useState<FilterStatus>('ALL')
  const [vehicleFilter, setVehicleFilter] = useState<string>('ALL')
  const [pending, setPending] = useState<string | null>(null)
  const [waModal, setWaModal] = useState<{ booking: Booking; stage: BookingStage; msg: string } | null>(null)

  const filtered = bookings.filter(b => {
    const stageOk   = filter === 'ALL'        || b.stage === filter
    const vehicleOk = vehicleFilter === 'ALL' || b.vehicle_id === vehicleFilter
    return stageOk && vehicleOk
  })
  // Unique vehicles in bookings for filter dropdown
  const vehicleOptions = Array.from(
    new Map(bookings.filter(b => b.vehicle).map(b => [b.vehicle_id, b.vehicle!])).values()
  )

  const handleStageChange = async (booking: Booking, newStage: BookingStage) => {
    if (newStage === booking.stage) return
    // Build WhatsApp message and show preview modal
    const msg = buildWhatsAppMessage(booking, newStage)
    setWaModal({ booking, stage: newStage, msg })
  }

  const confirmStageChange = async () => {
    if (!waModal) return
    setPending(waModal.booking.id)
    try {
      await onStageChange(waModal.booking.id, waModal.stage)
    } finally {
      setPending(null)
    }
    // Open WhatsApp with the pre-filled message
    openWhatsApp(waModal.booking.phone, waModal.msg)
    setWaModal(null)
  }

  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10)
    window.open(`/api/dispatch/bookings/export?date=${date}`, '_blank')
  }

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Dispatch Board</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Every booking, every stage. Changing the Stage dropdown opens a pre-filled WhatsApp message — review it, then hit send.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter */}
          <div className="flex gap-1 flex-wrap">
            {(['ALL','BOOKING_RECEIVED','PAYMENT_PENDING','PAYMENT_RECEIVED','BOOKING_CONFIRMED','VEHICLE_DISPATCHED','IN_TRANSIT','DELIVERED','INVOICE_RAISED','CANCELLED'] as FilterStatus[]).map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {s === 'ALL' ? 'All' : (STAGE_LABELS as Record<string,string>)[s] ?? s.replace(/_/g,' ')}
              </button>
            ))}
          </div>
          {/* Vehicle filter */}
          <select
            value={vehicleFilter}
            onChange={e => setVehicleFilter(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '0.78rem', border: '1px solid #d5cfc7', borderRadius: 6, background: '#faf7f4', cursor: 'pointer' }}>
            <option value="ALL">All Vehicles</option>
            {vehicleOptions.map(v => (
              <option key={v.id} value={v.id}>{v.reg_no}</option>
            ))}
          </select>
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 text-white text-xs font-semibold hover:bg-gray-700 transition-colors">
            ⬇ Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center text-gray-400">Loading bookings…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Date','Client / Co.','Phone','Vehicle','Route','Material','Rate','Stage','Source'].map(h => (
                  <th key={h} className="px-3 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400">No bookings found</td></tr>
              ) : filtered.map(b => (
                <tr key={b.id} className={`border-b border-gray-100 hover:bg-gray-50 ${pending === b.id ? 'opacity-50' : ''}`}>
                  <td className="px-3 py-3 whitespace-nowrap text-gray-700 text-xs font-medium">{b.trip_date}</td>
                  <td className="px-3 py-3">
                    <div className="font-medium text-gray-900">{b.client_name}</div>
                    {b.company_name && <div className="text-xs text-gray-500">{b.company_name}</div>}
                  </td>
                  <td className="px-3 py-3 text-gray-600 text-xs whitespace-nowrap">{b.phone}</td>
                  <td className="px-3 py-3 font-mono text-xs text-gray-700">{b.vehicle?.reg_no ?? '—'}</td>
                  <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">
                    {b.from_loc} → {b.to_loc}
                    <div className="text-gray-400">{b.distance_km} km</div>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-600">{b.material}</td>
                  <td className="px-3 py-3 text-xs font-bold text-gray-900 whitespace-nowrap">{rs(b.rate_total)}</td>
                  <td className="px-3 py-3">
                    <select
                      value={b.stage}
                      onChange={e => handleStageChange(b, e.target.value as BookingStage)}
                      disabled={pending === b.id}
                      className={`text-xs font-semibold rounded-lg px-2 py-1 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400 ${STAGE_COLORS[b.stage]}`}>
                      {STAGE_ORDER.map(s => (
                        <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      b.source === 'CUSTOMER' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                    }`}>{b.source}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* WhatsApp Preview Modal */}
      {waModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="p-5 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">Update Stage → {STAGE_LABELS[waModal.stage]}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Review this WhatsApp message before it opens on your device.
              </p>
            </div>
            <div className="p-5">
              <div className="bg-[#DCF8C6] rounded-xl p-4 text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                {waModal.msg}
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 flex gap-3 justify-end">
              <button onClick={() => setWaModal(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200">
                Cancel
              </button>
              <button onClick={confirmStageChange}
                className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 flex items-center gap-2">
                ✓ Update Stage &amp; Open WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
