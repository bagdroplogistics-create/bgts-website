'use client'
import { useState, useEffect } from 'react'
import { useRates } from '@/hooks/useRates'
import type { FixedCost, VariableCost } from '@/types/dispatch'

// ── shared style tokens ────────────────────────────────────────────────────
const CARD: React.CSSProperties  = {
  background: '#ffffff', border: '1px solid #ddd8d0',
  borderRadius: 10, padding: '20px 24px', marginBottom: 20,
}
const TH: React.CSSProperties = {
  padding: '8px 12px', fontSize: '0.68rem', fontWeight: 700,
  letterSpacing: '0.08em', textTransform: 'uppercase',
  color: '#777', background: '#F3EFE8',
  borderBottom: '1px solid #e0dbd3', whiteSpace: 'nowrap',
  textAlign: 'left',
}
const TD: React.CSSProperties = {
  padding: '7px 12px', fontSize: '0.82rem',
  borderBottom: '1px solid #f0ebe4', color: '#222',
}
const MONO: React.CSSProperties = { ...TD, fontFamily: 'monospace', fontWeight: 700 }

function NumInput({ value, onChange }: { value: string | number; onChange: (v: string) => void }) {
  return (
    <input type="number" step="0.01" min="0" value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', border: '1px solid #d1ccbf', borderRadius: 5,
        padding: '5px 8px', fontSize: '0.82rem', background: '#fdf9f5',
        outline: 'none', textAlign: 'right', boxSizing: 'border-box',
      }}
      onFocus={e => (e.currentTarget.style.borderColor = '#c45c28')}
      onBlur={e  => (e.currentTarget.style.borderColor = '#d1ccbf')}
    />
  )
}

function AssuInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ background: '#fdf9f5', border: '1px solid #ddd8d0', borderRadius: 7, padding: '10px 14px' }}>
      <div style={{ fontSize: '0.68rem', color: '#999', marginBottom: 6 }}>{label}</div>
      <input type="number" step="0.01" min="0" value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', border: 'none', background: 'transparent',
          fontSize: '0.95rem', fontWeight: 600, color: '#111',
          outline: 'none', padding: 0 }}
      />
    </div>
  )
}

export function RateSettings() {
  const { rates, loading, error, saveRates } = useRates()
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [err,    setErr]    = useState<string | null>(null)

  // Global Assumptions — 7 fields exactly as in HTML
  const [diesel,   setDiesel]   = useState('97.6')  // Diesel ₹/L
  const [kmMonth,  setKmMonth]  = useState('6000')  // Assumed Km/Month
  const [margin,   setMargin]   = useState('20')    // Default Margin %
  const [toll,     setToll]     = useState('2.5')   // Toll ₹/km
  const [batta,    setBatta]    = useState('500')   // Batta ₹/day
  const [laborIn,  setLaborIn]  = useState('600')   // Labor Intracity ₹
  const [laborIc,  setLaborIc]  = useState('900')   // Labor Intercity ₹

  const [fixed,    setFixed]    = useState<Record<string, Partial<FixedCost>>>({})
  const [variable, setVariable] = useState<Record<string, Partial<VariableCost>>>({})

  useEffect(() => {
    if (!rates.settings) return
    setDiesel(String(rates.settings.diesel_rs_l  ?? '97.6'))
    setKmMonth(String(rates.settings.avg_mileage ?? '6000'))
    setToll(String(rates.settings.toll_estimate  ?? '2.5'))
    setBatta(String(rates.settings.driver_bata   ?? '500'))
    setLaborIn(String(rates.settings.loading_charge ?? '600'))
    setLaborIc(String(rates.settings.driver_bata_ic ?? '900'))

    const f: Record<string, Partial<FixedCost>> = {}
    for (const fc of rates.fixed) f[fc.vehicle_id] = { ...fc }
    setFixed(f)

    const v: Record<string, Partial<VariableCost>> = {}
    for (const vc of rates.variable) v[vc.vehicle_id] = { ...vc }
    setVariable(v)
  }, [rates])

  const setF = (vid: string, k: keyof FixedCost, val: string) =>
    setFixed(p => ({ ...p, [vid]: { ...p[vid], vehicle_id: vid, [k]: Number(val) } }))

  const setV = (vid: string, k: keyof VariableCost, val: string) =>
    setVariable(p => ({ ...p, [vid]: { ...p[vid], vehicle_id: vid, [k]: Number(val) } }))

  const totalPerMo = (vid: string) => {
    const f = fixed[vid] ?? {}
    return (
      Number(f.driver_per_mo ?? 0) +
      Number(f.helper_per_mo ?? 0) +
      Number(f.maint_per_mo  ?? 0) +
      Number(f.emi_per_mo    ?? 0) +
      Number(f.other_per_mo  ?? 0) +
      Number(f.insurance_yr  ?? 0) / 12 +
      Number(f.permit_tax_yr ?? 0) / 12
    )
  }

  const fuelPerKm = (vid: string) => {
    const d = Number(diesel)
    const vc = variable[vid] ?? {}
    const mil = Number(vc.mileage_km_per_l ?? 0)
    return mil > 0 ? d / mil : 0
  }

  const handleSave = async () => {
    setSaving(true); setErr(null); setSaved(false)
    try {
      await saveRates({
        settings: {
          diesel_rs_l:    Number(diesel),
          avg_mileage:    Number(kmMonth),
          driver_bata:    Number(batta),
          driver_bata_ic: Number(laborIc),
          loading_charge: Number(laborIn),
          toll_estimate:  Number(toll),
        },
        fixed:    Object.values(fixed)    as Record<string, unknown>[],
        variable: Object.values(variable) as Record<string, unknown>[],
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed')
    } finally { setSaving(false) }
  }

  if (loading) return <div style={{ padding: 24, color: '#aaa' }}>Loading rate settings…</div>
  if (error)   return <div style={{ padding: 24, color: '#c00' }}>{error}</div>

  const vehicles = rates.vehicles

  return (
    <div style={{ padding: 24 }}>

      {/* Save bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        {saved && <span style={{ color: '#1a6e35', fontSize: '0.82rem', fontWeight: 600 }}>Saved</span>}
        {err   && <span style={{ color: '#c00',    fontSize: '0.82rem' }}>{err}</span>}
        <button onClick={handleSave} disabled={saving}
          style={{ padding: '8px 20px', background: saving ? '#e0a060' : '#e07a20',
            color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700,
            fontSize: '0.85rem', cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Saving…' : 'Save All'}
        </button>
      </div>

      {/* ═══ 1. GLOBAL ASSUMPTIONS ═══════════════════════════════════════ */}
      <div style={CARD}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#111', margin: '0 0 10px' }}>
          Global Assumptions
        </h3>

        {/* Orange info note */}
        <div style={{ background: '#fff4e8', border: '1px solid #f0c080', borderRadius: 7,
          padding: '9px 14px', fontSize: '0.78rem', color: '#7a4a10', marginBottom: 18 }}>
          Every quote on this platform flows from these assumptions plus per-vehicle costs below.
          Diesel price is the only one I sourced live — confirm the rest.
        </div>

        {/* Row 1 — 4 fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 12 }}>
          <AssuInput label="Diesel ₹/L"       value={diesel}  onChange={setDiesel}  />
          <AssuInput label="Assumed Km/Month"  value={kmMonth} onChange={setKmMonth} />
          <AssuInput label="Default Margin %"  value={margin}  onChange={setMargin}  />
          <AssuInput label="Toll ₹/km"         value={toll}    onChange={setToll}    />
        </div>
        {/* Row 2 — 3 fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          <AssuInput label="Batta ₹/day"        value={batta}   onChange={setBatta}   />
          <AssuInput label="Labor Intracity ₹"  value={laborIn} onChange={setLaborIn} />
          <AssuInput label="Labor Intercity ₹"  value={laborIc} onChange={setLaborIc} />
          <div /> {/* spacer */}
        </div>
      </div>

      {/* ═══ 2. FIXED COSTS ══════════════════════════════════════════════ */}
      <div style={CARD}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#111', margin: '0 0 14px' }}>
          Fixed Costs — All Vehicles
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Reg No.','Driver/mo','Helper/mo','Insurance/yr','Permit&Tax/yr','EMI/mo','Maint./mo','Other/mo','Total/mo','₹/km'].map(h => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr><td colSpan={10} style={{ ...TD, textAlign: 'center', color: '#aaa', padding: 24 }}>Add owned vehicles first</td></tr>
              ) : vehicles.map(v => {
                const f = fixed[v.id] ?? {}
                const total = totalPerMo(v.id)
                const avgKm = Number(kmMonth) || 6000
                return (
                  <tr key={v.id}>
                    <td style={MONO}>{v.reg_no}</td>
                    {(['driver_per_mo','helper_per_mo','insurance_yr','permit_tax_yr','emi_per_mo','maint_per_mo','other_per_mo'] as (keyof FixedCost)[]).map(k => (
                      <td key={k} style={{ ...TD, minWidth: 90 }}>
                        <NumInput value={String(f[k] ?? '')} onChange={val => setF(v.id, k, val)} />
                      </td>
                    ))}
                    <td style={{ ...TD, fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {String.fromCharCode(8377)}{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                    <td style={{ ...TD, color: '#555', whiteSpace: 'nowrap' }}>
                      {total > 0 ? String.fromCharCode(8377) + (total / avgKm).toFixed(2) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ 3. VARIABLE COSTS ═══════════════════════════════════════════ */}
      <div style={CARD}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#111', margin: '0 0 14px' }}>
          Variable Costs — All Vehicles
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Reg No.','Mileage km/L','Fuel ₹/km','Tyre/Maint ₹/km','Intracity ₹/km','Intercity ₹/km'].map(h => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr><td colSpan={6} style={{ ...TD, textAlign: 'center', color: '#aaa', padding: 24 }}>Add owned vehicles first</td></tr>
              ) : vehicles.map(v => {
                const vc  = variable[v.id] ?? {}
                const fuel = fuelPerKm(v.id)
                const tyre      = Number(vc.tyre_rs_per_km ?? 0)
                const tollPerKm = Number(toll) || 0
                // HTML formula: Intracity = Fuel + Tyre, Intercity = Fuel + Tyre + Toll ₹/km
                const intraTotal = fuel + tyre
                const interTotal = fuel + tyre + tollPerKm
                return (
                  <tr key={v.id}>
                    <td style={MONO}>{v.reg_no}</td>
                    <td style={{ ...TD, minWidth: 90 }}>
                      <NumInput value={String(vc.mileage_km_per_l ?? '')} onChange={val => setV(v.id, 'mileage_km_per_l', val)} />
                    </td>
                    <td style={{ ...TD, color: '#555', whiteSpace: 'nowrap' }}>
                      {fuel > 0 ? String.fromCharCode(8377) + fuel.toFixed(2) : '—'}
                    </td>
                    <td style={{ ...TD, minWidth: 90 }}>
                      <NumInput value={String(vc.tyre_rs_per_km ?? '')} onChange={val => setV(v.id, 'tyre_rs_per_km', val)} />
                    </td>
                    <td style={{ ...TD, color: '#555', whiteSpace: 'nowrap' }}>
                      {intraTotal > 0 ? String.fromCharCode(8377) + intraTotal.toFixed(2) : '—'}
                    </td>
                    <td style={{ ...TD, color: '#555', whiteSpace: 'nowrap' }}>
                      {interTotal > 0 ? String.fromCharCode(8377) + interTotal.toFixed(2) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
