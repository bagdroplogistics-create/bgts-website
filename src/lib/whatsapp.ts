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

  const templates: Record<BookingStage, string> = {
    BOOKED: `Dear ${f.client},\n\nYour booking with BGTS has been *confirmed* ✅\n\n` +
      `📅 Date: ${f.date}\n🚛 Vehicle: ${f.vehicle}\n📍 Route: ${f.route}\n` +
      `💰 Rate: ${f.rate}\n\nOur team will be in touch before dispatch.\n\n` +
      `— Baroda Goods Transport Service\n📞 +91 63 5722 5722`,

    DISPATCHED: `Dear ${f.client},\n\nYour vehicle has been *dispatched* 🚛\n\n` +
      `📅 Date: ${f.date}\n🚛 Vehicle: ${f.vehicle}\n📍 Route: ${f.route}\n\n` +
      `The vehicle has left our depot and is on the way to pickup.\n\n` +
      `— Baroda Goods Transport Service\n📞 +91 63 5722 5722`,

    IN_TRANSIT: `Dear ${f.client},\n\nYour goods are *in transit* 🛣️\n\n` +
      `📅 Date: ${f.date}\n🚛 Vehicle: ${f.vehicle}\n📍 Route: ${f.route}\n\n` +
      `Goods have been loaded and the vehicle is en route to destination.\n\n` +
      `— Baroda Goods Transport Service\n📞 +91 63 5722 5722`,

    DELIVERED: `Dear ${f.client},\n\nYour goods have been *delivered successfully* ✅🎉\n\n` +
      `📅 Date: ${f.date}\n🚛 Vehicle: ${f.vehicle}\n📍 Route: ${f.route}\n\n` +
      `Please confirm receipt at your end. Thank you for choosing BGTS!\n\n` +
      `— Baroda Goods Transport Service\n📞 +91 63 5722 5722`,

    INVOICED: `Dear ${f.client},\n\nYour *invoice has been raised* 🧾\n\n` +
      `📅 Trip Date: ${f.date}\n📍 Route: ${f.route}\n💰 Amount: ${f.rate}\n\n` +
      `Kindly arrange payment at your earliest convenience. ` +
      `Please reach out for any queries.\n\n` +
      `— Baroda Goods Transport Service\n📞 +91 63 5722 5722`,

    CANCELLED: `Dear ${f.client},\n\nWe regret to inform you that your booking for *${f.date}* ` +
      `on route *${f.route}* has been *cancelled*.\n\n` +
      `We apologise for any inconvenience. Please contact us to reschedule.\n\n` +
      `— Baroda Goods Transport Service\n📞 +91 63 5722 5722`,
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
