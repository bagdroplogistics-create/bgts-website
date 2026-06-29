import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

function buildContactHtml(data: Record<string, unknown>): string {
  const rows: [string, string][] = [
    ['Enquiry Type', String(data.type    ?? '—')],
    ['Name',         String(data.name    ?? '—')],
    ['Email',        String(data.email   ?? '—')],
    ['Mobile',       String(data.phone   ?? '') || 'Not provided'],
    ['Subject',      String(data.subject ?? '—')],
    ['Message',      String(data.message ?? '—')],
  ]

  const rowsHtml = rows.map(([k, v], i) => `
    <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafb'}">
      <td style="padding:10px 16px;font-size:13px;color:#6b7280;font-weight:600;width:140px;border-bottom:1px solid #f0f0f0;white-space:nowrap;vertical-align:top">${k}</td>
      <td style="padding:10px 16px;font-size:13px;color:#111827;border-bottom:1px solid #f0f0f0;white-space:pre-wrap">${v}</td>
    </tr>`).join('')

  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' })

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Contact Form — BGTS</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#C2410C 0%,#EA580C 100%);padding:28px 32px">
      <div style="font-size:22px;font-weight:900;color:#ffffff">✉️ BGTS — New Contact Enquiry</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.80);margin-top:4px">Received ${now} IST · Respond within 4 hours</div>
    </div>
    <table style="width:100%;border-collapse:collapse">${rowsHtml}</table>
    <div style="padding:20px 32px;background:#f8fafb;border-top:1px solid #e5e7eb">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">Submitted via bgts.in/contact</p>
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

  try {
    const SMTP_USER = process.env.SMTP_USER
    const SMTP_PASS = process.env.SMTP_PASS
    const SMTP_HOST = process.env.SMTP_HOST ?? 'smtp.gmail.com'
    const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587)
    const TO_EMAIL  = process.env.TO_EMAIL ?? process.env.SERVICE_INQUIRY_EMAIL ?? SMTP_USER

    if (!SMTP_USER || !SMTP_PASS) {
      console.error('[contact] ❌ SMTP_USER or SMTP_PASS missing')
      return NextResponse.json({ success: false, error: 'Email not configured' }, { status: 500 })
    }

    const transporter = nodemailer.createTransport({
      host:   SMTP_HOST,
      port:   SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth:   { user: SMTP_USER, pass: SMTP_PASS.replace(/\s/g, '') },
      tls:    { rejectUnauthorized: false },
    })

    await transporter.verify()

    const name    = String(body.name    ?? '')
    const email   = String(body.email   ?? '')
    const subject = String(body.subject ?? 'Contact Enquiry')
    const type    = String(body.type    ?? 'general')

    const info = await transporter.sendMail({
      from:    `"BGTS Website" <${SMTP_USER}>`,
      to:      TO_EMAIL,
      replyTo: email || undefined,
      subject: `[BGTS Contact] ${type.toUpperCase()} — ${subject} | ${name}`,
      html:    buildContactHtml(body),
    })

    console.log('[contact] ✅ Email sent → to:', TO_EMAIL, '| id:', info.messageId)

    // Save to website_inquiries (non-fatal)
    try {
      const { getBgtsAdminClient } = await import('@/lib/supabase-bgts')
      const sb = getBgtsAdminClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (sb as any).from('website_inquiries').insert({
        ref_no:      `BGTSCON${Date.now().toString(36).toUpperCase()}`,
        category:    'SERVICE',
        source_form: `Contact Form — ${type}`,
        full_name:   name,
        email:       email || null,
        mobile:      String(body.phone ?? '') || null,
        service_name: subject,
        special_instructions: String(body.message ?? '') || null,
        raw_payload: body,
        status:      'NEW',
      })
    } catch (dbErr) {
      console.warn('[contact] DB save failed (non-fatal):', dbErr)
    }

    return NextResponse.json({ success: true, messageId: info.messageId })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[contact] ❌ Error:', msg)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
