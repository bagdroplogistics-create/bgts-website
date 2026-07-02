'use client'
import { useState } from 'react'

// ── Constants ─────────────────────────────────────────────────────────────────
const MVD_VEHICLE_TYPES = [
  'Any / All Types',
  'LCV / Pickup',
  'Tauras (22–24 ft)',
  'Open Truck / Dala',
  'Container',
  'Trailer / Flatbed',
  'ODC / Heavy Lift / Low Bed',
  'Crane',
  'Tanker',
  'Packers & Movers',
]

// ── Types ─────────────────────────────────────────────────────────────────────
interface MvdBookingForm {
  trip_date:      string
  client_name:    string
  company_name:   string
  phone:          string
  email:          string
  from_loc:       string
  to_loc:         string
  distance_km:    string
  vehicle_type:   string
  material:       string
  pcs_boxes:      string
  weight_kg:      string
  trip_type:      'INTRACITY' | 'INTERCITY'
  margin_pct:     string
  notes:          string
  driver_name:    string
  driver_phone:   string
  driver_license: string
}

const EMPTY: MvdBookingForm = {
  trip_date: '', client_name: '', company_name: '', phone: '', email: '',
  from_loc: '', to_loc: '', distance_km: '', vehicle_type: '',
  material: '', pcs_boxes: '', weight_kg: '', trip_type: 'INTERCITY',
  margin_pct: '20', notes: '',
  driver_name: '', driver_phone: '', driver_license: '',
}

interface Props {
  onSuccess: () => void
}

// ── Style constants ───────────────────────────────────────────────────────────
const INP: React.CSSProperties = {
  width: '100%', border: '1px solid #d1ccbf', borderRadius: 6,
  padding: '7px 10px', fontSize: '0.82rem', background: '#fff',
  outline: 'none', boxSizing: 'border-box',
}
const LBL: React.CSSProperties = {
  display: 'block', fontSize: '0.68rem', fontWeight: 700,
  letterSpacing: '0.08em', textTransform: 'uppercase',
  color: '#888', marginBottom: 4,
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={LBL}>{label}</label>
      {children}
    </div>
  )
}

function SectionDivider({ children }: { children: string }) {
  return (
    <div style={{
      fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em',
      textTransform: 'uppercase', color: '#c45c28',
      borderBottom: '1px solid #e8e2d8', paddingBottom: 4,
      marginTop: 6, marginBottom: 2,
    }}>
      {children}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '6px 0', borderBottom: '1px solid #ede8e0', fontSize: '0.82rem',
    }}>
      <span style={{ color: '#666' }}>{label}</span>
      <span style={{ color: '#111', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function MarketVehicleBookingForm({ onSuccess }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const [form,    setForm]    = useState<MvdBookingForm>({ ...EMPTY, trip_date: today })
  const [saving,  setSaving]  = useState(false)
  const [err,     setErr]     = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const set = (k: keyof MvdBookingForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }))

  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    (e.currentTarget.style.borderColor = '#c45c28')
  const blur  = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    (e.currentTarget.style.borderColor = '#d1ccbf')

  const inp = (k: keyof MvdBookingForm, type = 'text', ph = '') => (
    <input type={type} value={form[k]} onChange={set(k)} placeholder={ph}
      style={INP} onFocus={focus} onBlur={blur} />
  )

  const selEl = (k: keyof MvdBookingForm, opts: React.ReactNode) => (
    <select value={form[k]} onChange={set(k)} style={INP} onFocus={focus} onBlur={blur}>
      {opts}
    </select>
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.vehicle_type) { setErr('Please select a vehicle type.'); return }
    setSaving(true); setErr(null)
    try {
      const res = await fetch('/api/dispatch/mvd/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          distance_km: form.distance_km ? Number(form.distance_km) : null,
          pcs_boxes:   form.pcs_boxes   ? Number(form.pcs_boxes)   : null,
          weight_kg:   form.weight_kg   ? Number(form.weight_kg)   : null,
          margin_pct:  Number(form.margin_pct),
        }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setSuccess(true)
      setForm({ ...EMPTY, trip_date: today })
      setTimeout(() => { setSuccess(false); onSuccess() }, 1500)
    } catch (err2) {
      setErr(err2 instanceof Error ? err2.message : 'Failed to create booking')
    } finally {
      setSaving(false)
    }
  }

  const routeSummary = form.from_loc && form.to_loc
    ? `${form.from_loc} → ${form.to_loc}`
    : null

  return (
    <div style={{ padding: 24 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: 20,
        alignItems: 'start',
      }}>

        {/* ═══ FORM ═════════════════════════════════════════════════════════ */}
        <div style={{
          background: '#faf7f4', border: '1px solid #ddd8d0',
          borderRadius: 10, padding: '20px 24px',
        }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#111', margin: '0 0 2px' }}>
            Market Vehicle Booking
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#c45c28', margin: '0 0 16px' }}>
            Book from market vehicle agents — select vehicle category, enter custom material, and fill client details.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Row 1 — Date, Client, Company */}
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr', gap: 10 }}>
              <Field label="Trip Date *">{inp('trip_date', 'date')}</Field>
              <Field label="Client Name *">{inp('client_name', 'text', 'Full name')}</Field>
              <Field label="Company Name">{inp('company_name', 'text', 'Optional for individuals')}</Field>
            </div>

            {/* Row 2 — Phone, Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Phone (for WhatsApp) *">{inp('phone', 'tel', '10-digit or with country code')}</Field>
              <Field label="Email (optional)">{inp('email', 'email', '')}</Field>
            </div>

            {/* Row 3 — Route + Distance */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: 10 }}>
              <Field label="From Location *">{inp('from_loc', 'text', '')}</Field>
              <Field label="To Location *">{inp('to_loc', 'text', '')}</Field>
              <Field label="Distance (km)">{inp('distance_km', 'number', '50')}</Field>
            </div>

            {/* Row 4 — Material (text), Pcs, Weight */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 130px', gap: 10 }}>
              <Field label="Material Type *">
                <input
                  type="text"
                  required
                  value={form.material}
                  onChange={set('material')}
                  placeholder="Enter Material Type"
                  style={INP}
                  onFocus={focus}
                  onBlur={blur}
                />
              </Field>
              <Field label="Pcs / Boxes">{inp('pcs_boxes', 'number', '0')}</Field>
              <Field label="Est. Load Wt. (kg)">{inp('weight_kg', 'number', 'optional')}</Field>
            </div>

            {/* Row 5 — Vehicle Type, Trip Type, Margin */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 90px', gap: 10 }}>
              <Field label="Vehicle Type *">
                <select
                  required
                  value={form.vehicle_type}
                  onChange={set('vehicle_type')}
                  style={INP}
                  onFocus={focus}
                  onBlur={blur}
                >
                  <option value="">— Select vehicle type —</option>
                  {MVD_VEHICLE_TYPES.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </Field>
              <Field label="Trip Type">
                {selEl('trip_type',
                  (['INTRACITY', 'INTERCITY'] as const).map(t => (
                    <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                  ))
                )}
              </Field>
              <Field label="Margin %">{inp('margin_pct', 'number', '20')}</Field>
            </div>

            {/* Driver Details */}
            <SectionDivider>Driver Details</SectionDivider>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <Field label="Driver Name">{inp('driver_name', 'text', 'Full name')}</Field>
              <Field label="Driver Contact No.">{inp('driver_phone', 'tel', '10-digit number')}</Field>
              <Field label="Driver License No.">{inp('driver_license', 'text', 'DL-XXXXXXXXXXXXXX')}</Field>
            </div>

            <Field label="Notes">
              <textarea
                value={form.notes}
                onChange={set('notes')}
                rows={2}
                placeholder="Internal notes for dispatch team…"
                style={{ ...INP, resize: 'none' }}
                onFocus={focus}
                onBlur={blur}
              />
            </Field>

            {err && (
              <div style={{
                background: '#fff0f0', border: '1px solid #ffd0d0',
                borderRadius: 7, padding: '9px 14px', color: '#c00', fontSize: '0.8rem',
              }}>{err}</div>
            )}
            {success && (
              <div style={{
                background: '#f0fff4', border: '1px solid #b2dfbd',
                borderRadius: 7, padding: '9px 14px',
                color: '#1a6e35', fontSize: '0.8rem', fontWeight: 600,
              }}>
                Market vehicle booking created successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%', padding: 11,
                background: saving ? '#e0a060' : '#e07a20',
                color: '#fff', border: 'none', borderRadius: 8,
                fontWeight: 700, fontSize: '0.9rem',
                cursor: saving ? 'not-allowed' : 'pointer', marginTop: 4,
              }}
            >
              {saving ? 'Creating…' : 'Create Market Vehicle Booking'}
            </button>
          </form>
        </div>

        {/* ═══ BOOKING SUMMARY ══════════════════════════════════════════════ */}
        <div style={{
          background: '#faf7f4', border: '1px solid #ddd8d0',
          borderRadius: 10, padding: '20px 22px', position: 'sticky', top: 16,
        }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111', margin: '0 0 14px' }}>
            Booking Summary
          </h3>

          {!routeSummary ? (
            <p style={{ color: '#aaa', fontSize: '0.82rem' }}>
              Fill in the route and vehicle type to see a summary.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Route highlight */}
              <div style={{
                background: '#fff4ee', border: '1px solid #f0d0b0',
                borderRadius: 8, padding: '12px 16px', marginBottom: 12,
              }}>
                <div style={{
                  fontSize: '0.66rem', color: '#c45c28', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4,
                }}>Route</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#7a2e00' }}>
                  {routeSummary}
                </div>
              </div>

              <SummaryRow label="Vehicle Type" value={form.vehicle_type || '—'} />
              <SummaryRow label="Material"     value={form.material     || '—'} />
              <SummaryRow label="Distance"     value={form.distance_km  ? `${form.distance_km} km` : '—'} />
              <SummaryRow label="Trip Type"    value={form.trip_type} />
              <SummaryRow label="Pcs / Boxes"  value={form.pcs_boxes   || '—'} />
              <SummaryRow label="Weight"       value={form.weight_kg   ? `${form.weight_kg} kg` : '—'} />
              <SummaryRow label="Client"       value={form.client_name || '—'} />
              <SummaryRow label="Phone"        value={form.phone       || '—'} />
              {form.company_name && (
                <SummaryRow label="Company" value={form.company_name} />
              )}

              <div style={{
                background: '#f5f5f5', borderRadius: 7,
                padding: '10px 14px', marginTop: 10,
                fontSize: '0.75rem', color: '#888', lineHeight: 1.5,
              }}>
                Market vehicle rate is negotiated with the agent via MVD — no auto-calculation for external fleet.
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
