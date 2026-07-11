import { NextRequest, NextResponse } from 'next/server'
import { getBgtsAdminClient } from '@/lib/supabase-bgts'

// GET /api/dispatch/bookings/export?date=2026-06-27
// Exports Today's Dispatch as CSV — matches the HTML prototype export button
export async function GET(req: NextRequest) {
  const supabase  = getBgtsAdminClient()
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') ?? new Date().toISOString().slice(0, 10)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('bookings')
    .select('*, vehicle:vehicles(reg_no, make_model)')
    .eq('trip_date', date)
    .neq('stage', 'CANCELLED')
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const headers = [
    'Date', 'Client', 'Company', 'Confirmed Broker / Agent', 'Phone', 'Vehicle',
    'From', 'To', 'Distance (km)', 'Material', 'Weight (kg)',
    'Trip Type', 'Rate (₹)', 'Stage'
  ]

  const rows = (data ?? []).map((b: Record<string,unknown> & { vehicle?: {reg_no:string}|null }) => [
    b.trip_date,
    b.client_name,
    b.company_name        ?? '',
    b.confirmed_broker    ?? '',
    b.phone,
    b.vehicle?.reg_no ?? b.vehicle_id,
    b.from_loc,
    b.to_loc,
    b.distance_km,
    b.material,
    b.weight_kg ?? '',
    b.trip_type,
    b.rate_total ?? '',
    b.stage,
  ].map(v => JSON.stringify(String(v ?? ''))).join(','))

  const csv = [headers.join(','), ...rows].join('\n')

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="BGTS_Dispatch_${date}.csv"`,
    },
  })
}
