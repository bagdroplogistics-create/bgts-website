import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import {
  sendWhatsAppMessage,
  buildCustomerAvailableMsg,
  buildCustomerUnavailableMsg,
  buildAdminNotificationMsg,
} from '@/lib/whatsapp-notify'

// ── Vehicle availability check ────────────────────────────────────────────────
// Maps website vehicle type labels → DB vehicle class codes
const VEHICLE_CLASS_MAP: Record<string, string[]> = {
  'lcv':       ['LCV', 'LGV'],
  'pickup':    ['LCV', 'LGV'],
  'taurus':    ['MCV', 'MGV'],
  'open':      ['MGV', 'HCV'],
  'dala':      ['MGV', 'HCV'],
  'container': ['HCV'],
  'trailer':   ['TRAILER'],
  'flatbed':   ['TRAILER'],
  'odc':       ['HCV', 'TRAILER'],
  'crane':     ['OTHER'],
  'tanker':    ['TANKER'],
  'packers':   ['OTHER'],
  'movers':    ['OTHER'],
}

function resolveVehicleClasses(vehicleType: string): string[] {
  const lower = vehicleType.toLowerCase()
  const matches = new Set<string>()
  for (const [keyword, classes] of Object.entries(VEHICLE_CLASS_MAP)) {
    if (lower.includes(keyword)) classes.forEach(c => matches.add(c))
  }
  return matches.size > 0 ? Array.from(matches) : []
}

interface AvailabilityResult {
  available:  boolean
  count:      number
  vehicleIds: string[]
}

async function checkVehicleAvailability(
  date: string,
  vehicleType: string,
): Promise<AvailabilityResult> {
  try {
    const { getBgtsAdminClient } = await import('@/lib/supabase-bgts')
    const sb = getBgtsAdminClient()

    // Step 1 — find all fleet vehicles that are currently AVAILABLE
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let vehicleQuery = (sb as any)
      .from('vehicles')
      .select('id, class, status_now')
      .eq('status_now', 'AVAILABLE')

    const classes = vehicleType ? resolveVehicleClasses(vehicleType) : []
    if (classes.length > 0) {
      vehicleQuery = vehicleQuery.in('class', classes)
    }

    const { data: vehicles, error: vErr } = await vehicleQuery
    if (vErr || !vehicles || vehicles.length === 0) {
      return { available: false, count: 0, vehicleIds: [] }
    }

    const vehicleIds: string[] = vehicles.map((v: { id: string }) => v.id)

    // Step 2 — exclude vehicles already booked on this date
    if (date) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: booked } = await (sb as any)
        .from('bookings')
        .select('vehicle_id')
        .in('vehicle_id', vehicleIds)
        .eq('trip_date', date)
        .neq('stage', 'CANCELLED')

      const bookedIds = new Set((booked ?? []).map((b: { vehicle_id: string }) => b.vehicle_id))
      const freeVehicles = vehicleIds.filter(id => !bookedIds.has(id))

      return {
        available:  freeVehicles.length > 0,
        count:      freeVehicles.length,
        vehicleIds: freeVehicles,
      }
    }

    return { available: vehicleIds.length > 0, count: vehicleIds.length, vehicleIds }
  } catch (e) {
    console.error('[availability] check failed (non-fatal):', e)
    // If check fails, assume unavailable — safer to under-promise
    return { available: false, count: 0, vehicleIds: [] }
  }
}

// ── Admin email HTML ──────────────────────────────────────────────────────────
function buildHtml(data: Record<string, unknown>, available: boolean, availCount: number): string {
  const availBadge = available
    ? `<div style="background:#d1fae5;border:1px solid #6ee7b7;border-radius:8px;padding:12px 20px;margin-bottom:16px">
        <span style="color:#065f46;font-weight:700;font-size:14px">✅ ${availCount} Fleet Vehicle(s) Available — Confirm with Customer</span>
       </div>`
    : `<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px 20px;margin-bottom:16px">
        <span style="color:#92400e;font-weight:700;font-size:14px">⚠️ No Fleet Vehicle Available — Arrange Market Vehicle or Alternative</span>
       </div>`

  const rows: [string, string][] = [
    ['Booking Reference', String(data.bookingRef        ?? '—')],
    ['Vehicle',           String(data.vehicleType       ?? '—')],
    ['Origin City',       String(data.pickupCity        ?? '—')],
    ['Destination City',  String(data.deliveryCity      ?? '—')],
    ['Pickup Date',       String(data.pickupDate        ?? '—')],
    ['Pickup Time',       String(data.pickupTime        ?? '—')],
    ['Goods Type',        String(data.goodsType         ?? '—')],
    ['Weight Range',      String(data.weightRange       ?? '—')],
    ['Customer Name',     String(data.fullName          ?? '—')],
    ['Company',           String(data.companyName       ?? '') || 'N/A'],
    ['Mobile',            String(data.mobile            ?? '—')],
    ['Email',             String(data.email             ?? '—')],
    ['Special Notes',     String(data.specialInstructions ?? '') || 'None'],
    ...(data.numberOfPackages   ? [['No. of Packages', String(data.numberOfPackages)]   as [string, string]] : []),
    ...(data.additionalServices ? [['Add-on Services', String(data.additionalServices)] as [string, string]] : []),
  ]

  const rowsHtml = rows.map(([k, v], i) => `
    <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafb'}">
      <td style="padding:10px 16px;font-size:13px;color:#6b7280;font-weight:600;width:200px;border-bottom:1px solid #f0f0f0;white-space:nowrap">${k}</td>
      <td style="padding:10px 16px;font-size:13px;color:#111827;border-bottom:1px solid #f0f0f0">${v}</td>
    </tr>`).join('')

  const serviceLabel = data.serviceType ? String(data.serviceType) : 'BGTS Booking'

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New ${serviceLabel}</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#C2410C 0%,#EA580C 100%);padding:28px 32px">
      <div style="font-size:22px;font-weight:900;color:#ffffff">📦 BGTS — New ${serviceLabel}</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.80);margin-top:4px">Booking received — call customer as soon as possible</div>
    </div>
    <div style="background:#fff7ed;border-bottom:2px solid #fed7aa;padding:16px 32px">
      <span style="font-size:11px;color:#c2410c;font-weight:700;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Booking Reference</span>
      <span style="font-size:26px;font-weight:900;color:#9a3412;letter-spacing:3px">${data.bookingRef ?? '—'}</span>
    </div>
    <div style="padding:16px 32px 0">${availBadge}</div>
    <table style="width:100%;border-collapse:collapse">${rowsHtml}</table>
    <div style="padding:20px 32px;background:#f8fafb;border-top:1px solid #e5e7eb">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">BGTS Website Booking · bgts.in</p>
    </div>
  </div>
</body>
</html>`
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const SMTP_USER  = process.env.SMTP_USER
  const SMTP_PASS  = process.env.SMTP_PASS
  const SMTP_HOST  = process.env.SMTP_HOST  ?? 'smtp.gmail.com'
  const SMTP_PORT  = Number(process.env.SMTP_PORT ?? 587)
  const TO_EMAIL   = process.env.TO_EMAIL ?? process.env.SERVICE_INQUIRY_EMAIL ?? SMTP_USER
  const ADMIN_WA   = process.env.WHATSAPP_ADMIN_NUMBER

  // ── 1. Check vehicle availability ─────────────────────────────────────────
  const pickupDate   = String(body.pickupDate   ?? '')
  const vehicleType  = String(body.vehicleType  ?? '')
  const customerName = String(body.fullName     ?? 'Customer')
  const pickupCity   = String(body.pickupCity   ?? '')
  const deliveryCity = String(body.deliveryCity ?? '')
  const customerMobile = String(body.mobile     ?? '')

  const availability = await checkVehicleAvailability(pickupDate, vehicleType)
  console.log(`[booking] Availability check → available: ${availability.available}, count: ${availability.count}`)

  // ── 2. WhatsApp to customer ────────────────────────────────────────────────
  const customerMsg = availability.available
    ? buildCustomerAvailableMsg({
        name:        customerName,
        pickup:      pickupCity,
        delivery:    deliveryCity,
        vehicleType,
        date:        pickupDate,
      })
    : buildCustomerUnavailableMsg({
        name:        customerName,
        pickup:      pickupCity,
        delivery:    deliveryCity,
        vehicleType,
        date:        pickupDate,
      })

  if (customerMobile) {
    const customerWa = await sendWhatsAppMessage(customerMobile, customerMsg)
    console.log(`[booking] Customer WA → ${customerWa.method} | sent: ${customerWa.sent}`)
  }

  // ── 3. WhatsApp to admin team ──────────────────────────────────────────────
  const adminMsg = buildAdminNotificationMsg({
    ref:            String(body.bookingRef  ?? '—'),
    name:           customerName,
    company:        String(body.companyName ?? ''),
    mobile:         customerMobile,
    email:          String(body.email       ?? ''),
    pickup:         pickupCity,
    delivery:       deliveryCity,
    vehicleType,
    goods:          String(body.goodsType   ?? ''),
    date:           pickupDate,
    available:      availability.available,
    availableCount: availability.count,
  })

  if (ADMIN_WA) {
    const adminWa = await sendWhatsAppMessage(ADMIN_WA, adminMsg)
    console.log(`[booking] Admin WA → ${adminWa.method} | sent: ${adminWa.sent}`)
  } else {
    console.log('[booking] WHATSAPP_ADMIN_NUMBER not set — admin WA skipped')
    console.log('[booking] Admin WA message:\n', adminMsg)
  }

  // ── 4. Email to admin (existing flow, unchanged) ───────────────────────────
  if (!SMTP_USER || !SMTP_PASS) {
    console.error('[booking] ❌ SMTP_USER or SMTP_PASS missing from .env.local')
    return NextResponse.json({ success: false, error: 'Email not configured' }, { status: 500 })
  }

  const smtpPass    = SMTP_PASS.replace(/\s/g, '')
  const transporter = nodemailer.createTransport({
    host:   SMTP_HOST,
    port:   SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth:   { user: SMTP_USER, pass: smtpPass },
    tls:    { rejectUnauthorized: false },
  })

  const vehicle = String(body.vehicleType  ?? '')
  const route   = `${body.pickupCity ?? ''} → ${body.deliveryCity ?? ''}`
  const ref     = String(body.bookingRef ?? '')
  const svcType = String(body.serviceType ?? 'Booking')
  const subject = `[BGTS] New ${svcType} | ${vehicle} | ${route} | Ref: ${ref}`

  try {
    await transporter.verify()
    const info = await transporter.sendMail({
      from:    `"BGTS Bookings" <${SMTP_USER}>`,
      to:      TO_EMAIL,
      replyTo: (body.email as string) ?? undefined,
      subject,
      html:    buildHtml(body, availability.available, availability.count),
    })
    console.log('[booking] ✅ Email sent → to:', TO_EMAIL, '| id:', info.messageId)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[booking] ❌ SMTP error:', msg)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }

  // ── 5. Save to Supabase website_inquiries ─────────────────────────────────
  try {
    const { getBgtsAdminClient } = await import('@/lib/supabase-bgts')
    const sb = getBgtsAdminClient()
    const svcTypeStr = String(body.serviceType ?? '')
    const refStr     = String(body.bookingRef  ?? '')
    const vehStr     = String(body.vehicleType ?? body.vehicle ?? '')
    const isEV =
      svcTypeStr.toLowerCase().includes('ev')     ||
      refStr.toUpperCase().startsWith('BGTSEV')   ||
      vehStr.toLowerCase().includes('ev')         ||
      vehStr.toLowerCase().includes('electric')
    const category =
      isEV                                      ? 'EV'  :
      svcTypeStr.toLowerCase().includes('ptl')  ? 'PTL' : 'FTL'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from('website_inquiries').insert({
      ref_no:               String(body.bookingRef        ?? ''),
      category,
      source_form:          String(body.serviceType       ?? ''),
      full_name:            String(body.fullName          ?? ''),
      company_name:         String(body.companyName       ?? '') || null,
      mobile:               customerMobile,
      email:                String(body.email             ?? '') || null,
      origin_city:          pickupCity    || null,
      destination_city:     deliveryCity  || null,
      pickup_date:          pickupDate    || null,
      goods_type:           String(body.goodsType         ?? '') || null,
      weight_range:         String(body.weightRange       ?? '') || null,
      vehicle_type:         vehicleType   || null,
      no_of_packages:       body.numberOfPackages  ? Number(body.numberOfPackages)  : null,
      additional_services:  String(body.additionalServices  ?? '') || null,
      special_instructions: String(body.specialInstructions ?? '') || null,
      raw_payload:          body,
      status:               'NEW',
    })
  } catch (dbErr) {
    console.warn('[booking] DB save failed (non-fatal):', dbErr)
  }

  return NextResponse.json({
    success:     true,
    available:   availability.available,
    fleetCount:  availability.count,
  })
}
