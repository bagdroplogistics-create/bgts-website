import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { TrackingForm } from '@/components/forms/TrackingForm'
import { MapPin, Clock, Bell, Smartphone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Track Your Shipment',
  description:
    'Real-time consignment tracking for BGTS freight. Enter your LR number to get live status, location, ETA, and driver contact.',
}

const features = [
  { icon: MapPin,     title: 'Live location',   desc: 'GPS-tracked vehicle position updated every 15 minutes' },
  { icon: Clock,      title: 'Accurate ETA',    desc: 'Dynamic ETA based on current location and traffic' },
  { icon: Bell,       title: 'SMS updates',     desc: 'Automatic status alerts at every milestone' },
  { icon: Smartphone, title: 'WhatsApp POD',    desc: 'Proof of delivery shared instantly on delivery' },
]

export default function TrackingPage() {
  return (
    <>
      <Navbar />

      <main className="pt-header min-h-screen bg-surface-page">
        {/* Header */}
        <div className="bg-white border-b border-ink-ghost/10">
          <div className="container-xl py-10 md:py-14">
            <p className="eyebrow mb-2">Shipment Tracking</p>
            <h1 className="font-display font-black text-4xl md:text-5xl text-ink-strong tracking-tight mb-3">
              Know exactly where your cargo is
            </h1>
            <p className="text-ink-muted text-lg max-w-xl">
              Enter your LR number for real-time GPS tracking, ETA, and a full
              event timeline from pickup to delivery.
            </p>
          </div>
        </div>

        <div className="container-xl py-10 md:py-14">
          <div className="grid lg:grid-cols-3 gap-10 items-start">
            {/* Tracking form — 2/3 width */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-ink-ghost/10 shadow-card p-6 md:p-8">
                <h2 className="font-display font-bold text-lg text-ink-strong mb-6">
                  Track by LR Number
                </h2>
                <TrackingForm />

                {/* Try demo note */}
                <p className="mt-4 text-xs text-ink-muted">
                  Demo: try LR number{' '}
                  <code className="font-mono bg-surface-mid px-1.5 py-0.5 rounded text-brand">
                    BGTS26123456
                  </code>
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Features */}
              <div className="bg-white rounded-2xl border border-ink-ghost/10 p-6">
                <h2 className="font-display font-bold text-sm text-ink-strong mb-5 uppercase tracking-wider">
                  Tracking features
                </h2>
                <ul className="space-y-4">
                  {features.map(({ icon: Icon, title, desc }) => (
                    <li key={title} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-subtle flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-brand" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink-strong">{title}</p>
                        <p className="text-xs text-ink-muted">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Need help */}
              <div className="bg-surface-mid rounded-2xl border border-ink-ghost/10 p-6">
                <h2 className="font-display font-bold text-sm text-ink-strong mb-3">
                  Can't find your shipment?
                </h2>
                <p className="text-sm text-ink-muted mb-4">
                  LR numbers take up to 30 minutes to appear after booking confirmation.
                  For urgent queries, call us directly.
                </p>
                <a
                  href="tel:+916357225722"
                  className="block w-full text-center bg-white border border-ink-ghost/20 rounded-lg py-2.5 text-sm font-semibold text-ink-strong hover:border-brand hover:text-brand transition-colors"
                >
                  +91 63 5722 5722
                </a>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
