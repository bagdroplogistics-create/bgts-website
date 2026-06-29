'use client'
import { useState } from 'react'
import type { Vehicle, VehicleClass, VehicleOwnership, VehicleStatus } from '@/types/dispatch'

const STATUS_COLORS: Record<VehicleStatus, React.CSSProperties> = {
  AVAILABLE      : { background: '#d8f5e2', color: '#1a6e35' },
  ON_TRIP        : { background: '#fff7d6', color: '#8a6400' },
  IDLE           : { background: '#f0f0f0', color: '#666' },
  MAINTENANCE    : { background: '#ffe0e0', color: '#b30000' },
  COMPLIANCE_HOLD: { background: '#ffe0e0', color: '#b30000' },
  CHECK_RENEWAL  : { background: '#fff0dc', color: '#a05000' },
  ON_DEMAND      : { background: '#e8f0ff', color: '#2050a0' },
}
const STATUS_LABEL: Record<VehicleStatus, string> = {
  AVAILABLE      : 'Available',
  ON_TRIP        : 'On Trip',
  IDLE           : 'Idle',
  MAINTENANCE    : 'Under Maintenance',
  COMPLIANCE_HOLD: 'Compliance Hold',
  CHECK_RENEWAL  : 'Check Renewal',
  ON_DEMAND      : 'On Demand',
}
const OWNERSHIP_LABEL: Record<VehicleOwnership, string> = {
  OWNED         : 'Owned',
  MARKET_NETWORK: 'Market Network',
}

const CLASSES   : VehicleClass[]      = ['MGV','LGV','HCV','MARKET','TRAILER','TANKER','OTHER']
const OWNERSHIPS: VehicleOwnership[]  = ['OWNED','MARKET_NETWORK']
const STATUSES  : VehicleStatus[]     = ['AVAILABLE','ON_TRIP','IDLE','MAINTENANCE','COMPLIANCE_HOLD','CHECK_RENEWAL','ON_DEMAND']

interface VForm {
  reg_no: string; class: VehicleClass; make_model: string
  ownership: VehicleOwnership; status_now: VehicleStatus
  payload_kg: string; length_ft: string; width_ft: string; height_ft: string
}
const EMPTY_FORM: VForm = {
  reg_no: '', class: 'MGV', make_model: '', ownership: 'OWNED',
  status_now: 'AVAILABLE', payload_kg: '', length_ft: '', width_ft: '', height_ft: '',
}

function vehicleToForm(v: Vehicle): VForm {
  return {
    reg_no    : v.reg_no,
    class     : v.class,
    make_model: v.make_model,
    ownership : v.ownership,
    status_now: v.status_now,
    payload_kg: String(v.payload_kg ?? ''),
    length_ft : v.length_ft != null ? String(v.length_ft) : '',
    width_ft  : v.width_ft  != null ? String(v.width_ft)  : '',
    height_ft : v.height_ft != null ? String(v.height_ft) : '',
  }
}

interface Props {
  vehicles      : Vehicle[]
  onAdd         : (data: Record<string, unknown>) => Promise<Vehicle>
  onUpdate      : (id: string, data: Record<string, unknown>) => Promise<Vehicle>
  onStatusChange: (id: string, status: VehicleStatus) => Promise<void>
  loading       : boolean
}

const INP: React.CSSProperties = {
  width: '100%', border: '1px solid #d5cfc7', borderRadius: 7,
  padding: '7px 10px', fontSize: '0.83rem', background: '#fdf9f5',
  outline: 'none', boxSizing: 'border-box',
}
const SEL: React.CSSProperties = { ...INP, cursor: 'pointer' }
const LBL: React.CSSProperties = { display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }

export function VehicleMaster({ vehicles, onAdd, onUpdate, onStatusChange, loading }: Props) {
  const [mode,       setMode]       = useState<'add' | 'edit' | null>(null)
  const [editTarget, setEditTarget] = useState<Vehicle | null>(null)
  const [form,       setForm]       = useState<VForm>(EMPTY_FORM)
  const [saving,     setSaving]     = useState(false)
  const [err,        setErr]        = useState<string | null>(null)

  const set = (k: keyof VForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }))

  const openAdd = () => { setForm(EMPTY_FORM); setEditTarget(null); setErr(null); setMode('add') }
  const openEdit = (v: Vehicle) => { setForm(vehicleToForm(v)); setEditTarget(v); setErr(null); setMode('edit') }
  const closeModal = () => { setMode(null); setEditTarget(null); setErr(null) }

  const handleDelete = async (v: Vehicle) => {
    if (!confirm(`Delete ${v.reg_no}? This cannot be undone.`)) return
    try {
      const res  = await fetch(`/api/dispatch/vehicles/${v.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      // Refresh page to re-fetch vehicles list
      window.location.reload()
    } catch (ex) {
      alert(ex instanceof Error ? ex.message : 'Delete failed')
    }
  }

  const toPayload = (f: VForm) => ({
    reg_no    : f.reg_no,
    class     : f.class,
    make_model: f.make_model,
    ownership : f.ownership,
    status_now: f.status_now,
    payload_kg: Number(f.payload_kg),
    length_ft : f.length_ft ? Number(f.length_ft) : null,
    width_ft  : f.width_ft  ? Number(f.width_ft)  : null,
    height_ft : f.height_ft ? Number(f.height_ft) : null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr(null)
    try {
      if (mode === 'edit' && editTarget) {
        await onUpdate(editTarget.id, toPayload(form))
      } else {
        await onAdd(toPayload(form))
      }
      closeModal()
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Failed to save')
    } finally { setSaving(false) }
  }

  const TH: React.CSSProperties = { padding: '8px 12px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.07em', color: '#777', textAlign: 'left', borderBottom: '1px solid #e0dbd3', whiteSpace: 'nowrap', background: '#F3EFE8' }
  const TD: React.CSSProperties = { padding: '9px 12px', fontSize: '0.82rem', color: '#333', borderBottom: '1px solid #f0ece6' }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ background: '#fff', border: '1px solid #ddd8d0', borderRadius: 10, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #e0dbd3', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a1a' }}>Vehicle Master</div>
            <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 3 }}>
              Current operational status. Future bookings live on the Schedule tab — a vehicle can be
              &ldquo;Available&rdquo; here and still be booked for a future date.
            </div>
          </div>
          <button onClick={openAdd}
            style={{ padding: '8px 16px', background: '#e07a20', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            + Add Vehicle
          </button>
        </div>

        {loading ? (
          <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>Loading fleet…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['REG NO.','CLASS','MAKE / MODEL','OWNERSHIP','PAYLOAD (KG)','L (ft)','W (ft)','H (ft)','STATUS NOW',''].map(h => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vehicles.length === 0 ? (
                  <tr><td colSpan={10} style={{ ...TD, textAlign: 'center', color: '#aaa', padding: 40 }}>No vehicles. Click + Add Vehicle.</td></tr>
                ) : vehicles.map(v => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #f0ece6' }}>
                    <td style={{ ...TD, fontFamily: 'monospace', fontWeight: 700, color: '#111', whiteSpace: 'nowrap' }}>{v.reg_no}</td>
                    <td style={{ ...TD, color: '#555' }}>{v.class}</td>
                    <td style={TD}>{v.make_model}</td>
                    <td style={TD}>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 5, fontSize: '0.72rem', fontWeight: 600,
                        background: v.ownership === 'OWNED' ? '#e0edff' : '#f0f0f0',
                        color     : v.ownership === 'OWNED' ? '#1e5fa8' : '#555' }}>
                        {OWNERSHIP_LABEL[v.ownership]}
                      </span>
                    </td>
                    <td style={TD}>{v.payload_kg?.toLocaleString('en-IN')}</td>
                    <td style={{ ...TD, color: '#999' }}>{v.length_ft ?? '—'}</td>
                    <td style={{ ...TD, color: '#999' }}>{v.width_ft  ?? '—'}</td>
                    <td style={{ ...TD, color: '#999' }}>{v.height_ft ?? '—'}</td>
                    <td style={TD}>
                      <select value={v.status_now}
                        onChange={e => onStatusChange(v.id, e.target.value as VehicleStatus)}
                        style={{ fontSize: '0.75rem', border: '1px solid #ddd', borderRadius: 6,
                          padding: '3px 6px', cursor: 'pointer',
                          ...(STATUS_COLORS[v.status_now] ?? {}) }}>
                        {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                      </select>
                    </td>
                    <td style={{ ...TD, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(v)} title="Edit vehicle"
                          style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #d5cfc7', borderRadius: 6, background: '#faf7f4', color: '#555', cursor: 'pointer', fontSize: '0.9rem' }}>
                          ✏️
                        </button>
                        <button onClick={() => handleDelete(v)} title="Delete vehicle"
                          style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f5c0b0', borderRadius: 6, background: '#fff5f2', color: '#c45c28', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {mode && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', width: '100%', maxWidth: 520 }}>

            {/* Modal header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#111', margin: 0 }}>
                {mode === 'edit' ? `Edit — ${editTarget?.reg_no}` : 'Add Vehicle'}
              </h3>
              <button onClick={closeModal} style={{ color: '#aaa', fontSize: '1.2rem', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Row 1: Reg No + Class */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={LBL}>Reg No. *</label>
                  <input required value={form.reg_no} onChange={set('reg_no')}
                    placeholder="GJ06BX0000" style={{ ...INP, textTransform: 'uppercase' }} />
                </div>
                <div>
                  <label style={LBL}>Class *</label>
                  <select value={form.class} onChange={set('class')} style={SEL}>
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 2: Make / Model */}
              <div>
                <label style={LBL}>Make / Model *</label>
                <input required value={form.make_model} onChange={set('make_model')}
                  placeholder="Tata 407 / Ashok Leyland 2518…" style={INP} />
              </div>

              {/* Row 3: Ownership + Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={LBL}>Ownership *</label>
                  <select value={form.ownership} onChange={set('ownership')} style={SEL}>
                    {OWNERSHIPS.map(o => <option key={o} value={o}>{OWNERSHIP_LABEL[o]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={LBL}>Status</label>
                  <select value={form.status_now} onChange={set('status_now')} style={SEL}>
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 4: Payload */}
              <div>
                <label style={LBL}>Payload (kg) *</label>
                <input required type="number" value={form.payload_kg} onChange={set('payload_kg')}
                  placeholder="5000" style={INP} />
              </div>

              {/* Row 5: Dimensions */}
              <div>
                <label style={LBL}>Dimensions (ft) — optional</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div>
                    <input type="number" step="0.1" value={form.length_ft} onChange={set('length_ft')}
                      placeholder="Length" style={INP} />
                  </div>
                  <div>
                    <input type="number" step="0.1" value={form.width_ft} onChange={set('width_ft')}
                      placeholder="Width" style={INP} />
                  </div>
                  <div>
                    <input type="number" step="0.1" value={form.height_ft} onChange={set('height_ft')}
                      placeholder="Height" style={INP} />
                  </div>
                </div>
              </div>

              {err && (
                <div style={{ background: '#fff0f0', border: '1px solid #ffd0d0', borderRadius: 8,
                  padding: '10px 14px', color: '#c00', fontSize: '0.82rem' }}>{err}</div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={closeModal}
                  style={{ flex: 1, padding: 10, borderRadius: 10, background: '#f5f0eb', color: '#555', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ flex: 2, padding: 10, borderRadius: 10, background: saving ? '#e0a060' : '#e07a20', color: '#fff', border: 'none', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}>
                  {saving ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
