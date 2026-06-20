import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

function buildHtml(data: Record<string, unknown>): string {
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
    // PTL extra fields
    ...(data.numberOfPackages ? [['No. of Packages', String(data.numberOfPackages)] as [string, string]] : []),
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
<head><meta charset="utf-8"><title>New ${serviceLabel} Inquiry</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#0C5B35 0%,#138A4F 100%);padding:28px 32px">
      <div style="font-size:22px;font-weight:900;color:#ffffff">⚡ BGTS — New ${serviceLabel}</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.75);margin-top:4px">Booking Inquiry Received — Please follow up within 30 minutes</div>
    </div>
    <div style="background:#f0fdf4;border-bottom:2px solid #dcfce7;padding:16px 32px">
      <span style="font-size:11px;color:#16a34a;font-weight:700;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Booking Reference</span>
      <span style="font-size:26px;font-weight:900;color:#0C5B35;letter-spacing:3px">${data.bookingRef ?? '—'}</span>
    </div>
    <table style="width:100%;border-collapse:collapse">${rowsHtml}</table>
    <div style="padding:20px 32px;background:#f8fafb;border-top:1px solid #e5e7eb">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">
        Submitted via BGTS website · bgtspl@gmail.com
      </p>
    </div>
  </div>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const SMTP_USER = process.env.SMTP_USER
  const SMTP_PASS = process.env.SMTP_PASS
  const SMTP_HOST = process.env.SMTP_HOST ?? 'smtp.gmail.com'
  const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587)

  if (!SMTP_USER || !SMTP_PASS) {
    console.error('[booking] SMTP_USER or SMTP_PASS missing from .env.local')
    return NextResponse.json({ success: false, error: 'Email not configured' }, { status: 500 })
  }

  // Send to the same Gmail account that is authenticated
  const RECIPIENT = SMTP_USER

  const transporter = nodemailer.createTransport({
    host:   SMTP_HOST,
    port:   SMTP_PORT,
    secure: false,
    auth:   { user: SMTP_USER, pass: SMTP_PASS },
    tls:    { rejectUnauthorized: false },
  })

  // Build subject
  const serviceType = String(body.serviceType ?? 'Booking')
  const vehicle     = String(body.vehicleType ?? '')
  const route       = `${body.pickupCity ?? ''} → ${body.deliveryCity ?? ''}`
  const ref         = String(body.bookingRef ?? '')
  const subject     = `[BGTS] New ${serviceType} | ${vehicle} | ${route} | ${ref}`
    .replace(/\s{2,}/g, ' ').trim()

  try {
    const info = await transporter.sendMail({
      from:    `"BGTS Bookings" <${SMTP_USER}>`,
      to:      RECIPIENT,
      replyTo: (body.email as string) ?? undefined,
      subject,
      html:    buildHtml(body),
    })
    console.log('[booking] ✅ Email sent to', RECIPIENT, '| id:', info.messageId)
    return NextResponse.json({ success: true, messageId: info.messageId, to: RECIPIENT })
  } catch (err) {
    console.error('[booking] ❌ SMTP error:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
