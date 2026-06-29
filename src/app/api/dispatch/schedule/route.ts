import { NextRequest, NextResponse } from 'next/server'
import { getBgtsClient } from '@/lib/supabase-bgts'
import type { ScheduleRow, ScheduleCellStatus } from '@/types/dispatch'

// GET /api/dispatch/schedule?days=7|14|30&from=YYYY-MM-DD
// Returns: ScheduleRow[] — each vehicle with cells for each date
export async function GET(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getBgtsClient() as any
  const { searchParams } = new URL(req.url)

  const days     = Math.min(Number(searchParams.get('days') ?? 7), 30)
  const fromDate = searchParams.get('from') ?? new Date().toISOString().slice(0, 10)

  // Build date range
  const dates: string[] = []
  const start = new Date(fromDate)
  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    dates.push(d.toISOString().slice(0, 10))
  }

  const toDate = dates[dates.length - 1]

  // Fetch all owned vehicles
  const { data: vehicles, error: ve } = await supabase
    .from('vehicles' as any)
    .select('*')
    .eq('ownership', 'OWNED')
    .order('reg_no') as unknown as { data: import('@/types/dispatch').Vehicle[] | null; error: { message: string } | null }

  if (ve || !vehicles) {
    return NextResponse.json({ data: null, error: ve?.message ?? 'No vehicles' }, { status: 500 })
  }

  // Fetch all bookings in the date range
  const { data: bookings, error: be } = await supabase
    .from('bookings' as any)
    .select('id, vehicle_id, trip_date, client_name, stage')
    .gte('trip_date', fromDate)
    .lte('trip_date', toDate)
    .neq('stage', 'CANCELLED') as unknown as { data: { id:string; vehicle_id:string; trip_date:string; client_name:string; stage:string }[] | null; error: { message: string } | null }

  if (be) {
    return NextResponse.json({ data: null, error: be.message }, { status: 500 })
  }

  // Build a lookup: vehicle_id + date → booking
  const bookingMap = new Map<string, { id: string; client_name: string }>()
  for (const b of bookings ?? []) {
    bookingMap.set(`${b.vehicle_id}__${b.trip_date}`, {
      id:          b.id,
      client_name: b.client_name,
    })
  }

  // Build rows
  const rows: ScheduleRow[] = vehicles.map(vehicle => ({
    vehicle,
    cells: dates.map(date => {
      const booking    = bookingMap.get(`${vehicle.id}__${date}`)
      const isHold     = vehicle.status_now === 'MAINTENANCE' || vehicle.status_now === 'COMPLIANCE_HOLD'
      const cellStatus: ScheduleCellStatus = isHold ? 'HOLD' : booking ? 'BOOKED' : 'OPEN'

      return {
        vehicle_id:  vehicle.id,
        date,
        status:      cellStatus,
        booking_id:  booking?.id ?? null,
        client_name: booking?.client_name ?? null,
      }
    }),
  }))

  return NextResponse.json({ data: { dates, rows }, error: null })
}
