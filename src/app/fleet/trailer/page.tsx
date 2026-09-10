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
  title: 'Trailer Fleet | BGTS Transport',
  description:
    'BGTS Trailer fleet — 49-ft Flatbed, Low-Bed Trailer, Semi Low-Bed for ODC, infrastructure, and project cargo across India.',
}

const vehicles = [
  {
    name: '49-ft Flatbed',
    capacity: '20 MT – 30 MT',
    use: 'Steel coils, structural steel, large machinery, infrastructure cargo.',
  },
  {
    name: 'Low-Bed Trailer',
    capacity: '30 MT – 40 MT',
    use: 'ODC loads, heavy construction equipment, transformers, excavators.',
  },
  {
    name: 'Semi Low-Bed',
    capacity: '25 MT – 35 MT',
    use: 'Project cargo, industrial plant equipment, over-dimensional consignments.',
  },
]

export default function TrailerFleetPage() {
  return (
    <>
      <Navbar />

      <main className="pt-header min-h-screen bg-surface-page">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-ink-ghost/10">
          <div className="container-xl py-3 flex items-center gap-2 text-sm text-ink-muted">
            <Link href="/fleet" className="hover:text-brand transition-colors">Fleet</Link>
            <span aria-hidden="true">/</span>
            <span className="text-ink-strong font-medium">Trailer</span>
          </div>
        </div>

        {/* Hero */}
        <FleetSubPageHero
          image="/bgts-hero-3.jpg"
          imageAlt="BGTS heavy haulage and ODC trailer fleet — industrial project cargo across India"
          tagLabel="ODC & Project Cargo"
          headlineLine1="Trailer Fleet"
          headlineAccent="Built for the heaviest loads."
          subtitle="BGTS trailers and flatbeds move ODC, infrastructure, and project cargo that standard trucks cannot — 49-ft Flatbed, Low-Bed, and Semi Low-Bed."
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
              eyebrow="Trailer Vehicles"
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
                  <div className="text-3xl mb-3" aria-hidden="true">🏗️</div>
                  <h2 className="font-display font-bold text-ink-strong text-lg mb-1">{v.name}</h2>
                  <p className="text-xs font-mono text-brand font-semibold mb-3">{v.capacity}</p>
                  <p className="text-sm text-ink-muted leading-relaxed">{v.use}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ODC note */}
        <section className="py-12 bg-white border-t border-ink-ghost/10">
          <div className="container-xl">
            <div className="rounded-2xl border border-brand/15 bg-brand-subtle p-6 md:p-8 max-w-3xl">
              <h3 className="font-display font-bold text-ink-strong text-lg mb-2">
                ODC & Heavy Haulage
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                Over-dimensional cargo (ODC) requires special permits, route surveys, and
                escort vehicles. BGTS handles the complete ODC movement process —
                from permit applications to safe delivery. Contact our team for a
                project-specific assessment.
              </p>
            </div>
          </div>
        </section>

        {/* Inquiry CTA */}
        <section className="section-py bg-surface-page border-t border-ink-ghost/10">
          <div className="container-xl text-center max-w-2xl mx-auto">
            <h2 className="font-display font-black text-3xl text-ink-strong mb-3">
              Need a Trailer or Flatbed?
            </h2>
            <p className="text-ink-muted mb-8">
              Share your load dimensions and origin — our team will assess route feasibility and quote accordingly.
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
        <section className="py-10 bg-white border-t border-ink-ghost/10">
          <div className="container-xl">
            <p className="text-sm text-ink-muted mb-4 font-medium">Explore other fleet categories</p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Pickup', href: '/fleet/pickup' },
                { label: 'Tempo', href: '/fleet/tempo' },
                { label: 'Truck', href: '/fleet/truck' },
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
