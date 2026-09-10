import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// ── rate-limit: max 5 per IP per 10 min ──────────────────────────────────
const rateMap = new Map<string, { count: number; reset: number }>()
function checkRate(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + 10 * 60 * 1000 })
    return true
  }
  if (entry.count >= 5) return false
  entry.count++
  return true
}

function buildEmailHtml(data: Record<string, string>): string {
  const now = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short',
  })
  const rows: [string, string][] = [
    ['Name',             data.name            ?? '—'],
    ['Company',          data.company          || '—'],
    ['Phone',            data.phone            ?? '—'],
    ['Email',            data.email            || '—'],
    ['Vehicle Required', data.vehicle_required ?? '—'],
    ['Source',           data.source_page ? `BGTS Website — ${data.source_page}` : 'BGTS Website'],
    ['Submitted At',     now + ' IST'],
  ]
  const rowsHtml = rows.map(([k, v], i) => `
    <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafb'}">
      <td style="padding:10px 16px;font-size:13px;color:#6b7280;font-weight:600;width:160px;border-bottom:1px solid #f0f0f0;white-space:nowrap;vertical-align:top">${k}</td>
      <td style="padding:10px 16px;font-size:13px;color:#111827;border-bottom:1px solid #f0f0f0">${v}</td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#C2410C 0%,#EA580C 100%);padding:28px 32px">
      <div style="font-size:22px;font-weight:900;color:#ffffff">&#128667; New Vehicle Inquiry &#8212; BGTS Website</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.80);margin-top:4px">Received ${now} IST &middot; Contact within 2 hours</div>
    </div>
    <table style="width:100%;border-collapse:collapse">${rowsHtml}</table>
    <div style="padding:20px 32px;background:#f8fafb;border-top:1px solid #e5e7eb">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">Submitted via bgts.in &mdash; Vehicle Inquiry Form</p>
    </div>
  </div>
</body>
</html>`
}

async function sendWhatsApp(data: Record<string, string>) {
  const now = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short',
  })
  const message = [
    '🚛 *New BGTS Website Inquiry*',
    '',
    `*Name:* ${data.name ?? '—'}`,
    `*Company:* ${data.company || '—'}`,
    `*Phone:* ${data.phone ?? '—'}`,
    `*Email:* ${data.email || '—'}`,
    `*Vehicle Required:* ${data.vehicle_required ?? '—'}`,
    `*Source:* ${data.source_page ? `Website — ${data.source_page}` : 'Website'}`,
    `*Time:* ${now} IST`,
  ].join('\n')

  // Supports UltraMSG, WA-Web.js proxy, or any POST-based WhatsApp API
  // Set WHATSAPP_API_URL and WHATSAPP_API_TOKEN in environment variables
  const apiUrl  = process.env.WHATSAPP_API_URL
  const token   = process.env.WHATSAPP_API_TOKEN
  const numbers = ['+916357225722', '+919998665328']

  if (!apiUrl || !token) {
    console.warn('[vehicle-inquiry] WHATSAPP_API_URL / WHATSAPP_API_TOKEN not set — skipping WA')
    return
  }

  await Promise.allSettled(
    numbers.map(to =>
      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token, to, body: message }),
      })
        .then(r => console.log('[vehicle-inquiry] WA sent to', to, r.status))
        .catch(e => console.warn('[vehicle-inquiry] WA failed to', to, e))
    )
  )
}

const VALID_VEHICLES = ['3 Wheeler', 'Bolero', 'Tempo', 'Truck', 'Trailer']

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  if (!checkRate(ip)) {
    return NextResponse.json({ success: false, error: 'Too many requests. Try again later.' }, { status: 429 })
  }

  let body: Record<string, string> = {}
  try { body = await req.json() } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }

  // Honeypot — bots fill the hidden _hp field
  if (body._hp) return NextResponse.json({ success: true })

  // Validate required fields
  const name    = (body.name             ?? '').trim()
  const phone   = (body.phone            ?? '').trim()
  const vehicle = (body.vehicle_required ?? '').trim()

  if (!name || !phone || !vehicle) {
    return NextResponse.json({ success: false, error: 'Name, Phone, and Vehicle are required.' }, { status: 422 })
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ success: false, error: 'Enter a valid 10-digit Indian mobile number.' }, { status: 422 })
  }
  if (!VALID_VEHICLES.includes(vehicle)) {
    return NextResponse.json({ success: false, error: 'Invalid vehicle selection.' }, { status: 422 })
  }

  // Email notification (non-fatal — inquiry is always saved to DB regardless)
  const SMTP_USER = process.env.SMTP_USER
  const SMTP_PASS = process.env.SMTP_PASS
  const SMTP_HOST = process.env.SMTP_HOST ?? 'smtp.gmail.com'
  const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587)
  const TO_EMAIL  = process.env.SERVICE_INQUIRY_EMAIL ?? process.env.TO_EMAIL ?? 'info@bgts.in'

  if (!SMTP_USER || !SMTP_PASS) {
    console.warn('[vehicle-inquiry] SMTP not configured — skipping email')
  } else {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_PORT === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS.replace(/\s/g, '') },
        tls: { rejectUnauthorized: false },
      })
      await transporter.sendMail({
        from:    `"BGTS Website" <${SMTP_USER}>`,
        to:      TO_EMAIL,
        replyTo: body.email || undefined,
        subject: `New Vehicle Inquiry — BGTS Website | ${vehicle} | ${name}`,
        html:    buildEmailHtml(body),
      })
      console.log('[vehicle-inquiry] ✅ Email sent to', TO_EMAIL)
    } catch (err) {
      console.error('[vehicle-inquiry] ❌ Email failed (non-fatal):', err)
    }
  }

  // WhatsApp (non-fatal)
  sendWhatsApp(body).catch(() => {})

  // Supabase lead storage (non-fatal)
  try {
    const { getBgtsAdminClient } = await import('@/lib/supabase-bgts')
    const sb = getBgtsAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from('website_inquiries').insert({
      ref_no:       `BGTSVIQ${Date.now().toString(36).toUpperCase()}`,
      category:     'SERVICE',
      source_form:  'website_vehicle_inquiry',
      full_name:    name,
      email:        body.email || null,
      mobile:       phone,
      service_name: vehicle,
      special_instructions: body.company ? `Company: ${body.company}` : null,
      raw_payload:  body,
      status:       'NEW',
    })
  } catch (e) {
    console.warn('[vehicle-inquiry] DB save failed (non-fatal):', e)
  }

  return NextResponse.json({ success: true })
}
