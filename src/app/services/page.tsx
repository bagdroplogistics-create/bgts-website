import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { services } from '@/data/services'
import { ArrowRight, Truck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Our Services',
  description:
    'BGTS freight services: FTL, PTL, Express Parcel, Warehousing, Tanker & Bulk, Heavy & ODC, Multimodal, and Contract Logistics across Gujarat and Maharashtra.',
}

export default function ServicesPage() {
  return (
    <>
      <Navbar />

      <main className="pt-header min-h-screen bg-surface-page">
        {/* Header */}
        <div className="bg-white border-b border-ink-ghost/10">
          <div className="container-xl py-10 md:py-14">
            <p className="eyebrow mb-2">Our Services</p>
            <h1 className="font-display font-black text-4xl md:text-5xl text-ink-strong tracking-tight mb-3">
              End-to-end freight solutions
            </h1>
            <p className="text-ink-muted text-lg max-w-xl">
              From dedicated FTL to complex project cargo — every service built on
              BGTS's 75-year network and 99.2% on-time record.
            </p>
          </div>
        </div>

        <div className="container-xl section-py">
          <div className="grid lg:grid-cols-2 gap-6">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group bg-white rounded-2xl border border-ink-ghost/10 p-6 hover:border-brand/30 hover:shadow-card transition-all no-underline"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-display font-bold text-lg text-ink-strong group-hover:text-brand transition-colors">
                        {service.name}
                      </h2>
                      {service.isHighlighted && <Tag variant="brand" size="sm">Popular</Tag>}
                    </div>
                    <p className="text-sm text-ink-muted">{service.tagline}</p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-ink-ghost group-hover:text-brand group-hover:translate-x-1 shrink-0 mt-1 transition-all"
                    aria-hidden="true"
                  />
                </div>

                <p className="text-sm text-ink-body leading-relaxed mb-5 line-clamp-2">
                  {service.description}
                </p>

                <div className="flex flex-wrap gap-4 pt-4 border-t border-ink-ghost/10">
                  <div>
                    <p className="text-2xs text-ink-ghost uppercase tracking-wider mb-0.5">Transit</p>
                    <p className="text-xs font-mono font-semibold text-ink-strong">{service.transitTimeDays}</p>
                  </div>
                  {service.ratePerKm > 0 && (
                    <div>
                      <p className="text-2xs text-ink-ghost uppercase tracking-wider mb-0.5">Base rate</p>
                      <p className="text-xs font-mono font-semibold text-brand">₹{service.ratePerKm}/km</p>
                    </div>
                  )}
                  <div>
                    <p className="text-2xs text-ink-ghost uppercase tracking-wider mb-0.5">Modes</p>
                    <p className="text-xs font-mono font-semibold text-ink-strong capitalize">
                      {service.modes.join(' · ')}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 bg-brand-subtle rounded-2xl p-8 text-center">
            <h2 className="font-display font-bold text-2xl text-ink-strong mb-2">
              Not sure which service fits your cargo?
            </h2>
            <p className="text-ink-muted mb-6">
              Our team will assess your route, weight, and timeline and recommend the best option.
            </p>
            <Button variant="primary" size="lg" icon={<Truck size={16} />} iconPosition="left" asChild>
              <Link href="/quote">Get a Quote & Recommendation</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
