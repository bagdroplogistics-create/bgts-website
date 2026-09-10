import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { Truck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Truck Fleet | BGTS Transport',
  description:
    'BGTS Truck fleet — Tata LPS 4018, Bharat Benz 3523, Ashok Leyland 4923 for high-capacity FTL and primary distribution across Gujarat and Maharashtra.',
}

const vehicles = [
  {
    name: 'Tata LPS 4018',
    capacity: '10 MT – 14 MT',
    use: 'FTL primary distribution, industrial freight, inter-state corridors.',
  },
  {
    name: 'Bharat Benz 3523',
    capacity: '14 MT – 18 MT',
    use: 'Heavy FTL, bulk materials, manufacturing supply chains.',
  },
  {
    name: 'Ashok Leyland 4923',
    capacity: '18 MT – 20 MT',
    use: 'High-tonnage FTL, Gujarat–Maharashtra primary lanes.',
  },
]

export default function TruckFleetPage() {
  return (
    <>
      <Navbar />

      <main className="pt-header min-h-screen bg-surface-page">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-ink-ghost/10">
          <div className="container-xl py-3 flex items-center gap-2 text-sm text-ink-muted">
            <Link href="/fleet" className="hover:text-brand transition-colors">Fleet</Link>
            <span aria-hidden="true">/</span>
            <span className="text-ink-strong font-medium">Truck</span>
          </div>
        </div>

        {/* Hero */}
        <div className="py-16 md:py-24 relative overflow-hidden bg-[#FAFAF8] border-b border-ink-ghost/10">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-transparent pointer-events-none" />
          <div className="container-xl relative z-10">
            <Tag variant="brand" size="sm" className="mb-4">Heavy Commercial</Tag>
            <h1 className="font-display font-black text-5xl md:text-6xl text-ink-strong tracking-tight mb-4">
              Truck Fleet<br />
              <span className="text-gradient-energy">High capacity. Primary lanes.</span>
            </h1>
            <p className="text-ink-muted text-xl max-w-2xl mb-8">
              BGTS multi-axle trucks carry 10–20 MT loads on primary FTL routes across
              Gujarat and Maharashtra — Tata LPS 4018, Bharat Benz 3523, Ashok Leyland 4923.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="md" icon={<Truck size={15} />} iconPosition="left" asChild>
                <Link href="/quote">Get a Quote</Link>
              </Button>
              <Button variant="outline" size="md" asChild>
                <Link href="/fleet">← All Fleet</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Vehicle listing */}
        <section className="section-py bg-surface-page">
          <div className="container-xl">
            <SectionHeading
              eyebrow="Truck Vehicles"
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
                  <div className="text-3xl mb-3" aria-hidden="true">🚛</div>
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
              Need a Truck for your freight?
            </h2>
            <p className="text-ink-muted mb-8">
              Tell us your origin, destination, and tonnage — we&apos;ll get the right truck moving.
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
                { label: 'Tempo', href: '/fleet/tempo' },
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
