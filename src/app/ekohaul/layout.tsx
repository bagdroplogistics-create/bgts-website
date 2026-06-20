import type { Metadata } from 'next'
import { EkoHaulNavbar } from '@/components/layout/EkoHaulNavbar'
import { EkoHaulFooter } from '@/components/layout/EkoHaulFooter'

export const metadata: Metadata = {
  title: {
    default: 'BGTS EV — Gujarat\'s First EV Cargo Fleet | BGTS',
    template: '%s | BGTS EV',
  },
  description:
    'BGTS EV — Gujarat\'s first 100% EV commercial cargo Fleet-as-a-Service. Zero-emission delivery at or below diesel cost. FlexEV, DediEV, and FleetEV plans.',
  keywords: [
    'EV cargo fleet Gujarat',
    'electric delivery vehicles India',
    'BGTS EV',
    'zero emission logistics',
    'fleet as a service India',
    'carbon neutral delivery',
    'BGTS electric vehicles',
    'EV fleet service India',
  ],
  openGraph: {
    title: 'BGTS EV — Gujarat\'s First EV Cargo Fleet',
    description:
      'Zero-emission delivery at or below the cost of diesel. FlexEV, DediEV, and FleetEV plans for every business size.',
    images: [{ url: '/ekohaul-og.png', width: 1200, height: 630 }],
  },
}

export default function EkoHaulLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // data-brand="ekohaul" activates the green CSS token override from globals.css
    <div data-brand="ekohaul">
      <EkoHaulNavbar />
      <main>{children}</main>
      <EkoHaulFooter />
    </div>
  )
}
