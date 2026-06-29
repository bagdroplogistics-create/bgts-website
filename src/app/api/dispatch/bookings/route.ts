import { NextRequest, NextResponse } from 'next/server'
import { getBgtsAdminClient } from '@/lib/supabase-bgts'
import { calculateQuote } from '@/lib/quote'
import type { BookingStage, BookingSource } from '@/types/dispatch'

// GET /api/dispatch/bookings
// Query params: stage, source, from_date, to_date, vehicle_id
export async function GET(req: NextRequest) {
  try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getBgtsAdminClient() as any // typed as any for supabase-js compat
  const { searchParams } = new URL(req.url)

  const stage      = searchParams.get('stage')      as BookingStage | null
  const source     = searchParams.get('source')     as BookingSource | null
  const from_date  = searchParams.get('from_date')
  const to_date    = searchParams.get('to_date')
  const vehicle_id = searchParams.get('vehicle_id')

  let query = supabase
    .from('bookings' as any)
    .select('*, vehicle:vehicles(id, reg_no, class, make_model, payload_kg, status_now)')
    .order('trip_date', { ascending: false })

  if (stage)      query = query.eq('stage', stage)
  if (source)     query = query.eq('source', source)
  if (vehicle_id) query = query.eq('vehicle_id', vehicle_id)
  if (from_date)  query = query.gte('trip_date', from_date)
  if (to_date)    query = query.lte('trip_date', to_date)

  const { data, error } = await query

  if (error) {
    console.error('[bookings GET]', error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, error: null })
}

// POST /api/dispatch/bookings
  } catch (e) {
    return NextResponse.json({ data: null, error: e instanceof Error ? e.message : 'Server error' }, { status: 500 })
  }
}
export async function POST(req: NextRequest) {
  const supabase = getBgtsAdminClient()

  let body: Record<string, unknown>
  try { body = await req.json() }
  catch { return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 }) }

  const {
    trip_date, client_name, company_name, phone, email,
    from_loc, to_loc, distance_km, material, pcs_boxes,
    weight_kg, vehicle_id, trip_type, margin_pct, notes, source,
  } = body as Record<string, unknown>

  // Validate required fields
  if (!trip_date || !client_name || !phone || !from_loc || !to_loc || !vehicle_id || !distance_km) {
    return NextResponse.json({ data: null, error: 'Missing required fields' }, { status: 400 })
  }

  // Check for double booking
  const { data: existing } = await supabase
    .from('bookings' as any)
    .select('id')
    .eq('vehicle_id', String(vehicle_id))
    .eq('trip_date', String(trip_date))
    .neq('stage', 'CANCELLED')
    .single()

  if (existing) {
    return NextResponse.json(
      { data: null, error: 'Vehicle already booked on this date' },
      { status: 409 }
    )
  }

  // Calculate rate
  let rate_total: number | null = null
  try {
    const [{ data: varCost }, { data: fixCost }, { data: settings }] = await Promise.all([
      supabase.from('variable_costs').select('*').eq('vehicle_id', String(vehicle_id)).single(),
      supabase.from('fixed_costs').select('*').eq('vehicle_id', String(vehicle_id)).single(),
      supabase.from('global_settings').select('*').single(),
    ])

    if (varCost && fixCost && settings) {
      const breakdown = calculateQuote(
        {
          vehicle_id:  String(vehicle_id),
          distance_km: Number(distance_km),
          trip_type:   String(trip_type) as 'INTRACITY' | 'INTERCITY',
          weight_kg:   Number(weight_kg ?? 0),
          margin_pct:  Number(margin_pct ?? 20),
          material:    String(material) as never,
        },
        varCost,
        fixCost,
        settings,
      )
      rate_total = breakdown.total
    }
  } catch (e) {
    console.warn('[bookings POST] rate calculation failed — saving without rate', e)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).from('bookings').insert({
      trip_date:    String(trip_date),
      client_name:  String(client_name),
      company_name: company_name ? String(company_name) : null,
      phone:        String(phone),
      email:        email ? String(email) : null,
      from_loc:     String(from_loc),
      to_loc:       String(to_loc),
      distance_km:  Number(distance_km),
      material:     String(material ?? 'General Cargo'),
      pcs_boxes:    pcs_boxes ? Number(pcs_boxes) : null,
      weight_kg:    weight_kg ? Number(weight_kg) : null,
      vehicle_id:   String(vehicle_id),
      trip_type:    String(trip_type ?? 'INTERCITY') as 'INTRACITY' | 'INTERCITY',
      margin_pct:   Number(margin_pct ?? 20),
      rate_total,
      stage:        'BOOKED',
      source:       String(source ?? 'ADMIN') as 'ADMIN' | 'CUSTOMER',
      notes:        notes ? String(notes) : null,
    })
    .select('*, vehicle:vehicles(id, reg_no, class, make_model)')
    .single()

  if (error) {
    console.error('[bookings POST]', error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, error: null }, { status: 201 })
}
