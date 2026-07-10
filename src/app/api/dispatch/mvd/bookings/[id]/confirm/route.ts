import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getBgtsAdminClient } from '@/lib/supabase-bgts'

// ── Confirmation email ────────────────────────────────────────────────────────
async function sendConfirmEmail(
  mvd:       Record<string, unknown>,
  confirmed: { broker: string; amount: number | null; vehicle_no: string; booking_ref: string },
) {
  const SMTP_USER = process.env.SMTP_USER
  const SMTP_PASS = process.env.SMTP_PASS
  const SMTP_HOST = process.env.SMTP_HOST ?? 'smtp.gmail.com'
  const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587)
  const TO_EMAIL  = process.env.TO_EMAIL ?? process.env.SERVICE_INQUIRY_EMAIL ?? SMTP_USER

  if (!SMTP_USER || !SMTP_PASS) return

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS.replace(/\s/g, '') },
    tls: { rejectUnauthorized: false },
  })

  const subject = `[BGTS] ✅ Market Vehicle CONFIRMED | ${mvd.client_name} | ${mvd.from_loc} → ${mvd.to_loc} | ${mvd.trip_date}`

  const rows: [string, string][] = [
    ['Status',         '✅ BOOKING CONFIRMED'],
    ['MVD Ref',        confirmed.booking_ref],
    ['Trip Date',      String(mvd.trip_date    ?? '—')],
    ['Client',         String(mvd.client_name  ?? '—')],
    ['Company',        String(mvd.company_name ?? '') || 'N/A'],
    ['Phone',          String(mvd.phone        ?? '—')],
    ['Route',          `${mvd.from_loc ?? '—'} → ${mvd.to_loc ?? '—'}`],
    ['Vehicle Type',   String(mvd.vehicle_type ?? '—')],
    ['Material',       String(mvd.material     ?? '—')],
    ['Confirmed Broker / Agent', confirmed.broker  || '—'],
    ['Confirmed Vehicle No.',    confirmed.vehicle_no || '—'],
    ['Agreed Amount',  confirmed.amount != null ? `₹${Number(confirmed.amount).toLocaleString('en-IN')}` : '—'],
  ]

  const rowsHtml = rows.map(([k, v], i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafb'}">
      <td style="padding:9px 16px;font-size:13px;color:#6b7280;font-weight:600;width:200px;border-bottom:1px solid #f0f0f0">${k}</td>
      <td style="padding:9px 16px;font-size:13px;color:#111827;border-bottom:1px solid #f0f0f0">${v}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#065f46,#059669);padding:24px 28px">
      <div style="font-size:20px;font-weight:900;color:#fff">✅ Market Vehicle — Booking Confirmed</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:4px">Broker confirmed · Vehicle arranged · Appears in Dispatch Board</div>
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
    console.log('[mvd/confirm] ✅ Email sent to', TO_EMAIL)
  } catch (e) {
    console.error('[mvd/confirm] ❌ Email failed:', e)
  }
}

// POST /api/dispatch/mvd/bookings/[id]/confirm
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id }                                        = await params
    const { confirmed_broker, confirmed_amount, confirmed_vehicle_no } = await req.json()
    const sb = getBgtsAdminClient()

    // 1. Fetch the MVD booking
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: mvd, error: mvdErr } = await (sb as any)
      .from('mvd_bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (mvdErr || !mvd) {
      return NextResponse.json({ data: null, error: 'MVD booking not found' }, { status: 404 })
    }

    // 2. Create a Dispatch Board record in bookings table
    //    vehicle_id is null — market vehicle (requires the nullable migration to be run)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newBooking, error: bookErr } = await (sb as any)
      .from('bookings')
      .insert({
        trip_date:    mvd.trip_date,
        client_name:  mvd.client_name,
        company_name: confirmed_broker || mvd.company_name || null,
        phone:        mvd.phone,
        email:        mvd.email        || null,
        from_loc:     mvd.from_loc,
        to_loc:       mvd.to_loc,
        distance_km:  mvd.distance_km  || 0,
        material:     mvd.material,
        pcs_boxes:    mvd.pcs_boxes    || null,
        weight_kg:    mvd.weight_kg    || null,
        vehicle_id:   null,                       // market vehicle — no fleet FK
        trip_type:    mvd.trip_type    || 'INTERCITY',
        margin_pct:   mvd.margin_pct   || 20,
        rate_total:   confirmed_amount || null,
        stage:        'BOOKING_CONFIRMED',
        source:       'ADMIN',
        notes: [
          `🚛 Market Vehicle Booking`,
          confirmed_broker  ? `Broker: ${confirmed_broker}`         : null,
          confirmed_vehicle_no ? `Vehicle: ${confirmed_vehicle_no}` : null,
          `MVD Ref: MVD-${id.slice(0, 8).toUpperCase()}`,
        ].filter(Boolean).join(' · '),
      })
      .select()
      .single()

    if (bookErr) {
      console.error('[mvd/confirm] bookings insert error:', bookErr)
      return NextResponse.json({ data: null, error: String(bookErr.message) }, { status: 500 })
    }

    // 3. Update mvd_bookings with confirmed details + link
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any)
      .from('mvd_bookings')
      .update({
        stage:                'BOOKING_CONFIRMED',
        confirmed_broker:     confirmed_broker     || null,
        confirmed_amount:     confirmed_amount     || null,
        confirmed_vehicle_no: confirmed_vehicle_no || null,
        linked_booking_id:    newBooking.id,
      })
      .eq('id', id)

    // 4. Email notification (non-blocking)
    const bookingRef = `MVD-${id.slice(0, 8).toUpperCase()}`
    sendConfirmEmail(mvd, {
      broker:     confirmed_broker     || '',
      amount:     confirmed_amount     || null,
      vehicle_no: confirmed_vehicle_no || '',
      booking_ref: bookingRef,
    }).catch(() => {})

    return NextResponse.json({ data: newBooking, error: null }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ data: null, error: String(e) }, { status: 500 })
  }
}
