'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBookings }     from '@/hooks/useBookings'
import { useVehicles }     from '@/hooks/useVehicles'
import { Overview }        from './Overview'
import { VehicleSchedule } from './VehicleSchedule'
import { BookingForm }     from './BookingForm'
import { DispatchBoard }   from './DispatchBoard'
import { VehicleMaster }   from './VehicleMaster'
import { RateSettings }       from './RateSettings'
import { WebsiteInquiries } from './WebsiteInquiries'
import type { BookingStage, VehicleStatus } from '@/types/dispatch'

type Tab = 'overview' | 'schedule' | 'booking' | 'dispatch' | 'vehicles' | 'rates' | 'inquiries'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview',  label: 'Overview'       },
  { id: 'schedule',  label: 'Schedule'       },
  { id: 'booking',   label: 'New Booking'    },
  { id: 'dispatch',  label: 'Dispatch Board' },
  { id: 'vehicles',  label: 'Vehicle Master' },
  { id: 'rates',     label: 'Rate Settings'  },
  { id: 'inquiries', label: 'Website Inquiries' },
]

export function DispatchShell() {
  const [tab,        setTab]        = useState<Tab>('overview')
  const [preVehicle, setPreVehicle] = useState<string | undefined>()
  const [preDate,    setPreDate]    = useState<string | undefined>()

  const { bookings, loading: bLoading, updateStage, refresh: refreshBookings } = useBookings()
  const { vehicles, loading: vLoading, addVehicle, updateStatus, updateVehicle } = useVehicles()

  const dieselPrice  = 97.6
  const activeCount  = bookings.filter(b => !['DELIVERED','INVOICED','CANCELLED'].includes(b.stage)).length

  const router = useRouter()
  const handleLogout = async () => {
    await fetch('/api/bgts-auth', { method: 'DELETE' })
    router.push('/bgtsadmin1950')
  }

  const handleBookCell = (vehicleId: string, date: string) => {
    setPreVehicle(vehicleId); setPreDate(date); setTab('booking')
  }
  const handleStageChange  = async (id: string, stage: BookingStage)  => { await updateStage(id, stage) }
  const handleStatusChange = async (id: string, status: VehicleStatus) => { await updateStatus(id, status) }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: 'system-ui,-apple-system,sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* ════════════ HEADER ════════════ */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e0dbd3' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Brand */}
          <div>
            <p style={{ margin: 0, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c45c28' }}>
              Baroda Goods Transport Service &mdash; FLT / OPS / BD
            </p>
            <h1 style={{ margin: '2px 0 0', fontSize: '1.55rem', fontWeight: 700, color: '#111111', lineHeight: 1.15 }}>
              Dispatch &amp; Booking Platform
            </h1>
          </div>
          {/* KPI + Refresh */}
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

        {/* ── Tab bar — full width cream strip ── */}
        <div style={{ width: '100%', background: '#F3EFE8', borderTop: '1px solid #e0dbd3' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px' }}>
            <nav style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{
                    padding        : '10px 18px',
                    fontSize       : '0.85rem',
                    fontWeight     : tab === t.id ? 600 : 400,
                    color          : tab === t.id ? '#c45c28' : '#555',
                    background     : 'transparent',
                    border         : 'none',
                    borderBottom   : `2px solid ${tab === t.id ? '#c45c28' : 'transparent'}`,
                    cursor         : 'pointer',
                    whiteSpace     : 'nowrap',
                    transition     : 'color 0.15s',
                  }}>
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* ════════════ CONTENT ════════════ */}
      <main style={{ flex: 1, maxWidth: 1400, width: '100%', margin: '0 auto', padding: '0' }}>
        {tab === 'overview'  && <Overview bookings={bookings} vehicles={vehicles} dieselPrice={dieselPrice} />}
        {tab === 'schedule'  && <VehicleSchedule onBookCell={handleBookCell} onViewBooking={() => setTab('dispatch')} />}
        {tab === 'booking'   && (
          <BookingForm
            vehicles={vehicles}
            initialDate={preDate}
            initialVehicle={preVehicle}
            onSuccess={() => { refreshBookings(); setTab('dispatch') }}
          />
        )}
        {tab === 'dispatch'  && <DispatchBoard bookings={bookings} onStageChange={handleStageChange} loading={bLoading} />}
        {tab === 'vehicles'  && <VehicleMaster vehicles={vehicles} onAdd={addVehicle} onUpdate={updateVehicle} onStatusChange={handleStatusChange} loading={vLoading} />}
        {tab === 'rates'     && <RateSettings />}
        {tab === 'inquiries' && <WebsiteInquiries />}
      </main>

      {/* ════════════ FOOTER ════════════ */}
      <footer style={{ width: '100%', background: '#F3EFE8', borderTop: '1px solid #e0dbd3', marginTop: 'auto' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.72rem', color: '#999', fontStyle: 'italic' }}>
            BGTS Dispatch &amp; Booking Platform &mdash; WhatsApp/Email sends open on this device for a team member to review and send; nothing transmits automatically.
          </span>
          <span style={{ fontSize: '0.72rem', color: '#bbb' }}>
            &copy; {new Date().getFullYear()} Baroda Goods Transport Service
          </span>
        </div>
      </footer>

    </div>
  )
}
