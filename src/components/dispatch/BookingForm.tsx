'use client'
import { useState, useEffect } from 'react'
import { useQuote } from '@/hooks/useQuote'
import type { Vehicle, MaterialType, TripType } from '@/types/dispatch'

const MATERIALS: MaterialType[] = [
  'General Cargo','Steel / Metal','Cement / Building Material',
  'Chemicals','FMCG / Packaged Goods','Machinery / Equipment',
  'Agricultural Produce','Other',
]

interface FormState {
  trip_date:      string
  client_name:    string
  company_name:   string
  phone:          string
  email:          string
  from_loc:       string
  to_loc:         string
  distance_km:    string
  material:       MaterialType
  pcs_boxes:      string
  weight_kg:      string
  vehicle_id:     string
  trip_type:      TripType
  margin_pct:     string
  notes:          string
  driver_name:    string
  driver_phone:   string
  driver_license: string
}

const EMPTY: FormState = {
  trip_date:'', client_name:'', company_name:'', phone:'', email:'',
  from_loc:'', to_loc:'', distance_km:'', material:'General Cargo',
  pcs_boxes:'', weight_kg:'', vehicle_id:'', trip_type:'INTERCITY',
  margin_pct:'20', notes:'',
  driver_name:'', driver_phone:'', driver_license:'',
}

interface Props {
  vehicles       : Vehicle[]
  initialDate?   : string
  initialVehicle?: string
  onSuccess      : () => void
}

function rs(n: number) {
  return String.fromCharCode(8377) + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

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
    <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em',
      textTransform: 'uppercase', color: '#c45c28',
      borderBottom: '1px solid #e8e2d8', paddingBottom: 4,
      marginTop: 6, marginBottom: 2 }}>
      {children}
    </div>
  )
}

export function BookingForm({ vehicles, initialDate, initialVehicle, onSuccess }: Props) {
  const today = new Date().toISOString().slice(0, 10)

  const [form,    setForm]    = useState<FormState>({
    ...EMPTY, trip_date: initialDate ?? today, vehicle_id: initialVehicle ?? '',
  })
  const [saving,  setSaving]  = useState(false)
  const [err,     setErr]     = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { breakdown, loading: quoteLoading, error: quoteErr, calculate } = useQuote()

  useEffect(() => {
    calculate({
      vehicle_id:  form.vehicle_id,
      distance_km: Number(form.distance_km),
      trip_type:   form.trip_type,
      weight_kg:   Number(form.weight_kg),
      margin_pct:  Number(form.margin_pct),
      material:    form.material,
    })
  }, [form.vehicle_id, form.distance_km, form.trip_type, form.margin_pct, calculate])

  const set = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }))

  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    (e.currentTarget.style.borderColor = '#c45c28')
  const blur  = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    (e.currentTarget.style.borderColor = '#d1ccbf')

  const inp = (k: keyof FormState, type = 'text', ph = '') => (
    <input type={type} value={form[k]} onChange={set(k)} placeholder={ph}
      style={INP} onFocus={focus} onBlur={blur} />
  )

  const selEl = (k: keyof FormState, opts: React.ReactNode) => (
    <select value={form[k]} onChange={set(k)} style={INP} onFocus={focus} onBlur={blur}>
      {opts}
    </select>
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr(null)
    try {
      const res  = await fetch('/api/dispatch/bookings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          distance_km: Number(form.distance_km),
          pcs_boxes:   form.pcs_boxes ? Number(form.pcs_boxes) : null,
          weight_kg:   form.weight_kg ? Number(form.weight_kg) : null,
          margin_pct:  Number(form.margin_pct),
          source: 'ADMIN',
        }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setSuccess(true); setForm({ ...EMPTY, trip_date: today })
      setTimeout(() => { setSuccess(false); onSuccess() }, 1500)
    } catch (err2) {
      setErr(err2 instanceof Error ? err2.message : 'Failed to create booking')
    } finally { setSaving(false) }
  }

  const selectedVehicle = vehicles.find(v => v.id === form.vehicle_id)

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

        {/* ═══ FORM (cream card) ═══════════════════════════════════════════ */}
        <div style={{ background: '#faf7f4', border: '1px solid #ddd8d0', borderRadius: 10, padding: '20px 24px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#111', margin: '0 0 2px' }}>Create Booking</h2>
          <p style={{ fontSize: '0.75rem', color: '#c45c28', margin: '0 0 16px' }}>
            Client + company details, route, material and vehicle — rate calculates live as you fill this in.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr', gap: 10 }}>
              <Field label="Trip Date *">{inp('trip_date','date')}</Field>
              <Field label="Client Name *">{inp('client_name','text','Full name')}</Field>
              <Field label="Company Name">{inp('company_name','text','Optional for individuals')}</Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Phone (for WhatsApp) *">{inp('phone','tel','10-digit or with country code')}</Field>
              <Field label="Email (optional)">{inp('email','email','')}</Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: 10 }}>
              <Field label="From Location *">{inp('from_loc','text','')}</Field>
              <Field label="To Location *">{inp('to_loc','text','')}</Field>
              <Field label="Distance (km) *">{inp('distance_km','number','50')}</Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 130px', gap: 10 }}>
              <Field label="Material Type *">
                {selEl('material', MATERIALS.map(m => <option key={m} value={m}>{m}</option>))}
              </Field>
              <Field label="Pcs / Boxes">{inp('pcs_boxes','number','0')}</Field>
              <Field label="Est. Load Wt. (kg)">{inp('weight_kg','number','optional')}</Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 90px', gap: 10 }}>
              <Field label="Vehicle *">
                <select required value={form.vehicle_id} onChange={set('vehicle_id')}
                  style={INP} onFocus={focus} onBlur={blur}>
                  <option value="">— Select vehicle —</option>
                  {vehicles.filter(v => v.status_now === 'AVAILABLE').map(v => (
                    <option key={v.id} value={v.id}>{v.reg_no} — {v.make_model}</option>
                  ))}
                </select>
              </Field>
              <Field label="Trip Type">
                {selEl('trip_type',
                  (['INTRACITY','INTERCITY'] as TripType[]).map(t => (
                    <option key={t} value={t}>{t.charAt(0)+t.slice(1).toLowerCase()}</option>
                  ))
                )}
              </Field>
              <Field label="Margin %">{inp('margin_pct','number','20')}</Field>
            </div>

            {/* ── Driver Details ── */}
            <SectionDivider>Driver Details</SectionDivider>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <Field label="Driver Name">{inp('driver_name','text','Full name')}</Field>
              <Field label="Driver Contact No.">{inp('driver_phone','tel','10-digit number')}</Field>
              <Field label="Driver License No.">{inp('driver_license','text','DL-XXXXXXXXXXXXXX')}</Field>
            </div>

            <Field label="Notes">
              <textarea value={form.notes} onChange={set('notes')} rows={2}
                placeholder="Internal notes for dispatch team…"
                style={{ ...INP, resize: 'none' }}
                onFocus={focus} onBlur={blur} />
            </Field>

            {err     && <div style={{ background: '#fff0f0', border: '1px solid #ffd0d0', borderRadius: 7, padding: '9px 14px', color: '#c00', fontSize: '0.8rem' }}>{err}</div>}
            {success && <div style={{ background: '#f0fff4', border: '1px solid #b2dfbd', borderRadius: 7, padding: '9px 14px', color: '#1a6e35', fontSize: '0.8rem', fontWeight: 600 }}>Booking created successfully!</div>}

            <button type="submit" disabled={saving}
              style={{ width: '100%', padding: 11, background: saving ? '#e0a060' : '#e07a20',
                color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700,
                fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer', marginTop: 4 }}>
              {saving ? 'Creating…' : 'Create Booking'}
            </button>
          </form>
        </div>

        {/* ═══ LIVE QUOTE PREVIEW (cream card) ════════════════════════════ */}
        <div style={{ background: '#faf7f4', border: '1px solid #ddd8d0', borderRadius: 10,
          padding: '20px 22px', position: 'sticky', top: 16 }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111', margin: '0 0 14px' }}>
            Live Quote Preview
          </h3>

          {!form.vehicle_id || !form.distance_km ? (
            <p style={{ color: '#aaa', fontSize: '0.82rem' }}>Fill in vehicle and distance to see the rate.</p>
          ) : quoteLoading ? (
            <p style={{ color: '#aaa', fontSize: '0.82rem' }}>Calculating…</p>
          ) : quoteErr ? (
            <p style={{ color: '#c45c28', fontSize: '0.78rem' }}>{quoteErr}</p>
          ) : breakdown ? (
            <div>
              {/* Big teal cards */}
              <div style={{ background: '#e6f4f1', border: '1px solid #b2ddd6', borderRadius: 8, padding: '12px 16px', marginBottom: 8 }}>
                <div style={{ fontSize: '0.66rem', color: '#4a9e92', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
                  Suggested Fixed Rate (margin incl.)
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1a6e60' }}>
                  {rs(breakdown.total)}
                </div>
              </div>
              <div style={{ background: '#e6f4f1', border: '1px solid #b2ddd6', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
                <div style={{ fontSize: '0.66rem', color: '#4a9e92', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
                  Suggested Rate per Km
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a6e60' }}>
                  {rs(breakdown.rs_per_km)}/km
                </div>
              </div>

              {/* Detail rows */}
              {selectedVehicle && (
                <>
                  {[
                    ['Payload',          `${selectedVehicle.payload_kg.toLocaleString('en-IN')} kg`],
                    selectedVehicle.length_ft
                      ? ['Dimensions', `${selectedVehicle.length_ft} x ${selectedVehicle.width_ft} x ${selectedVehicle.height_ft} ft`]
                      : null,
                    ['Total Cost / km',    rs(breakdown.rs_per_km)],
                    ['Breakeven (Route)',  rs(breakdown.subtotal)],
                  ].filter(Boolean).map(row => {
                    const [label, val] = row as [string, string]
                    return (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #ede8e0', fontSize: '0.82rem' }}>
                        <span style={{ color: '#666' }}>{label}</span>
                        <span style={{ color: '#111', fontWeight: 600 }}>{val}</span>
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          ) : null}
        </div>

      </div>
    </div>
  )
}
