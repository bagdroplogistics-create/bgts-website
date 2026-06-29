import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

function buildInquiryHtml(data: Record<string, unknown>): string {
  const rows: [string, string][] = [
    ['Inquiry Reference', String(data.refNo         ?? '—')],
    ['Service Type',      String(data.serviceName   ?? '—')],
    ['Customer Name',     String(data.fullName      ?? '—')],
    ['Company',           String(data.companyName   ?? '') || 'N/A'],
    ['Mobile',            String(data.mobile        ?? '—')],
    ['Email',             String(data.email         ?? '—')],
    ['Origin City',       String(data.originCity    ?? '—')],
    ['Destination City',  String(data.destinationCity ?? '') || 'N/A'],
    ['Pickup Date',       String(data.pickupDate    ?? '') || 'N/A'],
    ['Goods Type',        String(data.goodsType     ?? '—')],
    ['Weight / Load',     String(data.weightLoad    ?? '—')],
    ...(data.numberOfPackages    ? [['No. of Packages',       String(data.numberOfPackages)]    as [string,string]] : []),
    ...(data.serviceSpecific     ? [['Service-Specific Info', String(data.serviceSpecific)]     as [string,string]] : []),
    ...(data.specialInstructions ? [['Special Instructions',  String(data.specialInstructions)] as [string,string]] : []),
    ...(data.additionalRequirements ? [['Additional Requirements', String(data.additionalRequirements)] as [string,string]] : []),
  ]

  const rowsHtml = rows.map(([k, v], i) => `
    <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafb'}">
      <td style="padding:10px 16px;font-size:13px;color:#6b7280;font-weight:600;width:220px;border-bottom:1px solid #f0f0f0;white-space:nowrap">${k}</td>
      <td style="padding:10px 16px;font-size:13px;color:#111827;border-bottom:1px solid #f0f0f0">${v}</td>
    </tr>`).join('')

  const serviceName = String(data.serviceName ?? 'Service')
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' })

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Service Inquiry — ${serviceName}</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:640px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#0C5B35 0%,#138A4F 100%);padding:28px 32px">
      <div style="font-size:22px;font-weight:900;color:#ffffff">🚛 BGTS — New Service Inquiry</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.75);margin-top:4px">${serviceName} · Received ${now} IST</div>
    </div>
    <div style="background:#f0fdf4;border-bottom:2px solid #dcfce7;padding:16px 32px">
      <span style="font-size:11px;color:#16a34a;font-weight:700;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Inquiry Reference</span>
      <span style="font-size:26px;font-weight:900;color:#0C5B35;letter-spacing:3px">${data.refNo ?? '—'}</span>
    </div>
    <table style="width:100%;border-collapse:collapse">${rowsHtml}</table>
    <div style="padding:20px 32px;background:#f8fafb;border-top:1px solid #e5e7eb">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">
        Submitted via BGTS website · Respond within 2 hours · info@bgts.in
      </p>
    </div>
  </div>
</body>
</html>`
}

function buildConfirmationHtml(data: Record<string, unknown>): string {
  const serviceName = String(data.serviceName ?? 'Service')
  const refNo       = String(data.refNo ?? '—')
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short' })

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Thank You for Contacting BGTS</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#0C5B35 0%,#138A4F 100%);padding:28px 32px">
      <div style="font-size:22px;font-weight:900;color:#ffffff">Thank You for Contacting BGTS</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.75);margin-top:4px">We've received your inquiry and will be in touch shortly.</div>
    </div>
    <div style="padding:28px 32px">
      <p style="font-size:15px;color:#374151;margin:0 0 20px">Dear ${data.fullName ?? 'Customer'},</p>
      <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 24px">
        Thank you for reaching out to Baroda Goods Transport Service. We have received your inquiry for
        <strong style="color:#0C5B35">${serviceName}</strong> and our team will contact you within <strong>2 hours</strong>.
      </p>
      <div style="background:#f0fdf4;border:1px solid #dcfce7;border-radius:12px;padding:20px 24px;margin-bottom:24px">
        <div style="font-size:11px;color:#16a34a;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Your Inquiry Reference</div>
        <div style="font-size:28px;font-weight:900;color:#0C5B35;letter-spacing:3px">${refNo}</div>
        <div style="font-size:12px;color:#6b7280;margin-top:6px">Submitted on ${now} IST</div>
      </div>
      <div style="background:#f9fafb;border-radius:12px;padding:20px 24px;margin-bottom:24px">
        <div style="font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px">Inquiry Summary</div>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <tr><td style="color:#6b7280;padding:4px 0;width:140px">Service</td><td style="color:#111827;font-weight:600">${serviceName}</td></tr>
          <tr><td style="color:#6b7280;padding:4px 0">Route</td><td style="color:#111827;font-weight:600">${data.originCity ?? '—'} → ${data.destinationCity || 'N/A'}</td></tr>
          <tr><td style="color:#6b7280;padding:4px 0">Goods</td><td style="color:#111827;font-weight:600">${data.goodsType ?? '—'}</td></tr>
          <tr><td style="color:#6b7280;padding:4px 0">Load</td><td style="color:#111827;font-weight:600">${data.weightLoad ?? '—'}</td></tr>
        </table>
      </div>
      <div style="border-top:1px solid #e5e7eb;padding-top:20px">
        <div style="font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px">BGTS Contact</div>
        <p style="font-size:13px;color:#6b7280;margin:0 0 4px">📞 +91 63 5722 5722</p>
        <p style="font-size:13px;color:#6b7280;margin:0 0 4px">✉️ info@bgts.in</p>
        <p style="font-size:13px;color:#6b7280;margin:0">📍 Nr Natraj Cinema, Pratapgunj Naka, Vadodara — 390002, Gujarat, India</p>
      </div>
    </div>
    <div style="padding:16px 32px;background:#f8fafb;border-top:1px solid #e5e7eb">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">
        © Baroda Goods Transport Service Pvt. Ltd. · Est. 1950, Vadodara
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
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const SMTP_USER = process.env.SMTP_USER
  const SMTP_PASS = process.env.SMTP_PASS
  const SMTP_HOST = process.env.SMTP_HOST ?? 'smtp.gmail.com'
  const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587)
  const INQUIRY_EMAIL = process.env.TO_EMAIL ?? process.env.SERVICE_INQUIRY_EMAIL ?? SMTP_USER

  if (!SMTP_USER || !SMTP_PASS) {
    return NextResponse.json({ success: false, error: 'Email not configured' }, { status: 500 })
  }

  const transporter = nodemailer.createTransport({
    host:   SMTP_HOST,
    port:   SMTP_PORT,
    secure: false,
    auth:   { user: SMTP_USER, pass: SMTP_PASS.replace(/\s/g, '') },
    tls:    { rejectUnauthorized: false },
  })

  const serviceName = String(body.serviceName ?? 'Service')
  const refNo       = String(body.refNo ?? '')
  const customerEmail = String(body.email ?? '')

  // 1 — Verify SMTP, then send inquiry notification to BGTS
  try {
    await transporter.verify()
    const info = await transporter.sendMail({
      from:    `"BGTS Inquiries" <${SMTP_USER}>`,
      to:      INQUIRY_EMAIL,
      replyTo: customerEmail || undefined,
      subject: `New Service Inquiry - ${serviceName} - BGTS [${refNo}]`,
      html:    buildInquiryHtml(body),
    })
    console.log('[service-inquiry] ✅ Inquiry email sent | id:', info.messageId)
  } catch (err) {
    console.error('[service-inquiry] ❌ Inquiry email failed:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }

  // 2 — Send confirmation to customer (non-fatal if it fails)
  if (customerEmail) {
    try {
      await transporter.sendMail({
        from:    `"BGTS — Baroda Goods Transport" <${SMTP_USER}>`,
        to:      customerEmail,
        subject: `Thank You for Contacting BGTS — Ref: ${refNo}`,
        html:    buildConfirmationHtml(body),
      })
      console.log('[service-inquiry] ✅ Confirmation sent to', customerEmail)
    } catch (err) {
      console.warn('[service-inquiry] ⚠️ Confirmation email failed (non-fatal):', err)
    }
  }


  // ── Save to Supabase website_inquiries ──────────────────────────────────────
  try {
    const { getBgtsAdminClient } = await import('@/lib/supabase-bgts')
    const sb = getBgtsAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from('website_inquiries').insert({
      ref_no:                  refNo,
      category:                'SERVICE',
      source_form:             serviceName,
      full_name:               String(body.fullName        ?? ''),
      company_name:            String(body.companyName     ?? '') || null,
      mobile:                  String(body.mobile          ?? ''),
      email:                   customerEmail || null,
      origin_city:             String(body.originCity      ?? '') || null,
      destination_city:        String(body.destinationCity ?? '') || null,
      pickup_date:             String(body.pickupDate      ?? '') || null,
      goods_type:              String(body.goodsType       ?? '') || null,
      weight_range:            String(body.weightLoad      ?? '') || null,
      no_of_packages:          body.numberOfPackages ? Number(body.numberOfPackages) : null,
      service_name:            serviceName,
      service_specific:        String(body.serviceSpecific        ?? '') || null,
      special_instructions:    String(body.specialInstructions    ?? '') || null,
      additional_requirements: String(body.additionalRequirements ?? '') || null,
      raw_payload:             body,
      status:                  'NEW',
    })
  } catch (dbErr) {
    console.warn('[service-inquiry] DB save failed (non-fatal):', dbErr)
  }
  return NextResponse.json({ success: true, refNo })
}
