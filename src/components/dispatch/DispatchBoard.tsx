'use client'
import { useState } from 'react'
import { buildWhatsAppMessage, openWhatsApp, STAGE_LABELS } from '@/lib/whatsapp'
import type { Booking, BookingStage, MaterialType, TripType, Vehicle } from '@/types/dispatch'

const MATERIALS: MaterialType[] = [
  'General Cargo','Steel / Metal','Cement / Building Material',
  'Chemicals','FMCG / Packaged Goods','Machinery / Equipment',
  'Agricultural Produce','Other',
]

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
  vehicles?:   Vehicle[]
  onStageChange: (id: string, stage: BookingStage) => Promise<void>
  loading:     boolean
  onRefresh?:  () => void
}

function rs(n: number | null) {
  if (!n) return '—'
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

// ── Edit modal form state — mirrors all BookingForm fields
interface EditForm {
  trip_date:        string
  client_name:      string
  company_name:     string
  confirmed_broker: string
  phone:            string
  email:            string
  from_loc:       string
  to_loc:         string
  distance_km:    string
  material:       MaterialType
  pcs_boxes:      string
  weight_kg:      string
  vehicle_id:     string
  trip_type:      TripType
  margin_pct:     string
  rate_total:     string
  notes:          string
  driver_name:    string
  driver_phone:   string
  driver_license: string
}

function bookingToForm(b: Booking): EditForm {
  return {
    trip_date:        b.trip_date        ?? '',
    client_name:      b.client_name      ?? '',
    company_name:     b.company_name     ?? '',
    confirmed_broker: b.confirmed_broker ?? '',
    phone:            b.phone            ?? '',
    email:            b.email            ?? '',
    from_loc:       b.from_loc       ?? '',
    to_loc:         b.to_loc         ?? '',
    distance_km:    String(b.distance_km ?? ''),
    material:       b.material       ?? 'General Cargo',
    pcs_boxes:      String(b.pcs_boxes  ?? ''),
    weight_kg:      String(b.weight_kg  ?? ''),
    vehicle_id:     b.vehicle_id     ?? '',
    trip_type:      b.trip_type      ?? 'INTERCITY',
    margin_pct:     String(b.margin_pct ?? 20),
    rate_total:     String(b.rate_total ?? ''),
    notes:          b.notes          ?? '',
    driver_name:    b.driver_name    ?? '',
    driver_phone:   b.driver_phone   ?? '',
    driver_license: b.driver_license ?? '',
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

export function DispatchBoard({ bookings, vehicles = [], onStageChange, loading, onRefresh }: Props) {
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
          distance_km:    editForm.distance_km    ? Number(editForm.distance_km)    : undefined,
          pcs_boxes:      editForm.pcs_boxes      ? Number(editForm.pcs_boxes)      : null,
          weight_kg:      editForm.weight_kg      ? Number(editForm.weight_kg)      : null,
          margin_pct:     editForm.margin_pct     ? Number(editForm.margin_pct)     : 20,
          rate_total:     editForm.rate_total     ? Number(editForm.rate_total)     : null,
          driver_name:    editForm.driver_name    || null,
          driver_phone:   editForm.driver_phone   || null,
          driver_license: editForm.driver_license || null,
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
                    {b.company_name     && <div className="text-xs text-gray-500">{b.company_name}</div>}
                    {b.confirmed_broker && <div className="text-xs text-blue-600 font-medium">🚛 {b.confirmed_broker}</div>}
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl" style={{ maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header — sticky */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Edit Booking</h3>
                <p className="text-xs text-gray-500 mt-0.5">{editBooking.client_name} — {editBooking.from_loc} → {editBooking.to_loc}</p>
              </div>
              <button onClick={() => setEditBooking(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">&times;</button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 p-5" style={{ minHeight: 0 }}>

              {/* ─ Client Info ─────────────────────────────── */}
              <div className="text-xs font-bold uppercase tracking-widest text-orange-600 border-b border-orange-100 pb-1 mb-3">Client Info</div>
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Trip Date</label>
                  <input type="date" value={editForm.trip_date}
                    onChange={e => setEditForm(f => f ? { ...f, trip_date: e.target.value } : f)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Client Name *</label>
                  <input type="text" value={editForm.client_name}
                    onChange={e => setEditForm(f => f ? { ...f, client_name: e.target.value } : f)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Company Name</label>
                  <input type="text" value={editForm.company_name}
                    onChange={e => setEditForm(f => f ? { ...f, company_name: e.target.value } : f)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Confirmed Broker / Agent</label>
                  <div className="text-xs text-gray-400 mb-1">Transporter/broker who arranged this vehicle — not the client&apos;s company</div>
                  <input type="text" autoComplete="off" value={editForm.confirmed_broker}
                    onChange={e => setEditForm(f => f ? { ...f, confirmed_broker: e.target.value } : f)}
                    placeholder="e.g. Nanda Transport"
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Phone *</label>
                  <input type="tel" value={editForm.phone}
                    onChange={e => setEditForm(f => f ? { ...f, phone: e.target.value } : f)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                  <input type="email" value={editForm.email}
                    onChange={e => setEditForm(f => f ? { ...f, email: e.target.value } : f)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              </div>

              {/* ─ Route & Cargo ────────────────────────────── */}
              <div className="text-xs font-bold uppercase tracking-widest text-orange-600 border-b border-orange-100 pb-1 mb-3">Route &amp; Cargo</div>
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">From *</label>
                  <input type="text" value={editForm.from_loc}
                    onChange={e => setEditForm(f => f ? { ...f, from_loc: e.target.value } : f)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">To *</label>
                  <input type="text" value={editForm.to_loc}
                    onChange={e => setEditForm(f => f ? { ...f, to_loc: e.target.value } : f)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Distance (km) *</label>
                  <input type="number" value={editForm.distance_km}
                    onChange={e => setEditForm(f => f ? { ...f, distance_km: e.target.value } : f)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Material *</label>
                  <select value={editForm.material}
                    onChange={e => setEditForm(f => f ? { ...f, material: e.target.value as MaterialType } : f)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                    {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Pcs / Boxes</label>
                  <input type="number" value={editForm.pcs_boxes}
                    onChange={e => setEditForm(f => f ? { ...f, pcs_boxes: e.target.value } : f)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Weight (kg)</label>
                  <input type="number" value={editForm.weight_kg}
                    onChange={e => setEditForm(f => f ? { ...f, weight_kg: e.target.value } : f)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              </div>

              {/* ─ Vehicle & Rate ───────────────────────────── */}
              <div className="text-xs font-bold uppercase tracking-widest text-orange-600 border-b border-orange-100 pb-1 mb-3">Vehicle &amp; Rate</div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Vehicle *</label>
                  <select value={editForm.vehicle_id}
                    onChange={e => setEditForm(f => f ? { ...f, vehicle_id: e.target.value } : f)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                    <option value="">— Select vehicle —</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.reg_no} — {v.make_model}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Trip Type</label>
                  <select value={editForm.trip_type}
                    onChange={e => setEditForm(f => f ? { ...f, trip_type: e.target.value as TripType } : f)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                    <option value="INTRACITY">Intracity</option>
                    <option value="INTERCITY">Intercity</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Margin %</label>
                  <input type="number" value={editForm.margin_pct}
                    onChange={e => setEditForm(f => f ? { ...f, margin_pct: e.target.value } : f)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Rate (₹)</label>
                  <input type="number" value={editForm.rate_total}
                    onChange={e => setEditForm(f => f ? { ...f, rate_total: e.target.value } : f)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              </div>

              {/* ─ Driver Details ───────────────────────────── */}
              <div className="text-xs font-bold uppercase tracking-widest text-orange-600 border-b border-orange-100 pb-1 mb-3">Driver Details</div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Driver Name</label>
                  <input type="text" value={editForm.driver_name}
                    onChange={e => setEditForm(f => f ? { ...f, driver_name: e.target.value } : f)}
                    placeholder="Full name"
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Driver Contact No.</label>
                  <input type="tel" value={editForm.driver_phone}
                    onChange={e => setEditForm(f => f ? { ...f, driver_phone: e.target.value } : f)}
                    placeholder="10-digit number"
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Driver License No.</label>
                  <input type="text" value={editForm.driver_license}
                    onChange={e => setEditForm(f => f ? { ...f, driver_license: e.target.value } : f)}
                    placeholder="DL-XXXXXXXXXXXXXX"
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              </div>

              {/* ─ Notes ───────────────────────────────────── */}
              <div className="text-xs font-bold uppercase tracking-widest text-orange-600 border-b border-orange-100 pb-1 mb-3">Notes</div>
              <textarea value={editForm.notes}
                onChange={e => setEditForm(f => f ? { ...f, notes: e.target.value } : f)}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />

            </div>

            {/* Footer — sticky */}
            <div className="p-4 border-t border-gray-200 flex-shrink-0">
              {editErr && (
                <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{editErr}</div>
              )}
              <div className="flex gap-3 justify-end">
                <button onClick={() => setEditBooking(null)}
                  className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200">
                  Cancel
                </button>
                <button onClick={saveEdit} disabled={editSaving}
                  className="px-5 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50">
                  {editSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
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
