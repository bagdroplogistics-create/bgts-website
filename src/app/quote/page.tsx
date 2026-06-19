import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { QuoteForm } from '@/components/forms/QuoteForm'
import { Shield, Clock, FileText, Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Get a Freight Quote',
  description:
    'Instant freight quote for FTL, PTL, Express Parcel, Tanker, and ODC across Gujarat and Maharashtra. Price includes insurance, e-way bill, and GST breakdown.',
}

const trustPoints = [
  { icon: Clock,    text: 'Quote confirmed within 2 hours' },
  { icon: Shield,   text: 'Transit insurance available' },
  { icon: FileText, text: 'GST invoice guaranteed' },
  { icon: Phone,    text: 'Dedicated relationship manager' },
]

export default function QuotePage() {
  return (
    <>
      <Navbar />

      <main className="pt-header min-h-screen bg-surface-page">
        {/* Page header */}
        <div className="bg-white border-b border-ink-ghost/10">
          <div className="container-xl py-10 md:py-14">
            <p className="eyebrow mb-2">Get a Quote</p>
            <h1 className="font-display font-black text-4xl md:text-5xl text-ink-strong tracking-tight mb-3">
              Instant freight estimate
            </h1>
            <p className="text-ink-muted text-lg max-w-xl">
              4 quick steps. Route, cargo, service options, your details — and
              you'll have a complete price with transit time in under 60 seconds.
            </p>
          </div>
        </div>

        <div className="container-xl py-10 md:py-16">
          <div className="grid lg:grid-cols-3 gap-10 items-start">
            {/* Form — takes 2/3 width */}
            <div className="lg:col-span-2">
              <QuoteForm />
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Trust points */}
              <div className="bg-white rounded-2xl border border-ink-ghost/10 p-6">
                <h2 className="font-display font-bold text-sm text-ink-strong mb-4 uppercase tracking-wider">
                  What you get
                </h2>
                <ul className="space-y-3">
                  {trustPoints.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-subtle flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-brand" aria-hidden="true" />
                      </div>
                      <span className="text-sm text-ink-body">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rate reference */}
              <div className="bg-surface-mid rounded-2xl border border-ink-ghost/10 p-6">
                <h2 className="font-display font-bold text-sm text-ink-strong mb-4 uppercase tracking-wider">
                  Indicative rates
                </h2>
                <div className="space-y-2.5">
                  {[
                    { label: 'FTL', rate: '₹68/km', note: 'per vehicle' },
                    { label: 'PTL', rate: '₹22/km', note: 'per kg-km' },
                    { label: 'Express', rate: '₹95/km', note: 'priority lane' },
                    { label: 'Tanker', rate: '₹78/km', note: 'per tanker' },
                    { label: 'Heavy/ODC', rate: '₹120/km', note: 'per axle' },
                  ].map(({ label, rate, note }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-ink-strong">{label}</span>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-brand">{rate}</span>
                        <span className="text-2xs text-ink-ghost ml-1">{note}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-2xs text-ink-ghost mt-3 leading-relaxed">
                  Base rates only. Final quote includes GST, e-way bill, and
                  vehicle type adjustments. Valid corridors only.
                </p>
              </div>

              {/* Call CTA */}
              <div className="rounded-2xl bg-gradient-energy p-5 text-center">
                <p className="text-white/80 text-xs mb-1">Prefer to talk?</p>
                <a
                  href="tel:+916357225722"
                  className="font-display font-black text-white text-xl hover:underline"
                >
                  +91 63 5722 5722
                </a>
                <p className="text-white/70 text-xs mt-1">Mon–Sat, 8am–8pm</p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
