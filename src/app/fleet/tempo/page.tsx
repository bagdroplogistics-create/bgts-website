import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { FleetSubPageHero } from '@/components/sections/FleetSubPageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { Truck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Tempo Fleet | BGTS Transport',
  description:
    'BGTS Tempo fleet — Tata 407, Eicher Pro 2049, Ashok Leyland Dost+ for intercity PTL freight and corridor runs across Gujarat and Maharashtra.',
}

const vehicles = [
  {
    name: 'Tata 407',
    capacity: '2 MT – 3 MT',
    use: 'Intercity PTL, industrial parts, short-haul distribution.',
  },
  {
    name: 'Eicher Pro 2049',
    capacity: '3 MT – 4 MT',
    use: 'Medium-duty intercity and cross-district freight runs.',
  },
  {
    name: 'Ashok Leyland Dost+',
    capacity: '1.5 MT – 2.5 MT',
    use: 'PTL parcels, FMCG distribution, city–town corridors.',
  },
]

export default function TempoFleetPage() {
  return (
    <>
      <Navbar />

      <main className="pt-header min-h-screen bg-surface-page">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-ink-ghost/10">
          <div className="container-xl py-3 flex items-center gap-2 text-sm text-ink-muted">
            <Link href="/fleet" className="hover:text-brand transition-colors">Fleet</Link>
            <span aria-hidden="true">/</span>
            <span className="text-ink-strong font-medium">Tempo</span>
          </div>
        </div>

        {/* Hero */}
        <FleetSubPageHero
          image="/bgts-hero-5.jpg"
          imageAlt="BGTS tempo fleet on intercity routes — PTL freight across Gujarat corridors"
          tagLabel="Medium Commercial"
          headlineLine1="Tempo Fleet"
          headlineAccent="Reliable intercity hauls."
          subtitle="BGTS Tempo vehicles cover intercity PTL runs and corridor freight across Gujarat — Tata 407, Eicher Pro 2049, and Ashok Leyland Dost+."
        />
        {/* CTA below hero */}
        <div className="bg-white border-b border-ink-ghost/10 py-4">
          <div className="container-xl flex flex-wrap gap-3">
            <Button variant="primary" size="md" icon={<Truck size={15} />} iconPosition="left" asChild>
              <Link href="/quote">Get a Quote</Link>
            </Button>
            <Button variant="outline" size="md" asChild>
              <Link href="/fleet">← All Fleet</Link>
            </Button>
          </div>
        </div>

        {/* Vehicle listing */}
        <section className="section-py bg-surface-page">
          <div className="container-xl">
            <SectionHeading
              eyebrow="Tempo Vehicles"
              title="Vehicles in this category"
              align="left"
              className="mb-10"
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((v) => (
                <div
                  key={v.name}
                  className="rounded-2xl border border-ink-ghost/10 bg-white p-6"
                >
                  <div className="text-3xl mb-3" aria-hidden="true">🚐</div>
                  <h2 className="font-display font-bold text-ink-strong text-lg mb-1">{v.name}</h2>
                  <p className="text-xs font-mono text-brand font-semibold mb-3">{v.capacity}</p>
                  <p className="text-sm text-ink-muted leading-relaxed">{v.use}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Inquiry CTA */}
        <section className="section-py bg-white border-t border-ink-ghost/10">
          <div className="container-xl text-center max-w-2xl mx-auto">
            <h2 className="font-display font-black text-3xl text-ink-strong mb-3">
              Need a Tempo vehicle?
            </h2>
            <p className="text-ink-muted mb-8">
              Share your load and route — we&apos;ll match the right tempo and timeline for you.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="primary" size="lg" icon={<Truck size={16} />} iconPosition="left" asChild>
                <Link href="/quote">Get a Quote</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Internal links */}
        <section className="py-10 bg-surface-page border-t border-ink-ghost/10">
          <div className="container-xl">
            <p className="text-sm text-ink-muted mb-4 font-medium">Explore other fleet categories</p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Pickup', href: '/fleet/pickup' },
                { label: 'Truck', href: '/fleet/truck' },
                { label: 'Trailer', href: '/fleet/trailer' },
                { label: 'All Fleet', href: '/fleet' },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="px-4 py-2 rounded-lg border border-ink-ghost/20 bg-white text-sm text-ink-body hover:text-brand hover:border-brand/30 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
