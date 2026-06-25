import type { Metadata } from 'next'
import { BookingWizard } from '@/components/ekohaul/BookingWizard'

export const metadata: Metadata = {
  title: 'Book EV Freight — BGTS EV',
  description: 'Book zero-emission freight delivery across Gujarat and Maharashtra. Select your EV vehicle, enter pickup and delivery details, and confirm in under 2 minutes.',
}

export default function EkoHaulBookPage() {
  return <BookingWizard />
}
