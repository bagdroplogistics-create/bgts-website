'use client'
import { useState, useEffect } from 'react'
import { useRates } from '@/hooks/useRates'

// ── Surcharge options ────────────────────────────────────────────────────────
const SURCHARGES = [
  { key: 'night',   label: 'Night Charge (+10%)',   pct: 10  },
  { key: 'hazmat',  label: 'HAZMAT (+15%)',          pct: 15  },
  { key: 'holiday', label: 'Holiday / Sunday (+8%)', pct: 8   },
  { key: 'express', label: 'Express / Urgent (+20%)',pct: 20  },
  { key: 'odcload', label: 'ODC / OWC Load (+12%)',  pct: 12  },
]

// ── Detention rate schedule ──────────────────────────────────────────────────
const DETENTION = [
  { period: '0 – 3 Hours',   rate: 'FREE'          },
  { period: '3 – 6 Hours',   rate: '₹500 / hr'     },
  { period: '6 – 12 Hours',  rate: '₹1,000 / hr'   },
  { period: '12 – 24 Hours', rate: '₹2,500 / hr'   },
  { period: '24+ Hours',     rate: 'Full Day Rate'  },
]

function detentionCharge(hrs: number): number {
  if (hrs <= 3)  return 0
  if (hrs <= 6)  return (hrs - 3) * 500
  if (hrs <= 12) return 3 * 500 + (hrs - 6) * 1000
  if (hrs <= 24) return 3 * 500 + 6 * 1000 + (hrs - 12) * 2500
  return 3 * 500 + 6 * 1000 + 12 * 2500 + (hrs - 24) * 3500
}

const fmtRs = (n: number) =>
  '₹' + Math.round(n).toLocaleString('en-IN')

const CARD: React.CSSProperties = {
  background: '#ffffff', border: '1px solid #ddd8d0',
  borderRadius: 8, padding: '20px 24px', marginBottom: 20,
}
const LABEL: React.CSSProperties = {
  fontSize: '0.72rem', fontWeight: 700, color: '#666',
  textTransform: 'uppercase', letterSpacing: '0.06em',
  display: 'block', marginBottom: 4,
}
const INPUT: React.CSSProperties = {
  width: '100%', padding: '8px 10px', fontSize: '0.88rem',
  border: '1px solid #d5cfc7', borderRadius: 6,
  background: '#faf7f4', boxSizing: 'border-box',
  outline: 'none',
}
const SELECT_STYLE: React.CSSProperties = { ...INPUT, cursor: 'pointer' }
const ROW: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between',
  alignItems: 'center', padding: '7px 0',
  borderBottom: '1px solid #f0ece5', fontSize: '0.84rem',
}
const TH: React.CSSProperties = {
  padding: '8px 14px', fontSize: '0.7rem', fontWeight: 700,
  letterSpacing: '0.07em', textTransform: 'uppercase' as const,
  color: '#777', background: '#F3EFE8', borderBottom: '1px solid #d5cfc7',
  textAlign: 'left' as const,
}
const TD: React.CSSProperties = {
  padding: '9px 14px', fontSize: '0.82rem',
  color: '#333', borderBottom: '1px solid #ece8e0',
}

export function QuoteEngine() {
  const { rates, loading: rLoading } = useRates()

  const [vehicleId,    setVehicleId]    = useState('')
  const [tripType,     setTripType]     = useState<'local' | 'outstation'>('local')
  const [km,           setKm]           = useState('')
  const [marginPct,    setMarginPct]    = useState('20')
  const [waitingHrs,   setWaitingHrs]   = useState('0')
  const [tollRs,       setTollRs]       = useState('0')
  const [loadingRs,    setLoadingRs]    = useState('0')
  const [unloadingRs,  setUnloadingRs]  = useState('0')
  const [activeSurcharges, setActiveSurcharges] = useState<Record<string, boolean>>({})
  const [waMsg,        setWaMsg]        = useState('')
  const [copied,       setCopied]       = useState(false)

  // Derived breakdown
  const [breakdown, setBreakdown] = useState<{
    fuel: number; tyre: number; driverBata: number; fixed: number
    base: number; toll: number; loading: number; unloading: number
    detention: number; surcharge: number; surchargeNote: string
    subtotal: number; margin: number; total: number; perKm: number
  } | null>(null)

  useEffect(() => {
    if (!vehicleId || !km || Number(km) <= 0) { setBreakdown(null); return }

    const veh       = rates.vehicles.find(v => v.id === vehicleId)
    const fixCost   = rates.fixed.find(f => f.vehicle_id === vehicleId)
    const varCost   = rates.variable.find(v => v.vehicle_id === vehicleId)
    const settings  = rates.settings

    if (!veh || !fixCost || !varCost || !settings) { setBreakdown(null); return }

    const d = Number(km)
    const mileage = varCost.mileage_km_per_l || 10
    const fuel    = (settings.diesel_rs_l / mileage) * d
    const tyre    = varCost.tyre_rs_per_km * d
    const driverBata = tripType === 'local' ? settings.driver_bata : settings.driver_bata_ic

    const fixedPerMo =
      fixCost.driver_per_mo + fixCost.helper_per_mo + fixCost.maint_per_mo +
      fixCost.emi_per_mo + fixCost.other_per_mo +
      fixCost.insurance_yr / 12 + fixCost.permit_tax_yr / 12
    const fixed = fixedPerMo / 10

    const base      = fuel + tyre + driverBata + fixed
    const toll      = Number(tollRs)   || 0
    const loading   = Number(loadingRs)|| 0
    const unloading = Number(unloadingRs) || 0
    const detention = detentionCharge(Number(waitingHrs) || 0)

    const activePct = SURCHARGES
      .filter(s => activeSurcharges[s.key])
      .reduce((sum, s) => sum + s.pct, 0)
    const surcharge = (base * activePct) / 100
    const surchargeNote = activePct > 0 ? `+${activePct}% of base` : '+0%'

    const subtotal = base + toll + loading + unloading + detention + surcharge
    const margin   = (subtotal * (Number(marginPct) || 0)) / 100
    const total    = subtotal + margin
    const perKm    = d > 0 ? total / d : 0

    setBreakdown({ fuel, tyre, driverBata, fixed, base, toll, loading, unloading, detention, surcharge, surchargeNote, subtotal, margin, total, perKm })

    // Build WhatsApp message
    const vehLabel = `${veh.reg_no} — ${veh.make_model}`
    const msg = `*BGTS Transport — Rate Confirmation*\n\n` +
      `Vehicle: ${vehLabel}\n` +
      `Trip Type: ${tripType === 'local' ? 'Local (Gujarat)' : 'Outstation'}\n` +
      `Distance: ${d} km\n\n` +
      `*Rate Breakdown*\n` +
      `Fuel: ${fmtRs(fuel)}\n` +
      `Tyre & Maint: ${fmtRs(tyre)}\n` +
      `Driver Bata: ${fmtRs(driverBata)}\n` +
      `Fixed (amortised): ${fmtRs(fixed)}\n` +
      (toll > 0       ? `Toll: ${fmtRs(toll)}\n`           : '') +
      (loading > 0    ? `Loading: ${fmtRs(loading)}\n`     : '') +
      (unloading > 0  ? `Unloading: ${fmtRs(unloading)}\n` : '') +
      (detention > 0  ? `Detention: ${fmtRs(detention)}\n` : '') +
      (surcharge > 0  ? `Surcharges (${surchargeNote}): ${fmtRs(surcharge)}\n` : '') +
      `Margin (${marginPct}%): ${fmtRs(margin)}\n\n` +
      `*Total Rate: ${fmtRs(total)}*\n` +
      `Rate per km: ${fmtRs(perKm)}/km\n\n` +
      `_BGTS — Baroda Goods Transport Service_\n📞 +91 63 5722 5722`

    setWaMsg(msg)
  }, [vehicleId, tripType, km, marginPct, waitingHrs, tollRs, loadingRs, unloadingRs, activeSurcharges, rates])

  const toggleSurcharge = (key: string) =>
    setActiveSurcharges(p => ({ ...p, [key]: !p[key] }))

  const copyMsg = () => {
    navigator.clipboard.writeText(waMsg).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const openWhatsApp = () => {
    const encoded = encodeURIComponent(waMsg)
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
  }

  const ownedVehicles = rates.vehicles.filter(v => {
    // Only OWNED vehicles (not MARKET class)
    const cls = (v.class as string) ?? ''
    return !cls.startsWith('MARKET')
  })

  if (rLoading) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
      Loading rate data…
    </div>
  )

  return (
    <div style={{ padding: '24px 24px 48px', maxWidth: 1100 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#111', margin: '0 0 4px' }}>
          Hybrid Quote Engine
        </h2>
        <p style={{ fontSize: '0.78rem', color: '#888', margin: 0 }}>
          Full BGTS hybrid pricing model. All surcharges, detention, dead mileage. Auto-generates WhatsApp message.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* ── LEFT: Inputs ── */}
        <div>
          <div style={CARD}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#c45c28', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Trip Details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={LABEL}>Vehicle</label>
                <select style={SELECT_STYLE} value={vehicleId} onChange={e => setVehicleId(e.target.value)}>
                  <option value="">— Select vehicle —</option>
                  {ownedVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.reg_no} — {v.make_model}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={LABEL}>Trip Type</label>
                <select style={SELECT_STYLE} value={tripType} onChange={e => setTripType(e.target.value as 'local' | 'outstation')}>
                  <option value="local">Local (Gujarat)</option>
                  <option value="outstation">Outstation</option>
                </select>
              </div>
              <div>
                <label style={LABEL}>One-Way KM</label>
                <input style={INPUT} type="number" min="1" placeholder="e.g. 120" value={km} onChange={e => setKm(e.target.value)} />
              </div>
              <div>
                <label style={LABEL}>Margin %</label>
                <input style={INPUT} type="number" min="0" max="100" placeholder="20" value={marginPct} onChange={e => setMarginPct(e.target.value)} />
              </div>
              <div>
                <label style={LABEL}>Waiting Hours</label>
                <input style={INPUT} type="number" min="0" step="0.5" placeholder="0" value={waitingHrs} onChange={e => setWaitingHrs(e.target.value)} />
              </div>
              <div>
                <label style={LABEL}>Toll (₹)</label>
                <input style={INPUT} type="number" min="0" placeholder="0" value={tollRs} onChange={e => setTollRs(e.target.value)} />
              </div>
              <div>
                <label style={LABEL}>Loading (₹)</label>
                <input style={INPUT} type="number" min="0" placeholder="0" value={loadingRs} onChange={e => setLoadingRs(e.target.value)} />
              </div>
              <div>
                <label style={LABEL}>Unloading (₹)</label>
                <input style={INPUT} type="number" min="0" placeholder="0" value={unloadingRs} onChange={e => setUnloadingRs(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Surcharges */}
          <div style={CARD}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#c45c28', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Surcharges ({SURCHARGES.filter(s => activeSurcharges[s.key]).reduce((sum, s) => sum + s.pct, 0)}% active)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SURCHARGES.map(s => (
                <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.85rem', color: '#333' }}>
                  <input
                    type="checkbox"
                    checked={!!activeSurcharges[s.key]}
                    onChange={() => toggleSurcharge(s.key)}
                    style={{ width: 15, height: 15, accentColor: '#c45c28', cursor: 'pointer' }}
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>

          {/* Detention Reference */}
          <div style={CARD}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#555', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Detention Reference
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={TH}>Period</th>
                  <th style={TH}>Rate</th>
                </tr>
              </thead>
              <tbody>
                {DETENTION.map(d => (
                  <tr key={d.period}>
                    <td style={TD}>{d.period}</td>
                    <td style={{ ...TD, fontWeight: d.rate === 'FREE' ? 600 : 400, color: d.rate === 'FREE' ? '#1a6e35' : '#333' }}>{d.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── RIGHT: Breakdown + WhatsApp ── */}
        <div>
          <div style={CARD}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#c45c28', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quote Breakdown
            </div>

            {!breakdown ? (
              <p style={{ color: '#aaa', fontSize: '0.82rem', padding: '12px 0' }}>
                Select vehicle and enter distance to see the rate.
              </p>
            ) : (
              <>
                <div style={{ ...ROW, borderBottom: 'none', color: '#888', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', paddingBottom: 4 }}>
                  <span>Item</span><span>Amount</span>
                </div>
                {[
                  ['Fuel Cost',                  breakdown.fuel],
                  ['Tyre & Maintenance',          breakdown.tyre],
                  ['Driver Bata',                breakdown.driverBata],
                  ['Fixed Cost (amortised)',     breakdown.fixed],
                ].map(([label, val]) => (
                  <div key={label as string} style={ROW}>
                    <span style={{ color: '#555' }}>{label}</span>
                    <span style={{ fontWeight: 500 }}>{fmtRs(val as number)}</span>
                  </div>
                ))}
                <div style={{ ...ROW, borderTop: '1px solid #ddd8d0', marginTop: 4, fontWeight: 700 }}>
                  <span>Base Cost</span>
                  <span>{fmtRs(breakdown.base)}</span>
                </div>
                {breakdown.toll > 0 && (
                  <div style={ROW}>
                    <span style={{ color: '#555' }}>Toll</span>
                    <span>{fmtRs(breakdown.toll)}</span>
                  </div>
                )}
                {breakdown.loading > 0 && (
                  <div style={ROW}>
                    <span style={{ color: '#555' }}>Loading</span>
                    <span>{fmtRs(breakdown.loading)}</span>
                  </div>
                )}
                {breakdown.unloading > 0 && (
                  <div style={ROW}>
                    <span style={{ color: '#555' }}>Unloading</span>
                    <span>{fmtRs(breakdown.unloading)}</span>
                  </div>
                )}
                {breakdown.detention > 0 && (
                  <div style={ROW}>
                    <span style={{ color: '#555' }}>Detention ({waitingHrs} hrs)</span>
                    <span style={{ color: '#c45c28', fontWeight: 600 }}>{fmtRs(breakdown.detention)}</span>
                  </div>
                )}
                {breakdown.surcharge > 0 && (
                  <div style={ROW}>
                    <span style={{ color: '#555' }}>Surcharges ({breakdown.surchargeNote})</span>
                    <span>{fmtRs(breakdown.surcharge)}</span>
                  </div>
                )}
                <div style={{ ...ROW, fontWeight: 600 }}>
                  <span>Subtotal</span>
                  <span>{fmtRs(breakdown.subtotal)}</span>
                </div>
                <div style={ROW}>
                  <span style={{ color: '#555' }}>Margin ({marginPct}%)</span>
                  <span>{fmtRs(breakdown.margin)}</span>
                </div>

                {/* Total highlight */}
                <div style={{ background: '#fff3ea', border: '2px solid #c45c28', borderRadius: 8, padding: '14px 18px', marginTop: 14 }}>
                  <div style={{ fontSize: '0.7rem', color: '#c45c28', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                    Total Quote Rate
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#a03a0a' }}>
                    {fmtRs(breakdown.total)}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#888', marginTop: 4 }}>
                    {fmtRs(breakdown.perKm)} / km
                  </div>
                </div>
              </>
            )}
          </div>

          {/* WhatsApp Message */}
          {breakdown && waMsg && (
            <div style={CARD}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#c45c28', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                WhatsApp Message
              </div>
              <pre style={{ background: '#f8f5f0', border: '1px solid #ddd8d0', borderRadius: 6, padding: '12px 14px', fontSize: '0.78rem', color: '#333', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: '0 0 12px', lineHeight: 1.6, fontFamily: 'inherit' }}>
                {waMsg}
              </pre>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={copyMsg}
                  style={{ flex: 1, padding: '9px 0', background: copied ? '#1a6e35' : '#F3EFE8', border: '1px solid #d5cfc7', borderRadius: 6, fontSize: '0.82rem', fontWeight: 600, color: copied ? '#fff' : '#333', cursor: 'pointer' }}
                >
                  {copied ? '✓ Copied!' : 'Copy to Clipboard'}
                </button>
                <button
                  onClick={openWhatsApp}
                  style={{ flex: 1, padding: '9px 0', background: '#25D366', border: 'none', borderRadius: 6, fontSize: '0.82rem', fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                >
                  Open in WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
