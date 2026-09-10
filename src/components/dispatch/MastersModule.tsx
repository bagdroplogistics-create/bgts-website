'use client'
import { useState } from 'react'
import { useBgtsDb, uid, todayISO, fmtDate, daysTo } from '@/lib/useBgtsDb'
import type { BgtsClient, BgtsVehicle, BgtsDriver, BgtsVendor, BgtsRoute, BgtsBranch } from '@/lib/useBgtsDb'

const C = {
  navy: '#0a1f38', amber: '#e8a33d', green: '#1e8a5f', red: '#c14343',
  slate50: '#f6f8fa', slate100: '#eef1f5', slate300: '#c7d0dc', slate500: '#6b7a8f', slate700: '#33455c',
  border: '1px solid #eef1f5',
}

const cardStyle: React.CSSProperties = {
  background: '#fff', border: C.border, borderRadius: 10, padding: '18px 20px',
  marginBottom: 18, boxShadow: '0 1px 3px rgba(15,43,77,.05)',
}
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }
const th: React.CSSProperties = { background: C.navy, color: '#fff', textAlign: 'left', padding: '8px 10px', fontSize: 11, letterSpacing: '.4px', textTransform: 'uppercase', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '8px 10px', borderBottom: C.border, verticalAlign: 'top' }
const btnSm = (color = C.navy): React.CSSProperties => ({ display: 'inline-flex', alignItems: 'center', gap: 4, background: color, color: '#fff', border: 'none', borderRadius: 5, padding: '4px 9px', fontSize: 11, fontWeight: 600, cursor: 'pointer' })
const btnGhost: React.CSSProperties = { ...btnSm(), background: 'transparent', color: C.navy, border: `1px solid ${C.slate300}` }
const inputStyle: React.CSSProperties = { width: '100%', padding: '7px 10px', border: `1px solid ${C.slate300}`, borderRadius: 6, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: C.slate500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.3px' }
const hintStyle: React.CSSProperties = { fontSize: 11, color: C.slate500, marginTop: 3 }

type Tab = 'clients' | 'vehicles' | 'drivers' | 'vendors' | 'routes' | 'branches'

// ── Generic inline form ──────────────────────────────────────────────────────

interface Field { key: string; label: string; type?: string; required?: boolean; options?: { v: string; l: string }[]; hint?: string; value?: string | number | boolean; full?: boolean }

function InlineForm({ title, fields, onSave, onCancel }: { title: string; fields: Field[]; onSave: (vals: Record<string, string>) => void; onCancel: () => void }) {
  const [vals, setVals] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    fields.forEach(f => { init[f.key] = f.value != null ? String(f.value) : '' })
    return init
  })
  return (
    <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 10, padding: '18px 20px', marginBottom: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 14 }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {fields.map(f => (
          <div key={f.key} style={f.full ? { gridColumn: '1 / -1' } : {}}>
            <label style={labelStyle}>{f.label}{f.required ? ' *' : ''}</label>
            {f.type === 'select' ? (
              <select style={inputStyle} value={vals[f.key] || ''} onChange={e => setVals(v => ({ ...v, [f.key]: e.target.value }))}>
                <option value="">— select —</option>
                {(f.options || []).map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            ) : (
              <input style={inputStyle} type={f.type || 'text'} value={vals[f.key] || ''} onChange={e => setVals(v => ({ ...v, [f.key]: e.target.value }))} />
            )}
            {f.hint && <div style={hintStyle}>{f.hint}</div>}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
        <button style={btnGhost} onClick={onCancel}>Cancel</button>
        <button style={{ ...btnSm(C.amber), color: C.navy }} onClick={() => {
          for (const f of fields) { if (f.required && !vals[f.key]?.trim()) { alert(f.label + ' is required.'); return } }
          onSave(vals)
        }}>Save</button>
      </div>
    </div>
  )
}

// ── Clients ───────────────────────────────────────────────────────────────────

function ClientsTab() {
  const { db, save } = useBgtsDb()
  const [form, setForm] = useState<null | Partial<BgtsClient>>(null)
  const clientFields = (c?: Partial<BgtsClient>): Field[] => [
    { key: 'name', label: 'Client Name', required: true, value: c?.name },
    { key: 'gstin', label: 'GSTIN', value: c?.gstin },
    { key: 'phone', label: 'WhatsApp Phone (with 91)', value: c?.phone, hint: 'e.g. 919825012345' },
    { key: 'email', label: 'Email', type: 'email', value: c?.email },
    { key: 'creditDays', label: 'Credit Period (days)', type: 'number', value: c?.creditDays ?? 30 },
    { key: 'addr', label: 'Address / City', value: c?.addr },
  ]
  const handleSave = (vals: Record<string, string>, id?: string) => {
    const d = { ...db }
    if (id) {
      const idx = d.clients.findIndex(x => x.id === id)
      if (idx >= 0) d.clients[idx] = { ...d.clients[idx], ...vals, creditDays: Number(vals.creditDays) || 30 }
    } else {
      d.clients.push({ id: uid('c'), name: vals.name, gstin: vals.gstin || '', phone: vals.phone || '', email: vals.email || '', creditDays: Number(vals.creditDays) || 30, addr: vals.addr || '' })
    }
    save(d); setForm(null)
  }
  const del = (id: string) => {
    if (!confirm('Delete client?')) return
    const d = { ...db }; d.clients = d.clients.filter(x => x.id !== id); save(d)
  }
  return (
    <div>
      {form !== null && (
        <InlineForm title={form.id ? 'Edit Client' : 'Add Client'} fields={clientFields(form)} onSave={v => handleSave(v, form.id)} onCancel={() => setForm(null)} />
      )}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: C.navy, flex: 1 }}>Client Master</span>
          <button style={{ ...btnSm(C.amber), color: C.navy, padding: '7px 14px', fontSize: 12.5 }} onClick={() => setForm({})}>+ Add Client</button>
        </div>
        {!db.clients.length ? <div style={{ padding: 26, textAlign: 'center', color: C.slate500 }}>No clients yet.</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tbl}>
              <thead><tr><th style={th}>Name</th><th style={th}>GSTIN</th><th style={th}>Phone</th><th style={th}>Email</th><th style={th}>Credit Days</th><th style={th}></th></tr></thead>
              <tbody>
                {db.clients.map(c => (
                  <tr key={c.id}>
                    <td style={td}><b>{c.name}</b><br /><span style={{ fontSize: 10, color: C.slate500 }}>{c.addr || ''}</span></td>
                    <td style={td}>{c.gstin || '—'}</td>
                    <td style={td}>{c.phone || '—'}</td>
                    <td style={td}>{c.email || '—'}</td>
                    <td style={td}>{c.creditDays || '—'}</td>
                    <td style={td}>
                      <button style={btnGhost} onClick={() => setForm(c)}>Edit</button>{' '}
                      <button style={btnSm(C.red)} onClick={() => del(c.id)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Vehicles ──────────────────────────────────────────────────────────────────

function VehiclesTab() {
  const { db, save } = useBgtsDb()
  const [form, setForm] = useState<null | Partial<BgtsVehicle>>(null)
  const fields = (v?: Partial<BgtsVehicle>): Field[] => [
    { key: 'regNo', label: 'Registration No.', required: true, value: v?.regNo },
    { key: 'make', label: 'Make / Model', value: v?.make },
    { key: 'type', label: 'Body / Type', value: v?.type, hint: 'e.g. Open Body 18ft' },
    { key: 'owned', label: 'Ownership', type: 'select', required: true, value: v?.owned === false ? 'no' : 'yes', options: [{ v: 'yes', l: 'Owned by BGTS' }, { v: 'no', l: 'Empanelled / Market' }] },
    { key: 'gvw', label: 'GVW (kg)', value: v?.gvw },
    { key: 'driverId', label: 'Default Driver', type: 'select', value: v?.driverId || '', options: db.drivers.map(d => ({ v: d.id, l: d.name })) },
  ]
  const handleSave = (vals: Record<string, string>, id?: string) => {
    const d = { ...db }
    if (id) {
      const idx = d.vehicles.findIndex(x => x.id === id)
      if (idx >= 0) d.vehicles[idx] = { ...d.vehicles[idx], ...vals, owned: vals.owned === 'yes' }
    } else {
      d.vehicles.push({ id: uid('v'), regNo: vals.regNo, make: vals.make || '', type: vals.type || '', owned: vals.owned === 'yes', gvw: vals.gvw || '', driverId: vals.driverId || '' })
    }
    save(d); setForm(null)
  }
  const del = (id: string) => {
    if (!confirm('Delete vehicle?')) return
    const d = { ...db }; d.vehicles = d.vehicles.filter(x => x.id !== id); save(d)
  }
  const driverName = (id: string) => db.drivers.find(d => d.id === id)?.name || '—'
  return (
    <div>
      {form !== null && <InlineForm title={form.id ? 'Edit Vehicle' : 'Add Vehicle'} fields={fields(form)} onSave={v => handleSave(v, form.id)} onCancel={() => setForm(null)} />}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: C.navy, flex: 1 }}>Vehicle Master</span>
          <button style={{ ...btnSm(C.amber), color: C.navy, padding: '7px 14px', fontSize: 12.5 }} onClick={() => setForm({})}>+ Add Vehicle</button>
        </div>
        {!db.vehicles.length ? <div style={{ padding: 26, textAlign: 'center', color: C.slate500 }}>No vehicles yet.</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tbl}>
              <thead><tr><th style={th}>Reg No</th><th style={th}>Make / Model</th><th style={th}>Type</th><th style={th}>Ownership</th><th style={th}>GVW (kg)</th><th style={th}>Driver</th><th style={th}></th></tr></thead>
              <tbody>
                {db.vehicles.map(v => (
                  <tr key={v.id}>
                    <td style={td}><b>{v.regNo}</b></td>
                    <td style={td}>{v.make || '—'}</td>
                    <td style={td}>{v.type || '—'}</td>
                    <td style={td}><span style={{ background: v.owned ? '#e8edf7' : '#f3eefb', color: v.owned ? '#1d4d84' : '#7a5ea8', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4 }}>{v.owned ? 'OWNED' : 'EMPANELLED'}</span></td>
                    <td style={td}>{v.gvw || '—'}</td>
                    <td style={td}>{driverName(v.driverId)}</td>
                    <td style={td}>
                      <button style={btnGhost} onClick={() => setForm(v)}>Edit</button>{' '}
                      <button style={btnSm(C.red)} onClick={() => del(v.id)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Drivers ───────────────────────────────────────────────────────────────────

function DriversTab() {
  const { db, save } = useBgtsDb()
  const [form, setForm] = useState<null | Partial<BgtsDriver>>(null)
  const fields = (d?: Partial<BgtsDriver>): Field[] => [
    { key: 'name', label: 'Driver Name', required: true, value: d?.name },
    { key: 'phone', label: 'Phone (with 91)', value: d?.phone },
    { key: 'licNo', label: 'Licence No.', value: d?.licNo },
    { key: 'licExpiry', label: 'Licence Expiry', type: 'date', value: d?.licExpiry },
  ]
  const handleSave = (vals: Record<string, string>, id?: string) => {
    const d2 = { ...db }
    if (id) {
      const idx = d2.drivers.findIndex(x => x.id === id)
      if (idx >= 0) d2.drivers[idx] = { ...d2.drivers[idx], ...vals }
    } else {
      d2.drivers.push({ id: uid('d'), name: vals.name, phone: vals.phone || '', licNo: vals.licNo || '', licExpiry: vals.licExpiry || '' })
    }
    save(d2); setForm(null)
  }
  const del = (id: string) => {
    if (!confirm('Delete driver?')) return
    const d2 = { ...db }; d2.drivers = d2.drivers.filter(x => x.id !== id); save(d2)
  }
  return (
    <div>
      {form !== null && <InlineForm title={form.id ? 'Edit Driver' : 'Add Driver'} fields={fields(form)} onSave={v => handleSave(v, form.id)} onCancel={() => setForm(null)} />}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: C.navy, flex: 1 }}>Driver Master</span>
          <button style={{ ...btnSm(C.amber), color: C.navy, padding: '7px 14px', fontSize: 12.5 }} onClick={() => setForm({})}>+ Add Driver</button>
        </div>
        {!db.drivers.length ? <div style={{ padding: 26, textAlign: 'center', color: C.slate500 }}>No drivers yet.</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tbl}>
              <thead><tr><th style={th}>Name</th><th style={th}>Phone</th><th style={th}>Licence No</th><th style={th}>Licence Expiry</th><th style={th}></th></tr></thead>
              <tbody>
                {db.drivers.map(d => {
                  const dl = daysTo(d.licExpiry)
                  return (
                    <tr key={d.id}>
                      <td style={td}><b>{d.name}</b></td>
                      <td style={td}>{d.phone || '—'}</td>
                      <td style={td}>{d.licNo || '—'}</td>
                      <td style={td}>{fmtDate(d.licExpiry)}{dl != null && dl <= 30 && <span style={{ marginLeft: 6, background: '#fbe9e9', color: C.red, fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>{dl < 0 ? 'EXPIRED' : `${dl}d`}</span>}</td>
                      <td style={td}>
                        <button style={btnGhost} onClick={() => setForm(d)}>Edit</button>{' '}
                        <button style={btnSm(C.red)} onClick={() => del(d.id)}>✕</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Vendors ───────────────────────────────────────────────────────────────────

function VendorsTab() {
  const { db, save } = useBgtsDb()
  const [form, setForm] = useState<null | Partial<BgtsVendor>>(null)
  const fields = (v?: Partial<BgtsVendor>): Field[] => [
    { key: 'name', label: 'Vendor Name', required: true, value: v?.name },
    { key: 'phone', label: 'Phone', value: v?.phone },
    { key: 'city', label: 'City', value: v?.city },
    { key: 'rating', label: 'Rating', type: 'select', value: v?.rating || 'B', options: [{ v: 'A', l: 'A' }, { v: 'B', l: 'B' }, { v: 'C', l: 'C' }] },
  ]
  const handleSave = (vals: Record<string, string>, id?: string) => {
    const d = { ...db }
    if (id) {
      const idx = d.vendors.findIndex(x => x.id === id)
      if (idx >= 0) d.vendors[idx] = { ...d.vendors[idx], ...vals }
    } else {
      d.vendors.push({ id: uid('ve'), name: vals.name, phone: vals.phone || '', city: vals.city || '', rating: vals.rating || 'B' })
    }
    save(d); setForm(null)
  }
  const del = (id: string) => {
    if (!confirm('Delete vendor?')) return
    const d = { ...db }; d.vendors = d.vendors.filter(x => x.id !== id); save(d)
  }
  return (
    <div>
      {form !== null && <InlineForm title={form.id ? 'Edit Vendor' : 'Add Vendor'} fields={fields(form)} onSave={v => handleSave(v, form.id)} onCancel={() => setForm(null)} />}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: C.navy, flex: 1 }}>Vendor Master (Hired Vehicle Suppliers)</span>
          <button style={{ ...btnSm(C.amber), color: C.navy, padding: '7px 14px', fontSize: 12.5 }} onClick={() => setForm({})}>+ Add Vendor</button>
        </div>
        {!db.vendors.length ? <div style={{ padding: 26, textAlign: 'center', color: C.slate500 }}>No vendors yet.</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tbl}>
              <thead><tr><th style={th}>Name</th><th style={th}>Phone</th><th style={th}>City</th><th style={th}>Rating</th><th style={th}></th></tr></thead>
              <tbody>
                {db.vendors.map(v => (
                  <tr key={v.id}>
                    <td style={td}><b>{v.name}</b></td>
                    <td style={td}>{v.phone || '—'}</td>
                    <td style={td}>{v.city || '—'}</td>
                    <td style={td}>{v.rating || '—'}</td>
                    <td style={td}>
                      <button style={btnGhost} onClick={() => setForm(v)}>Edit</button>{' '}
                      <button style={btnSm(C.red)} onClick={() => del(v.id)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Routes ────────────────────────────────────────────────────────────────────

function RoutesTab() {
  const { db, save } = useBgtsDb()
  const [form, setForm] = useState(false)
  const handleSave = (vals: Record<string, string>) => {
    const d = { ...db }
    d.routes.push({ id: uid('r'), origin: vals.origin, destination: vals.destination, km: vals.km || '' })
    save(d); setForm(false)
  }
  const del = (id: string) => {
    if (!confirm('Delete route?')) return
    const d = { ...db }; d.routes = d.routes.filter(x => x.id !== id); save(d)
  }
  return (
    <div>
      {form && <InlineForm title="Add Route" fields={[{ key: 'origin', label: 'Origin', required: true }, { key: 'destination', label: 'Destination', required: true }, { key: 'km', label: 'Distance (km)', type: 'number' }]} onSave={handleSave} onCancel={() => setForm(false)} />}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: C.navy, flex: 1 }}>Route Master</span>
          <button style={{ ...btnSm(C.amber), color: C.navy, padding: '7px 14px', fontSize: 12.5 }} onClick={() => setForm(true)}>+ Add Route</button>
        </div>
        {!db.routes.length ? <div style={{ padding: 26, textAlign: 'center', color: C.slate500 }}>No routes yet.</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tbl}>
              <thead><tr><th style={th}>Origin</th><th style={th}>Destination</th><th style={th}>Distance (km)</th><th style={th}></th></tr></thead>
              <tbody>
                {db.routes.map(r => (
                  <tr key={r.id}>
                    <td style={td}>{r.origin}</td>
                    <td style={td}>{r.destination}</td>
                    <td style={td}>{r.km || '—'}</td>
                    <td style={td}><button style={btnSm(C.red)} onClick={() => del(r.id)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Branches ──────────────────────────────────────────────────────────────────

function BranchesTab() {
  const { db, save } = useBgtsDb()
  const [form, setForm] = useState<null | Partial<BgtsBranch>>(null)
  const fields = (b?: Partial<BgtsBranch>): Field[] => [
    { key: 'name', label: 'Branch Name', required: true, value: b?.name, hint: 'e.g. VADODARA, SURAT' },
    { key: 'entityName', label: 'Entity / Legal Name (optional)', value: b?.entityName, hint: 'Blank = print main company name' },
    { key: 'gstin', label: 'GSTIN (optional)', value: b?.gstin },
    { key: 'addr', label: 'Address', value: b?.addr },
    { key: 'lrPrefix', label: 'LR Prefix (optional)', value: b?.lrPrefix, hint: 'e.g. BDTS/26-27/' },
    { key: 'phone', label: 'Phone', value: b?.phone },
  ]
  const handleSave = (vals: Record<string, string>, id?: string) => {
    const d = { ...db }
    if (id) {
      const idx = d.branches.findIndex(x => x.id === id)
      if (idx >= 0) d.branches[idx] = { ...d.branches[idx], ...vals, name: vals.name.toUpperCase() }
    } else {
      d.branches.push({ id: uid('br'), name: vals.name.toUpperCase(), entityName: vals.entityName || '', gstin: vals.gstin || '', addr: vals.addr || '', lrPrefix: vals.lrPrefix || '', phone: vals.phone || '' })
    }
    save(d); setForm(null)
  }
  const del = (id: string) => {
    const used = db.lrs.some(l => l.branchId === id) || db.bookings.some(b => b.branchId === id)
    if (used) { alert('This branch has LRs/bookings — reassign them first.'); return }
    if (!confirm('Delete this branch?')) return
    const d = { ...db }; d.branches = d.branches.filter(x => x.id !== id); save(d)
  }
  return (
    <div>
      {form !== null && <InlineForm title={form.id ? 'Edit ' + form.name : 'Add Branch / Entity'} fields={fields(form)} onSave={v => handleSave(v, form.id)} onCancel={() => setForm(null)} />}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: C.navy, flex: 1 }}>Branches / Entities</span>
          <button style={{ ...btnSm(C.amber), color: C.navy, padding: '7px 14px', fontSize: 12.5 }} onClick={() => setForm({})}>+ Add Branch / Entity</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={tbl}>
            <thead><tr><th style={th}>Branch</th><th style={th}>Entity (prints on LR)</th><th style={th}>GSTIN</th><th style={th}>LR Prefix</th><th style={th}></th></tr></thead>
            <tbody>
              {db.branches.map((b, i) => (
                <tr key={b.id}>
                  <td style={td}><b>{b.name}</b>{i === 0 && <span style={{ marginLeft: 6, background: '#e8edf7', color: '#1d4d84', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>MAIN</span>}</td>
                  <td style={td}>{b.entityName || '(company default)'}<br /><span style={{ fontSize: 10, color: C.slate500 }}>{b.addr || ''}</span></td>
                  <td style={td}>{b.gstin || '—'}</td>
                  <td style={td}>{b.lrPrefix || '(default)'}</td>
                  <td style={td}>
                    <button style={btnGhost} onClick={() => setForm(b)}>Edit</button>
                    {i > 0 && <>{' '}<button style={btnSm(C.red)} onClick={() => del(b.id)}>✕</button></>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ ...hintStyle, marginTop: 8 }}>A branch with its own Entity Name + GSTIN prints those on its LRs. Use for sister entities (multi-entity). Blank fields fall back to the main company profile.</div>
      </div>
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────

export function MastersModule() {
  const [tab, setTab] = useState<Tab>('clients')
  const tabs: { id: Tab; label: string }[] = [
    { id: 'clients', label: 'Clients' },
    { id: 'vehicles', label: 'Vehicles' },
    { id: 'drivers', label: 'Drivers' },
    { id: 'vendors', label: 'Vendors' },
    { id: 'routes', label: 'Routes' },
    { id: 'branches', label: 'Branches / Entities' },
  ]
  return (
    <div style={{ padding: '20px 28px' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? C.navy : '#fff',
            border: `1px solid ${tab === t.id ? C.navy : C.slate300}`,
            color: tab === t.id ? '#fff' : C.slate700,
            padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>{t.label}</button>
        ))}
      </div>
      {tab === 'clients' && <ClientsTab />}
      {tab === 'vehicles' && <VehiclesTab />}
      {tab === 'drivers' && <DriversTab />}
      {tab === 'vendors' && <VendorsTab />}
      {tab === 'routes' && <RoutesTab />}
      {tab === 'branches' && <BranchesTab />}
    </div>
  )
}
