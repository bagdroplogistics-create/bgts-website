'use client'
import type { Booking, Vehicle } from '@/types/dispatch'

interface Props { bookings: Booking[]; vehicles: Vehicle[]; dieselPrice?: number }

const STAGE_LABEL: Record<string, string> = {
  BOOKING_RECEIVED:  'Booking Received',  PAYMENT_PENDING:  'Payment Pending',
  PAYMENT_RECEIVED:  'Payment Received',  BOOKING_CONFIRMED:'Booking Confirmed',
  VEHICLE_DISPATCHED:'Vehicle Dispatched',IN_TRANSIT:       'In Transit',
  DELIVERED:         'Delivered',         INVOICE_RAISED:   'Invoice Raised',
  CANCELLED:         'Cancelled',
  // Legacy
  BOOKED: 'Booked', DISPATCHED: 'Dispatched', INVOICED: 'Invoiced',
}
const STAGE_STYLE: Record<string, React.CSSProperties> = {
  BOOKING_RECEIVED:  { background: '#e0edff', color: '#1e5fa8' },
  PAYMENT_PENDING:   { background: '#fef3c7', color: '#92400e' },
  PAYMENT_RECEIVED:  { background: '#ccfbf1', color: '#0f766e' },
  BOOKING_CONFIRMED: { background: '#e0e7ff', color: '#3730a3' },
  VEHICLE_DISPATCHED:{ background: '#fff7d6', color: '#8a6400' },
  IN_TRANSIT:        { background: '#fff0dc', color: '#a05000' },
  DELIVERED:         { background: '#d8f5e2', color: '#1a6e35' },
  INVOICE_RAISED:    { background: '#f0e0ff', color: '#6200b3' },
  CANCELLED:         { background: '#ffe0e0', color: '#b30000' },
  BOOKED:            { background: '#e0edff', color: '#1e5fa8' },
  DISPATCHED:        { background: '#fff7d6', color: '#8a6400' },
  INVOICED:          { background: '#f0e0ff', color: '#6200b3' },
}
const STATUS_STYLE: Record<string, React.CSSProperties> = {
  AVAILABLE       : { background: '#d8f5e2', color: '#1a6e35' },
  ON_TRIP         : { background: '#fff7d6', color: '#8a6400' },
  MAINTENANCE     : { background: '#ffe0e0', color: '#b30000' },
  COMPLIANCE_HOLD : { background: '#ffe0e0', color: '#b30000' },
  CHECK_RENEWAL   : { background: '#fff0dc', color: '#a05000' },
  IDLE            : { background: '#f0f0f0', color: '#666666' },
  ON_DEMAND       : { background: '#e8f0ff', color: '#2050a0' },
}
const STATUS_LABEL: Record<string, string> = {
  AVAILABLE: 'Available', ON_TRIP: 'On Trip',
  MAINTENANCE: 'Maintenance', COMPLIANCE_HOLD: 'Compliance Hold', CHECK_RENEWAL: 'Check Renewal',
  IDLE: 'Idle', ON_DEMAND: 'On Demand',
}

const cell: React.CSSProperties = { padding: '10px 14px', fontSize: '0.82rem', color: '#333', borderBottom: '1px solid #e2ddd7' }
const hcell: React.CSSProperties = { padding: '8px 14px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#777', background: '#F3EFE8', borderBottom: '1px solid #d5cfc7' }
const badge = (style: React.CSSProperties): React.CSSProperties => ({ ...style, display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600 })

export function Overview({ bookings, vehicles }: Props) {
  const today    = new Date().toISOString().slice(0, 10)
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  const week     = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)

  const upcoming   = bookings.filter(b => b.trip_date >= today && b.trip_date <= tomorrow && b.stage !== 'CANCELLED').sort((a,b)=>a.trip_date.localeCompare(b.trip_date))
  const available  = vehicles.filter(v => v.status_now === 'AVAILABLE').length
  const holdCount  = vehicles.filter(v => ['COMPLIANCE_HOLD','MAINTENANCE','CHECK_RENEWAL'].includes(v.status_now)).length
  const nextWeek   = bookings.filter(b => b.trip_date >= today && b.trip_date <= week && b.stage !== 'CANCELLED').length
  const activeBook = bookings.filter(b => !['DELIVERED','INVOICE_RAISED','CANCELLED','INVOICED'].includes(b.stage)).length

  const STATS = [
    { label: 'Available Today',           value: available,  color: '#1a6e35' },
    { label: 'Compliance / Maint. Hold',  value: holdCount,  color: '#b30000' },
    { label: 'Bookings — Next 7 Days',    value: nextWeek,   color: '#1a1a1a' },
    { label: 'Total Active Bookings',     value: activeBook, color: '#1a1a1a' },
  ]

  return (
    <div style={{ padding: '24px 24px 40px' }}>

      {/* ── 4 Stat Cards ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ background: '#F3EFE8', border: '1px solid #ddd8d0', borderRadius: 8, padding: '14px 18px' }}>
            <div style={{ fontSize: '0.72rem', color: '#888', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Two-column layout ─────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Today & Tomorrow */}
        <div style={{ background: '#ffffff', border: '1px solid #ddd8d0', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid #ddd8d0' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a' }}>Today &amp; Tomorrow</div>
            <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 2 }}>
              Bookings landing in the next 48 hours — what dispatch needs to act on <span style={{ color: '#c45c28' }}>right now</span>.
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Date','Client / Co.','Vehicle','Route','Stage'].map(h => <th key={h} style={hcell}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {upcoming.length === 0 ? (
                <tr><td colSpan={5} style={{ ...cell, textAlign: 'center', color: '#aaa', padding: '24px' }}>Nothing scheduled today or tomorrow.</td></tr>
              ) : upcoming.map(b => (
                <tr key={b.id} style={{ cursor: 'default' }}>
                  <td style={cell}>
                    <span style={{ fontWeight: 700, color: b.trip_date === today ? '#c45c28' : '#555', fontSize: '0.78rem' }}>
                      {b.trip_date === today ? 'TODAY' : 'Tomorrow'}
                    </span>
                    <span style={{ color: '#aaa', fontSize: '0.7rem', marginLeft: 4 }}>{b.trip_date}</span>
                  </td>
                  <td style={cell}><div style={{ fontWeight: 600, color: '#1a1a1a' }}>{b.client_name}</div>
                    {b.company_name && <div style={{ fontSize: '0.7rem', color: '#888' }}>{b.company_name}</div>}
                  </td>
                  <td style={{ ...cell, fontFamily: 'monospace', fontSize: '0.78rem' }}>{b.vehicle?.reg_no ?? '—'}</td>
                  <td style={{ ...cell, fontSize: '0.75rem', color: '#666' }}>{b.from_loc} → {b.to_loc}</td>
                  <td style={cell}><span style={badge(STAGE_STYLE[b.stage] ?? {})}>{STAGE_LABEL[b.stage] ?? b.stage}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fleet Availability Today */}
        <div style={{ background: '#ffffff', border: '1px solid #ddd8d0', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid #ddd8d0' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a' }}>Fleet Availability — Today</div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Reg No.','Status','Today'].map(h => <th key={h} style={hcell}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr><td colSpan={3} style={{ ...cell, textAlign: 'center', color: '#aaa', padding: '24px' }}>No vehicles in fleet.</td></tr>
              ) : vehicles.map(v => {
                const bookedToday = bookings.some(b => b.vehicle_id === v.id && b.trip_date === today && b.stage !== 'CANCELLED')
                const st = bookedToday ? 'ON_TRIP' : v.status_now
                return (
                  <tr key={v.id}>
                    <td style={{ ...cell, fontFamily: 'monospace', fontWeight: 700 }}>{v.reg_no}</td>
                    <td style={cell}><span style={badge(STATUS_STYLE[v.status_now] ?? {})}>{STATUS_LABEL[v.status_now] ?? v.status_now}</span></td>
                    <td style={cell}>
                      <span style={{ border: `1px solid ${bookedToday ? '#c45c28' : st === 'AVAILABLE' ? '#4caf50' : '#d0d0d0'}`, color: bookedToday ? '#c45c28' : st === 'AVAILABLE' ? '#2e7d32' : '#999', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, letterSpacing: '0.04em' }}>
                        {bookedToday ? 'BOOKED' : 'OPEN'}
                      </span>
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
