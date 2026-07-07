// ─────────────────────────────────────────────────────────────────────────────
// BGTS — Server-side WhatsApp notification helper
// Supports: Interakt (recommended), Gupshup, WATI, generic HTTP, or console-log fallback
//
// Required env vars (add to .env.local):
//   WHATSAPP_PROVIDER     = interakt | gupshup | wati | generic  (default: none → logs only)
//   WHATSAPP_API_KEY      = your provider API key
//   WHATSAPP_FROM         = registered WhatsApp business number, e.g. 916357225722
//   WHATSAPP_ADMIN_NUMBER = ops team WhatsApp number, e.g. 916357225722
//   WHATSAPP_API_URL      = API endpoint (required for wati / generic only)
//   WHATSAPP_APP_NAME     = Gupshup app name (gupshup only)
// ─────────────────────────────────────────────────────────────────────────────

export interface WaSendResult {
  sent:     boolean
  method:   string
  to:       string
  error?:   string
}

// ── Core send function ────────────────────────────────────────────────────────

export async function sendWhatsAppMessage(
  to: string,
  message: string,
): Promise<WaSendResult> {
  const provider = (process.env.WHATSAPP_PROVIDER ?? '').toLowerCase()
  const apiKey   = process.env.WHATSAPP_API_KEY
  const apiUrl   = process.env.WHATSAPP_API_URL
  const from     = process.env.WHATSAPP_FROM

  // Normalise phone — strip non-digits, ensure 91 country code
  const phone = to.replace(/\D/g, '')
  const e164  = phone.startsWith('91') ? phone : `91${phone}`

  if (!provider || !apiKey || !from) {
    // Not configured — log so developer can see the message
    console.log(`[WhatsApp NOT CONFIGURED]\nTo: ${e164}\n---\n${message}\n---`)
    return { sent: false, method: 'not_configured', to: e164 }
  }

  try {
    // ── Interakt (recommended for India) ─────────────────────────────────────
    if (provider === 'interakt') {
      // Interakt sends session messages (free-form text within 24h window)
      // Docs: https://developers.interakt.ai/api-reference
      const res = await fetch('https://api.interakt.ai/v1/public/message/', {
        method:  'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          fullPhoneNumber: e164,
          type:            'Text',
          data:            { message },
        }),
      })
      const respBody = await res.text()
      if (!res.ok) throw new Error(`Interakt ${res.status}: ${respBody}`)
      console.log(`[WhatsApp/Interakt] ✅ Sent to ${e164}`)
      return { sent: true, method: 'interakt', to: e164 }
    }

    // ── Gupshup ──────────────────────────────────────────────────────────────
    if (provider === 'gupshup') {
      const gupshupUrl = 'https://api.gupshup.io/wa/api/v1/msg'
      const formData   = new URLSearchParams({
        channel:     'whatsapp',
        source:      from,
        destination: e164,
        message:     JSON.stringify({ type: 'text', text: message }),
        'src.name':  process.env.WHATSAPP_APP_NAME ?? 'BGTS',
      })
      const res = await fetch(gupshupUrl, {
        method:  'POST',
        headers: { apikey: apiKey, 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    formData.toString(),
      })
      const body = await res.text()
      if (!res.ok) throw new Error(`Gupshup ${res.status}: ${body}`)
      console.log(`[WhatsApp/Gupshup] ✅ Sent to ${e164}`)
      return { sent: true, method: 'gupshup', to: e164 }
    }

    // ── WATI ─────────────────────────────────────────────────────────────────
    if (provider === 'wati') {
      if (!apiUrl) throw new Error('WHATSAPP_API_URL required for WATI')
      // WATI: POST /api/v1/sendSessionMessage/{whatsappNumber}
      const url = `${apiUrl.replace(/\/$/, '')}/api/v1/sendSessionMessage/${e164}`
      const res = await fetch(url, {
        method:  'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({ messageText: message }),
      })
      const body = await res.text()
      if (!res.ok) throw new Error(`WATI ${res.status}: ${body}`)
      console.log(`[WhatsApp/WATI] ✅ Sent to ${e164}`)
      return { sent: true, method: 'wati', to: e164 }
    }

    // ── Generic HTTP POST ─────────────────────────────────────────────────────
    if (provider === 'generic') {
      if (!apiUrl) throw new Error('WHATSAPP_API_URL required for generic provider')
      const res = await fetch(apiUrl, {
        method:  'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({ to: e164, from, message }),
      })
      const body = await res.text()
      if (!res.ok) throw new Error(`Generic ${res.status}: ${body}`)
      console.log(`[WhatsApp/Generic] ✅ Sent to ${e164}`)
      return { sent: true, method: 'generic', to: e164 }
    }

    console.warn(`[WhatsApp] Unknown provider: ${provider}`)
    return { sent: false, method: 'unknown_provider', to: e164 }

  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e)
    console.error(`[WhatsApp] ❌ Failed to send to ${e164}:`, errMsg)
    return { sent: false, method: provider, to: e164, error: errMsg }
  }
}

// ── Message builders ──────────────────────────────────────────────────────────

const SIG = `\n\n📞 BGTS Operations: +91 63 5722 5722\n🌐 bgts.in`

export function buildCustomerAvailableMsg(params: {
  name:        string
  pickup:      string
  delivery:    string
  vehicleType: string
  date:        string
}): string {
  const { name, pickup, delivery, vehicleType, date } = params
  const veh = vehicleType ? `\n🚚 Vehicle: ${vehicleType}` : ''
  const dt  = date        ? `\n📅 Date: ${date}`            : ''
  return (
    `Hi ${name},\n\n` +
    `🎉 *Great news! Vehicles are available* for your requested route.\n\n` +
    `📍 *Route:* ${pickup} → ${delivery}${veh}${dt}\n\n` +
    `Our BGTS team will contact you shortly to confirm the booking and share the final quotation.\n\n` +
    `Thank you for choosing BGTS — your trusted transport partner!` +
    SIG
  )
}

export function buildCustomerUnavailableMsg(params: {
  name:        string
  pickup:      string
  delivery:    string
  vehicleType: string
  date:        string
}): string {
  const { name, pickup, delivery, vehicleType, date } = params
  const veh = vehicleType ? `\n🚚 Vehicle: ${vehicleType}` : ''
  const dt  = date        ? `\n📅 Date: ${date}`            : ''
  return (
    `Hi ${name},\n\n` +
    `Thank you for your enquiry with BGTS.\n\n` +
    `📍 *Route:* ${pickup} → ${delivery}${veh}${dt}\n\n` +
    `We are currently checking vehicle availability for your requested route. ` +
    `Our team will contact you shortly with the *best available option*.\n\n` +
    `We appreciate your patience and look forward to serving you!` +
    SIG
  )
}

export function buildAdminNotificationMsg(params: {
  ref:          string
  name:         string
  company:      string
  mobile:       string
  email:        string
  pickup:       string
  delivery:     string
  vehicleType:  string
  goods:        string
  date:         string
  available:    boolean
  availableCount: number
}): string {
  const { ref, name, company, mobile, email, pickup, delivery,
          vehicleType, goods, date, available, availableCount } = params

  const co  = company ? ` (${company})` : ''
  const veh = vehicleType || 'Any'
  const availStatus = available
    ? `✅ *${availableCount} fleet vehicle(s) AVAILABLE* — confirm with customer`
    : `⚠️ *NO fleet vehicle available* — arrange market vehicle or alternative`

  return (
    `🔔 *New Booking Enquiry — BGTS*\n\n` +
    `📋 *Ref:* ${ref}\n` +
    `👤 *Customer:* ${name}${co}\n` +
    `📞 *Mobile:* ${mobile}\n` +
    `📧 *Email:* ${email || 'Not provided'}\n\n` +
    `📍 *Route:* ${pickup} → ${delivery}\n` +
    `🚚 *Vehicle:* ${veh}\n` +
    `📦 *Goods:* ${goods || 'Not specified'}\n` +
    `📅 *Date:* ${date || 'Not specified'}\n\n` +
    availStatus + `\n\n` +
    `⏰ Please contact the customer within 30 minutes.`
  )
}
