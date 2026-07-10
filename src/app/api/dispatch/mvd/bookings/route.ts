import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getBgtsAdminClient } from '@/lib/supabase-bgts'

// ── Email notification ────────────────────────────────────────────────────────
async function sendMvdBookingEmail(booking: Record<string, unknown>) {
  const SMTP_USER = process.env.SMTP_USER
  const SMTP_PASS = process.env.SMTP_PASS
  const SMTP_HOST = process.env.SMTP_HOST ?? 'smtp.gmail.com'
  const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587)
  const TO_EMAIL  = process.env.TO_EMAIL ?? process.env.SERVICE_INQUIRY_EMAIL ?? SMTP_USER

  if (!SMTP_USER || !SMTP_PASS) {
    console.warn('[mvd/bookings] SMTP not configured — email skipped')
    return
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS.replace(/\s/g, '') },
    tls: { rejectUnauthorized: false },
  })

  const subject = `[BGTS Admin] Market Vehicle Booking | ${booking.client_name} | ${booking.from_loc} → ${booking.to_loc} | ${booking.trip_date}`

  const rows: [string, string][] = [
    ['Trip Date',     String(booking.trip_date    ?? '—')],
    ['Client',        String(booking.client_name  ?? '—')],
    ['Company',       String(booking.company_name ?? '') || 'N/A'],
    ['Phone',         String(booking.phone        ?? '—')],
    ['Email',         String(booking.email        ?? '') || 'N/A'],
    ['Route',         `${booking.from_loc ?? '—'} → ${booking.to_loc ?? '—'}`],
    ['Distance',      booking.distance_km ? `${booking.distance_km} km` : '—'],
    ['Vehicle Type',  String(booking.vehicle_type ?? '—')],
    ['Trip Type',     String(booking.trip_type    ?? '—')],
    ['Material',      String(booking.material     ?? '—')],
    ['Weight',        booking.weight_kg  ? `${booking.weight_kg} kg` : '—'],
    ['Pieces/Boxes',  booking.pcs_boxes  ? String(booking.pcs_boxes)  : '—'],
    ['Driver Name',   String(booking.driver_name  ?? '') || 'N/A'],
    ['Driver Phone',  String(booking.driver_phone ?? '') || 'N/A'],
    ['Driver Licence',String(booking.driver_license ?? '') || 'N/A'],
    ['Notes',         String(booking.notes        ?? '') || 'None'],
  ]

  const rowsHtml = rows.map(([k, v], i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafb'}">
      <td style="padding:9px 16px;font-size:13px;color:#6b7280;font-weight:600;width:160px;border-bottom:1px solid #f0f0f0">${k}</td>
      <td style="padding:9px 16px;font-size:13px;color:#111827;border-bottom:1px solid #f0f0f0">${v}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,sans-serif">
  <div style="max-width:580px;margin:32px auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#6d28d9,#7c3aed);padding:24px 28px">
      <div style="font-size:20px;font-weight:900;color:#fff">🚛 BGTS — Market Vehicle Booking</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:4px">Submitted via Admin Dashboard · Arrange market vehicle</div>
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
    console.log('[mvd/bookings] ✅ Email sent to', TO_EMAIL)
  } catch (e) {
    console.error('[mvd/bookings] ❌ Email failed:', e)
  }
}

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
        company_name:   company_name   ? String(company_name)   : null,
        phone:          String(phone),
        email:          email          ? String(email)          : null,
        from_loc:       String(from_loc),
        to_loc:         String(to_loc),
        distance_km:    distance_km    ? Number(distance_km)    : null,
        vehicle_type:   String(vehicle_type),
        material:       String(material),
        pcs_boxes:      pcs_boxes      ? Number(pcs_boxes)      : null,
        weight_kg:      weight_kg      ? Number(weight_kg)      : null,
        trip_type:      String(trip_type ?? 'INTERCITY'),
        margin_pct:     Number(margin_pct ?? 20),
        notes:          notes          ? String(notes)          : null,
        driver_name:    driver_name    ? String(driver_name)    : null,
        driver_phone:   driver_phone   ? String(driver_phone)   : null,
        driver_license: driver_license ? String(driver_license) : null,
        stage:          'BOOKING_RECEIVED',
      })
      .select()
      .single()

    if (error) throw error

    // Send email notification (non-blocking)
    sendMvdBookingEmail({ ...data }).catch(() => {})

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
