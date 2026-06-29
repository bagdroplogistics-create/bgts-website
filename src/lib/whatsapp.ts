import type { Booking, BookingStage } from '@/types/dispatch'

// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp Message Templates — one per booking stage
// Matches the HTML prototype: changing stage opens a pre-filled WA message.
// Nothing sends automatically — team reviews on their device before sending.
// ─────────────────────────────────────────────────────────────────────────────

export const STAGE_LABELS: Record<BookingStage, string> = {
  // New stages
  BOOKING_RECEIVED:  'Booking Received',
  PAYMENT_PENDING:   'Payment Pending',
  PAYMENT_RECEIVED:  'Payment Received',
  BOOKING_CONFIRMED: 'Booking Confirmed',
  VEHICLE_DISPATCHED:'Vehicle Dispatched',
  IN_TRANSIT:        'In Transit',
  DELIVERED:         'Delivered',
  INVOICE_RAISED:    'Invoice Raised',
  CANCELLED:         'Cancelled',
  // Legacy
  BOOKED:    'Booking Confirmed',
  DISPATCHED:'Vehicle Dispatched',
  INVOICED:  'Invoice Raised',
}

function fmt(booking: Booking): {
  client:   string
  vehicle:  string
  route:    string
  date:     string
  rate:     string
} {
  return {
    client:  booking.client_name + (booking.company_name ? ` (${booking.company_name})` : ''),
    vehicle: booking.vehicle?.reg_no ?? booking.vehicle_id,
    route:   `${booking.from_loc} → ${booking.to_loc}`,
    date:    new Date(booking.trip_date).toLocaleDateString('en-IN', {
               day: 'numeric', month: 'short', year: 'numeric',
             }),
    rate:    booking.rate_total
               ? `₹${booking.rate_total.toLocaleString('en-IN')}`
               : 'as quoted',
  }
}

export function buildWhatsAppMessage(booking: Booking, stage: BookingStage): string {
  const f = fmt(booking)

  const SIG = `\n\n— Baroda Goods Transport Service\n📞 +91 63 5722 5722`
  const INFO = `📅 Date: ${f.date}\n🚛 Vehicle: ${f.vehicle}\n📍 Route: ${f.route}\n💰 Rate: ${f.rate}`

  const templates: Record<BookingStage, string> = {
    BOOKING_RECEIVED:
      `Dear ${f.client},\n\nThank you! We have *received your booking request* 📋\n\n` +
      INFO + `\n\nOur team will review and confirm shortly.` + SIG,

    PAYMENT_PENDING:
      `Dear ${f.client},\n\n*Payment is pending* for your upcoming booking 💳\n\n` +
      INFO + `\n\nKindly arrange the advance payment to confirm your booking.` + SIG,

    PAYMENT_RECEIVED:
      `Dear ${f.client},\n\nWe have *received your payment* ✅\n\n` +
      INFO + `\n\nYour booking will now be confirmed shortly.` + SIG,

    BOOKING_CONFIRMED:
      `Dear ${f.client},\n\nYour booking has been *confirmed* ✅\n\n` +
      INFO + `\n\nOur team will be in touch before dispatch.` + SIG,

    VEHICLE_DISPATCHED:
      `Dear ${f.client},\n\nYour vehicle has been *dispatched* 🚛\n\n` +
      INFO + `\n\nThe vehicle has left our depot and is on the way to pickup.` + SIG,

    IN_TRANSIT:
      `Dear ${f.client},\n\nYour goods are *in transit* 🛣️\n\n` +
      INFO + `\n\nGoods have been loaded and the vehicle is en route to destination.` + SIG,

    DELIVERED:
      `Dear ${f.client},\n\nYour goods have been *delivered successfully* ✅🎉\n\n` +
      INFO + `\n\nPlease confirm receipt at your end. Thank you for choosing BGTS!` + SIG,

    INVOICE_RAISED:
      `Dear ${f.client},\n\nYour *invoice has been raised* 🧾\n\n` +
      `📅 Trip: ${f.date}\n📍 Route: ${f.route}\n💰 Amount: ${f.rate}` +
      `\n\nKindly arrange payment at your earliest convenience.` + SIG,

    CANCELLED:
      `Dear ${f.client},\n\nYour booking for *${f.date}* on route *${f.route}* has been *cancelled*.\n\n` +
      `We apologise for any inconvenience. Please contact us to reschedule.` + SIG,

    // Legacy — same messages mapped to closest new stage
    BOOKED:     `Dear ${f.client},\n\nYour booking with BGTS has been *confirmed* ✅\n\n` + INFO + SIG,
    DISPATCHED: `Dear ${f.client},\n\nYour vehicle has been *dispatched* 🚛\n\n` + INFO + SIG,
    INVOICED:   `Dear ${f.client},\n\nYour *invoice has been raised* 🧾\n\n📅 ${f.date}\n📍 ${f.route}\n💰 ${f.rate}` + SIG,
  }

  return templates[stage]
}

/** Opens WhatsApp Web with the pre-filled message. Call from browser only. */
export function openWhatsApp(phone: string, message: string): void {
  const cleaned = phone.replace(/\D/g, '')
  const number  = cleaned.startsWith('91') ? cleaned : `91${cleaned}`
  const encoded = encodeURIComponent(message)
  window.open(`https://wa.me/${number}?text=${encoded}`, '_blank')
}
