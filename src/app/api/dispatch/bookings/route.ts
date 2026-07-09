import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getBgtsAdminClient } from '@/lib/supabase-bgts'
import { calculateQuote } from '@/lib/quote'
import type { BookingStage, BookingSource } from '@/types/dispatch'

// ── Email notification for admin booking ──────────────────────────────────────
async function sendAdminBookingEmail(booking: Record<string, unknown>) {
  const SMTP_USER = process.env.SMTP_USER
  const SMTP_PASS = process.env.SMTP_PASS
  const SMTP_HOST = process.env.SMTP_HOST ?? 'smtp.gmail.com'
  const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587)
  const TO_EMAIL  = process.env.TO_EMAIL ?? process.env.SERVICE_INQUIRY_EMAIL ?? SMTP_USER

  if (!SMTP_USER || !SMTP_PASS) {
    console.warn('[dispatch/bookings] SMTP not configured — email skipped')
    return
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS.replace(/\s/g, '') },
    tls: { rejectUnauthorized: false },
  })

  const veh = (booking.vehicle as Record<string,unknown> | undefined)
  const regNo   = veh?.reg_no ?? booking.vehicle_id ?? '—'
  const subject = `[BGTS Admin] New Booking | ${booking.client_name} | ${booking.from_loc} → ${booking.to_loc} | ${booking.trip_date}`

  const rows: [string, string][] = [
    ['Trip Date',      String(booking.trip_date    ?? '—')],
    ['Client',         String(booking.client_name  ?? '—')],
    ['Company',        String(booking.company_name ?? '') || 'N/A'],
    ['Phone',          String(booking.phone        ?? '—')],
    ['Email',          String(booking.email        ?? '') || 'N/A'],
    ['Route',          `${booking.from_loc ?? '—'} → ${booking.to_loc ?? '—'}`],
    ['Distance',       booking.distance_km ? `${booking.distance_km} km` : '—'],
    ['Vehicle',        String(regNo)],
    ['Material',       String(booking.material     ?? '—')],
    ['Weight',         booking.weight_kg   ? `${booking.weight_kg} kg` : '—'],
    ['Pieces/Boxes',   booking.pcs_boxes   ? String(booking.pcs_boxes) : '—'],
    ['Rate',           booking.rate_total  ? `₹${Number(booking.rate_total).toLocaleString('en-IN')}` : 'Pending'],
    ['Notes',          String(booking.notes        ?? '') || 'None'],
  ]

  const rowsHtml = rows.map(([k,v], i) => `
    <tr style="background:${i%2===0?'#fff':'#f8fafb'}">
      <td style="padding:9px 16px;font-size:13px;color:#6b7280;font-weight:600;width:160px;border-bottom:1px solid #f0f0f0">${k}</td>
      <td style="padding:9px 16px;font-size:13px;color:#111827;border-bottom:1px solid #f0f0f0">${v}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,sans-serif">
  <div style="max-width:580px;margin:32px auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#C2410C,#EA580C);padding:24px 28px">
      <div style="font-size:20px;font-weight:900;color:#fff">🚛 BGTS — New Admin Booking</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:4px">Created via Admin Dashboard</div>
    </div>
    <table style="width:100%;border-collapse:collapse">${rowsHtml}</table>
    <div style="padding:16px 24px;background:#f8fafb;border-top:1px solid #e5e7eb">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">BGTS Admin Dashboard · bgts.in</p>
    </div>
  </div>
</body></html>`

  try {
    await transporter.verify()
    await transporter.sendMail({ from: `"BGTS Admin" <${SMTP_USER}>`, to: TO_EMAIL, subject, html })
    console.log('[dispatch/bookings] ✅ Email sent to', TO_EMAIL)
  } catch (e) {
    console.error('[dispatch/bookings] ❌ Email failed:', e)
    // Non-fatal — booking is already saved
  }
}

// GET /api/dispatch/bookings
// Query params: stage, source, from_date, to_date, vehicle_id
export async function GET(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = getBgtsAdminClient() as any
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
      stage:        'BOOKING_RECEIVED',
      source:       String(source ?? 'ADMIN') as 'ADMIN' | 'CUSTOMER',
      notes:        notes ? String(notes) : null,
    })
    .select('*, vehicle:vehicles(id, reg_no, class, make_model)')
    .single()

  if (error) {
    console.error('[bookings POST]', error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }

  // Send email notification (non-blocking)
  sendAdminBookingEmail({ ...data }).catch(() => {})

  return NextResponse.json({ data, error: null }, { status: 201 })
}
