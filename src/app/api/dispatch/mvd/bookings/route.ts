import { NextRequest, NextResponse } from 'next/server'
import { getBgtsAdminClient } from '@/lib/supabase-bgts'

// POST /api/dispatch/mvd/bookings — create a market vehicle booking
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      trip_date, client_name, company_name, phone, email,
      from_loc, to_loc, distance_km, vehicle_type, material,
      pcs_boxes, weight_kg, trip_type, margin_pct, notes,
      driver_name, driver_phone, driver_license,
    } = body

    // Validate required fields
    if (!trip_date || !client_name || !phone || !from_loc || !to_loc || !vehicle_type || !material) {
      return NextResponse.json(
        { data: null, error: 'Missing required fields: trip_date, client_name, phone, from_loc, to_loc, vehicle_type, material' },
        { status: 400 },
      )
    }

    const sb = getBgtsAdminClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (sb as any)
      .from('mvd_bookings')
      .insert({
        trip_date:      String(trip_date),
        client_name:    String(client_name),
        company_name:   company_name  ? String(company_name)  : null,
        phone:          String(phone),
        email:          email         ? String(email)         : null,
        from_loc:       String(from_loc),
        to_loc:         String(to_loc),
        distance_km:    distance_km   ? Number(distance_km)   : null,
        vehicle_type:   String(vehicle_type),
        material:       String(material),
        pcs_boxes:      pcs_boxes     ? Number(pcs_boxes)     : null,
        weight_kg:      weight_kg     ? Number(weight_kg)     : null,
        trip_type:      String(trip_type ?? 'INTERCITY'),
        margin_pct:     Number(margin_pct ?? 20),
        notes:          notes         ? String(notes)         : null,
        driver_name:    driver_name   ? String(driver_name)   : null,
        driver_phone:   driver_phone  ? String(driver_phone)  : null,
        driver_license: driver_license ? String(driver_license) : null,
        stage:          'BOOKING_RECEIVED',
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ data: null, error: String(e) }, { status: 500 })
  }
}

// GET /api/dispatch/mvd/bookings — list recent market vehicle bookings
export async function GET(_req: NextRequest) {
  try {
    const sb = getBgtsAdminClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (sb as any)
      .from('mvd_bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .range(0, 99)

    if (error) throw error
    return NextResponse.json({ data, error: null })
  } catch (e) {
    return NextResponse.json({ data: null, error: String(e) }, { status: 500 })
  }
}
