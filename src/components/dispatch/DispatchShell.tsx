'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter }            from 'next/navigation'
import { useBookings }          from '@/hooks/useBookings'
import { useVehicles }          from '@/hooks/useVehicles'
import { Overview }             from './Overview'
import { VehicleSchedule }      from './VehicleSchedule'
import { BookingForm }          from './BookingForm'
import { DispatchBoard }        from './DispatchBoard'
import { VehicleMaster }        from './VehicleMaster'
import { RateSettings }         from './RateSettings'
import { WebsiteInquiries }     from './WebsiteInquiries'
import { Negotiation }          from './Negotiation'
import { TenderAnalyser }       from './TenderAnalyser'
import { InvoiceGenerator }     from './InvoiceGenerator'
import MarketVehicleDesk                   from './MarketVehicleDesk'
import { MarketVehicleBookingForm }        from './MarketVehicleBookingForm'
import { TripExpenseForm }                 from './TripExpenseForm'
import { DnlDesk }                         from './DnlDesk'
import type { BookingStage, VehicleStatus, MvdAutoBooking } from '@/types/dispatch'

type Tab =
  | 'overview'
  | 'schedule' | 'booking' | 'dispatch' | 'trip-expense'
  | 'inquiries' | 'negotiation'
  | 'mvd-booking' | 'mvd' | 'vehicles'
  | 'invoice' | 'rates'
  | 'dnl'
  | 'tender'

interface NavDirect { type: 'direct'; id: Tab; label: string }
interface NavGroup  { type: 'group';  label: string; items: { id: Tab; label: string }[] }
type NavEntry = NavDirect | NavGroup

const NAV: NavEntry[] = [
  { type: 'direct', id: 'overview', label: 'Dashboard' },
  {
    type: 'group', label: 'Operations',
    items: [
      { id: 'schedule',     label: 'Schedule'       },
      { id: 'booking',      label: 'New Booking'    },
      { id: 'dispatch',     label: 'Dispatch Board' },
      { id: 'trip-expense', label: 'Trip Expense'   },
    ],
  },
  {
    type: 'group', label: 'CRM',
    items: [
      { id: 'inquiries',   label: 'Website Inquiries' },
      { id: 'negotiation', label: 'Negotiation'       },
    ],
  },
  {
    type: 'group', label: 'Transport',
    items: [
      { id: 'mvd-booking', label: 'Market Vehicle Booking' },
      { id: 'mvd',         label: 'Market Vehicle Desk'    },
      { id: 'vehicles',    label: 'Vehicle Master'         },
    ],
  },
  {
    type: 'group', label: 'Finance',
    items: [
      { id: 'invoice', label: 'Invoice'       },
      { id: 'rates',   label: 'Rate Settings' },
    ],
  },
  { type: 'direct', id: 'dnl', label: 'Reports' },
  {
    type: 'group', label: 'More',
    items: [
      { id: 'tender', label: 'Tender' },
    ],
  },
]

function tabLabel(tab: Tab): string {
  for (const n of NAV) {
    if (n.type === 'direct' && n.id === tab) return n.label
    if (n.type === 'group') {
      const found = n.items.find(i => i.id === tab)
      if (found) return found.label
    }
  }
  return tab
}
function tabGroupName(tab: Tab): string | null {
  for (const n of NAV) {
    if (n.type === 'group' && n.items.some(i => i.id === tab)) return n.label
  }
  return null
}

// ── Dropdown — uses position:fixed so it escapes any overflow:auto parent ─────
function Dropdown({
  group, active, onSelect,
}: {
  group:    NavGroup
  active:   Tab
  onSelect: (id: Tab) => void
}) {
  const [open,   setOpen]   = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId    = `dd-panel-${group.label}`
  const isActive   = group.items.some(i => i.id === active)

  const handleToggle = useCallback(() => {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect()
      setCoords({ top: r.bottom + 2, left: r.left })
    }
    setOpen(o => !o)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      const panel = document.getElementById(panelId)
      if (triggerRef.current?.contains(e.target as Node)) return
      if (panel?.contains(e.target as Node)) return
      setOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handle)
    document.addEventListener('keydown',   handleKey)
    return () => {
      document.removeEventListener('mousedown', handle)
      document.removeEventListener('keydown',   handleKey)
    }
  }, [open, panelId])

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleToggle}
        style={{
          padding:      '10px 14px',
          fontSize:     '0.92rem',
          fontWeight:   isActive ? 600 : 400,
          color:        isActive ? '#c45c28' : '#555',
          background:   'transparent',
          border:       'none',
          borderBottom: `2px solid ${isActive ? '#c45c28' : 'transparent'}`,
          cursor:       'pointer',
          whiteSpace:   'nowrap',
          display:      'flex',
          alignItems:   'center',
          gap:          4,
          userSelect:   'none',
        }}>
        {group.label}
        <span style={{ fontSize: 9, opacity: 0.65, marginTop: 1 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          id={panelId}
          style={{
            position:   'fixed',
            top:        coords.top,
            left:       coords.left,
            zIndex:     9999,
            background: '#ffffff',
            border:     '1px solid #e0dbd3',
            borderRadius: 8,
            boxShadow:  '0 8px 32px rgba(0,0,0,0.14)',
            minWidth:   210,
            padding:    '4px 0',
          }}>
          <div style={{ padding: '6px 14px 5px', fontSize: 10, fontWeight: 700, color: '#c45c28', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #f3ede6', marginBottom: 4 }}>
            {group.label}
          </div>
          {group.items.map(item => {
            const isItemActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => { onSelect(item.id); setOpen(false) }}
                style={{
                  display:    'block',
                  width:      '100%',
                  textAlign:  'left',
                  padding:    '9px 16px',
                  fontSize:   '0.88rem',
                  fontWeight: isItemActive ? 600 : 400,
                  color:      isItemActive ? '#c45c28' : '#2d2d2d',
                  background: isItemActive ? '#fff4ee' : 'transparent',
                  border:     'none',
                  cursor:     'pointer',
                  borderLeft: `3px solid ${isItemActive ? '#c45c28' : 'transparent'}`,
                }}
                onMouseEnter={e => { if (!isItemActive) { e.currentTarget.style.background = '#f8f4f0'; e.currentTarget.style.color = '#111' } }}
                onMouseLeave={e => { if (!isItemActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2d2d2d' } }}>
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}

// ── Shell ─────────────────────────────────────────────────────────────────────
export function DispatchShell() {
  const [tab,        setTab]        = useState<Tab>('overview')
  const [preVehicle, setPreVehicle] = useState<string | undefined>()
  const [preDate,    setPreDate]    = useState<string | undefined>()
  const [mvdAutoBooking, setMvdAutoBooking] = useState<MvdAutoBooking | null>(null)

  const { bookings, loading: bLoading, updateStage, refresh: refreshBookings } = useBookings()
  const { vehicles, loading: vLoading, addVehicle, updateStatus, updateVehicle } = useVehicles()

  const dieselPrice = 97.6
  const activeCount = bookings.filter(b => !['DELIVERED','INVOICED','CANCELLED'].includes(b.stage)).length

  const router = useRouter()
  const handleLogout = async () => {
    await fetch('/api/bgts-auth', { method: 'DELETE' })
    router.push('/bgtsadmin1950')
  }

  const handleBookCell = (vehicleId: string, date: string) => {
    setPreVehicle(vehicleId); setPreDate(date); setTab('booking')
  }
  const handleStageChange  = async (id: string, stage: BookingStage)   => { await updateStage(id, stage) }
  const handleStatusChange = async (id: string, status: VehicleStatus) => { await updateStatus(id, status) }

  const grp = tabGroupName(tab)

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: 'system-ui,-apple-system,sans-serif', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .bgts-nav-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ════════════ HEADER ════════════ */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e0dbd3' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c45c28' }}>
              Baroda Goods Transport Service &mdash; FLT / OPS / BD
            </p>
            <h1 style={{ margin: '2px 0 0', fontSize: '1.55rem', fontWeight: 700, color: '#111111', lineHeight: 1.15 }}>
              Dispatch &amp; Booking Platform
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#666' }}>
            <span>Diesel:&nbsp;<strong style={{ color: '#111' }}>&#8377;{dieselPrice}/L</strong></span>
            <span style={{ color: '#ccc' }}>&middot;</span>
            <span><strong style={{ color: '#111' }}>{vehicles.length}</strong>&nbsp;vehicles</span>
            <span style={{ color: '#ccc' }}>&middot;</span>
            <span><strong style={{ color: '#111' }}>{activeCount}</strong>&nbsp;active bookings</span>
            <button onClick={refreshBookings}
              style={{ marginLeft: 10, fontSize: '0.75rem', padding: '4px 10px', borderRadius: 5, border: '1px solid #d0ccc5', background: 'transparent', color: '#888', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F3EFE8')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              &#8635; Refresh
            </button>
            <button onClick={handleLogout}
              style={{ marginLeft: 6, fontSize: '0.75rem', padding: '4px 12px', borderRadius: 5, border: '1px solid #f0c0a0', background: 'transparent', color: '#c45c28', fontWeight: 600, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#fff4ee')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              Sign Out
            </button>
          </div>
        </div>

        {/* ── Nav bar ── */}
        <div style={{ width: '100%', background: '#F3EFE8', borderTop: '1px solid #e0dbd3' }}>
          {/*
            KEY FIX: The scrollable wrapper is a separate div from the nav.
            The nav itself has NO overflow setting — this lets absolutely/fixed
            positioned dropdown panels escape without being clipped.
          */}
          <div
            className="bgts-nav-scroll"
            style={{
              maxWidth:        1400,
              margin:          '0 auto',
              padding:         '0 8px',
              overflowX:       'auto',
              overflowY:       'visible',
              scrollbarWidth:  'none',
              msOverflowStyle: 'none',
            } as React.CSSProperties}>
            <nav style={{ display: 'flex', gap: 0, alignItems: 'stretch', minWidth: 'max-content' }}>
              {NAV.map((entry, i) => {
                if (entry.type === 'direct') {
                  const isActive = tab === entry.id
                  return (
                    <button key={entry.id} onClick={() => setTab(entry.id)}
                      style={{
                        padding:      '10px 14px',
                        fontSize:     '0.92rem',
                        fontWeight:   isActive ? 600 : 400,
                        color:        isActive ? '#c45c28' : '#555',
                        background:   'transparent',
                        border:       'none',
                        borderBottom: `2px solid ${isActive ? '#c45c28' : 'transparent'}`,
                        cursor:       'pointer',
                        whiteSpace:   'nowrap',
                      }}>
                      {entry.label}
                    </button>
                  )
                }
                return (
                  <Dropdown
                    key={i}
                    group={entry}
                    active={tab}
                    onSelect={setTab}
                  />
                )
              })}
            </nav>
          </div>

          {/* Breadcrumb — shows active group + tab name */}
          {grp && (
            <div style={{ borderTop: '1px solid #ede8e0', padding: '3px 20px', fontSize: '0.72rem', color: '#999' }}>
              {grp} &rsaquo; <strong style={{ color: '#c45c28' }}>{tabLabel(tab)}</strong>
            </div>
          )}
        </div>
      </header>

      {/* ════════════ CONTENT ════════════ */}
      <main style={{ flex: 1, maxWidth: 1400, width: '100%', margin: '0 auto', padding: '0' }}>
        {tab === 'overview'     && <Overview bookings={bookings} vehicles={vehicles} dieselPrice={dieselPrice} />}
        {tab === 'schedule'     && <VehicleSchedule onBookCell={handleBookCell} onViewBooking={() => setTab('dispatch')} />}
        {tab === 'booking'      && (
          <BookingForm
            vehicles={vehicles}
            initialDate={preDate}
            initialVehicle={preVehicle}
            onSuccess={() => { refreshBookings(); setTab('dispatch') }}
          />
        )}
        {tab === 'dispatch'     && <DispatchBoard bookings={bookings} vehicles={vehicles} onStageChange={handleStageChange} loading={bLoading} onRefresh={refreshBookings} />}
        {tab === 'trip-expense' && (
          <div style={{ padding: '20px 28px' }}>
            <TripExpenseForm />
          </div>
        )}
        {tab === 'inquiries'    && <WebsiteInquiries />}
        {tab === 'negotiation'  && <Negotiation />}
        {tab === 'mvd-booking'  && (
          <div style={{ padding: '20px 28px' }}>
            <MarketVehicleBookingForm onSuccess={(booking) => { setMvdAutoBooking(booking); setTab('mvd') }} />
          </div>
        )}
        {tab === 'mvd'          && (
          <div style={{ padding: '20px 28px' }}>
            <MarketVehicleDesk
              autoBooking={mvdAutoBooking}
              onAutoBookingConsumed={() => setMvdAutoBooking(null)}
              onBookingConfirmed={refreshBookings}
            />
          </div>
        )}
        {tab === 'vehicles'     && <VehicleMaster vehicles={vehicles} onAdd={addVehicle} onUpdate={updateVehicle} onStatusChange={handleStatusChange} loading={vLoading} />}
        {tab === 'invoice'      && <InvoiceGenerator />}
        {tab === 'rates'        && <RateSettings />}
        {tab === 'dnl'          && <DnlDesk />}
        {tab === 'tender'       && <TenderAnalyser />}
      </main>

      {/* ════════════ FOOTER ════════════ */}
      <footer style={{ width: '100%', background: '#F3EFE8', borderTop: '1px solid #e0dbd3', marginTop: 'auto' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.72rem', color: '#999', fontStyle: 'italic' }}>
            BGTS Dispatch &amp; Booking Platform — WhatsApp/Email sends open on this device for a team member to review and send; nothing transmits automatically.
          </span>
          <span style={{ fontSize: '0.72rem', color: '#bbb' }}>
            &copy; {new Date().getFullYear()} Baroda Goods Transport Service
          </span>
        </div>
      </footer>
    </div>
  )
}
