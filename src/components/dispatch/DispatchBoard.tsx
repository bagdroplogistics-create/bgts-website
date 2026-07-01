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
  onRefresh?:  () => void
}

function rs(n: number | null) {
  if (!n) return '—'
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

// ── Edit modal form state
interface EditForm {
  trip_date:    string
  client_name:  string
  company_name: string
  phone:        string
  from_loc:     string
  to_loc:       string
  distance_km:  string
  material:     string
  rate_total:   string
  notes:        string
}

function bookingToForm(b: Booking): EditForm {
  return {
    trip_date:    b.trip_date    ?? '',
    client_name:  b.client_name  ?? '',
    company_name: b.company_name ?? '',
    phone:        b.phone        ?? '',
    from_loc:     b.from_loc     ?? '',
    to_loc:       b.to_loc       ?? '',
    distance_km:  String(b.distance_km ?? ''),
    material:     b.material     ?? '',
    rate_total:   String(b.rate_total ?? ''),
    notes:        b.notes        ?? '',
  }
}

// Pencil icon
function IconEdit() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

// Trash icon
function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}

export function DispatchBoard({ bookings, onStageChange, loading, onRefresh }: Props) {
  const [filter,        setFilter]        = useState<FilterStatus>('ALL')
  const [vehicleFilter, setVehicleFilter] = useState<string>('ALL')
  const [pending,       setPending]       = useState<string | null>(null)
  const [waModal,       setWaModal]       = useState<{ booking: Booking; stage: BookingStage; msg: string } | null>(null)

  // Edit state
  const [editBooking, setEditBooking] = useState<Booking | null>(null)
  const [editForm,    setEditForm]    = useState<EditForm | null>(null)
  const [editSaving,  setEditSaving]  = useState(false)
  const [editErr,     setEditErr]     = useState('')

  // Delete state
  const [deleteBooking,    setDeleteBooking]    = useState<Booking | null>(null)
  const [deleteConfirming, setDeleteConfirming] = useState(false)

  const filtered = bookings.filter(b => {
    const stageOk   = filter === 'ALL'        || b.stage === filter
    const vehicleOk = vehicleFilter === 'ALL' || b.vehicle_id === vehicleFilter
    return stageOk && vehicleOk
  })
  const vehicleOptions = Array.from(
    new Map(bookings.filter(b => b.vehicle).map(b => [b.vehicle_id, b.vehicle!])).values()
  )

  const handleStageChange = async (booking: Booking, newStage: BookingStage) => {
    if (newStage === booking.stage) return
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
    openWhatsApp(waModal.booking.phone, waModal.msg)
    setWaModal(null)
  }

  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10)
    window.open(`/api/dispatch/bookings/export?date=${date}`, '_blank')
  }

  // ── Edit handlers
  const openEdit = (b: Booking) => {
    setEditBooking(b)
    setEditForm(bookingToForm(b))
    setEditErr('')
  }

  const saveEdit = async () => {
    if (!editBooking || !editForm) return
    setEditSaving(true); setEditErr('')
    try {
      const res = await fetch(`/api/dispatch/bookings/${editBooking.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...editForm,
          distance_km: editForm.distance_km ? Number(editForm.distance_km) : undefined,
          rate_total:  editForm.rate_total  ? Number(editForm.rate_total)  : undefined,
        }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setEditBooking(null); setEditForm(null)
      onRefresh?.()
    } catch (e: unknown) {
      setEditErr(e instanceof Error ? e.message : String(e))
    } finally {
      setEditSaving(false)
    }
  }

  // ── Delete handlers
  const confirmDelete = async () => {
    if (!deleteBooking) return
    setDeleteConfirming(true)
    try {
      const res  = await fetch(`/api/dispatch/bookings/${deleteBooking.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setDeleteBooking(null)
      onRefresh?.()
    } catch (e: unknown) {
      alert('Delete failed: ' + (e instanceof Error ? e.message : String(e)))
    } finally {
      setDeleteConfirming(false)
    }
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
                {['Date','Client / Co.','Phone','Vehicle','Route','Material','Rate','Stage','Source',''].map((h, i) => (
                  <th key={i} className="px-3 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-gray-400">No bookings found</td></tr>
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
                  {/* Actions */}
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(b)}
                        title="Edit booking"
                        className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <IconEdit />
                      </button>
                      <button
                        onClick={() => setDeleteBooking(b)}
                        title="Delete booking"
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── WhatsApp Preview Modal ── */}
      {waModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="p-5 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">Update Stage → {STAGE_LABELS[waModal.stage]}</h3>
              <p className="text-sm text-gray-500 mt-1">Review this WhatsApp message before it opens on your device.</p>
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

      {/* ── Edit Modal ── */}
      {editBooking && editForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Edit Booking — {editBooking.client_name}</h3>
              <button onClick={() => setEditBooking(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none">&times;</button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              {[
                { key: 'trip_date',    label: 'Trip Date',    type: 'date' },
                { key: 'client_name',  label: 'Client Name',  type: 'text' },
                { key: 'company_name', label: 'Company',      type: 'text' },
                { key: 'phone',        label: 'Phone',        type: 'text' },
                { key: 'from_loc',     label: 'From',         type: 'text' },
                { key: 'to_loc',       label: 'To',           type: 'text' },
                { key: 'distance_km',  label: 'Distance (km)',type: 'number' },
                { key: 'material',     label: 'Material',     type: 'text' },
                { key: 'rate_total',   label: 'Rate (₹)',     type: 'number' },
              ].map(({ key, label, type }) => (
                <div key={key} className={key === 'notes' ? 'col-span-2' : ''}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                  <input
                    type={type}
                    value={(editForm as unknown as Record<string, string>)[key] ?? ''}
                    onChange={e => setEditForm(f => f ? { ...f, [key]: e.target.value } : f)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={e => setEditForm(f => f ? { ...f, notes: e.target.value } : f)}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>
            </div>
            {editErr && (
              <div className="mx-5 mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{editErr}</div>
            )}
            <div className="p-5 border-t border-gray-200 flex gap-3 justify-end">
              <button onClick={() => setEditBooking(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200">
                Cancel
              </button>
              <button onClick={saveEdit} disabled={editSaving}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50">
                {editSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <IconTrash />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Delete Booking?</h3>
              <p className="text-sm text-gray-500 mb-1">
                <span className="font-semibold">{deleteBooking.client_name}</span> — {deleteBooking.from_loc} → {deleteBooking.to_loc}
              </p>
              <p className="text-sm text-gray-500">{deleteBooking.trip_date}</p>
              <p className="text-xs text-red-500 mt-3">This action cannot be undone.</p>
            </div>
            <div className="p-5 border-t border-gray-200 flex gap-3 justify-center">
              <button onClick={() => setDeleteBooking(null)}
                className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleteConfirming}
                className="px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
                {deleteConfirming ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
