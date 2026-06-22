import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { Truck, Leaf, Shield, Gauge } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Our Fleet',
  description:
    'BGTS operates 2,000+ vehicles across road freight: FTL trucks, PTL vans, ODC trailers, and the BGTS EV cargo fleet — Gujarat and Maharashtra.',
}

const fleetCategories = [
  {
    name: 'Light Commercial Vehicles',
    range: '500 kg – 1.5 MT',
    desc: 'Bolero Pickups, Tata Ace for city-to-city express parcel and same-day deliveries.',
    types: ['Bolero Pickup', 'Tata Ace', 'Mahindra Jeeto'],
    icon: '🛻',
    tag: null,
  },
  {
    name: 'Single-Axle Trucks',
    range: '2 MT – 5 MT',
    desc: 'Medium-duty trucks for PTL and intercity freight across Gujarat corridors.',
    types: ['Tata 407', 'Eicher Pro 2049', 'Ashok Leyland Dost+'],
    icon: '🚛',
    tag: null,
  },
  {
    name: 'Multi-Axle Trucks',
    range: '10 MT – 20 MT',
    desc: 'High-capacity FTL trucks for primary distribution across Gujarat and Maharashtra.',
    types: ['Tata LPS 4018', 'Bharat Benz 3523', 'Ashok Leyland 4923'],
    icon: '🚚',
    tag: null,
  },
  {
    name: 'Trailers & Flatbeds',
    range: '20 MT – 40 MT',
    desc: 'Multi-axle trailers and low-bed vehicles for ODC, infrastructure, and project cargo.',
    types: ['49-ft Flatbed', 'Low-Bed Trailer', 'Semi Low-Bed'],
    icon: '🏗️',
    tag: null,
  },
  {
    name: 'BGTS EV Fleet',
    range: '500 kg – 7 MT',
    desc: "Gujarat's first dedicated EV cargo fleet. Zero tailpipe emissions, 99.5% SLA.",
    types: ['Euler HiLoad EV', 'Tata Ace EV', 'Switch IeV3', 'Tata Ultra E.7'],
    icon: '⚡',
    tag: 'eko',
  },
]

const standards = [
  { icon: Shield, label: 'GPS Tracking', desc: 'Every vehicle tracked 24×7. Live location shared with client.' },
  { icon: Gauge,  label: 'Speed Monitoring', desc: 'Over-speed alerts and driver behaviour scoring.' },
  { icon: Leaf,   label: 'BS6 Compliant', desc: 'Entire diesel fleet meets BS6 emission norms.' },
  { icon: Truck,  label: 'Preventive Maintenance', desc: '30-day maintenance cycles. Sub-24hr breakdown response.' },
]

export default function FleetPage() {
  return (
    <>
      <Navbar />

      <main className="pt-header min-h-screen bg-surface-page">
        {/* Header */}
        <div className="py-16 md:py-24 relative overflow-hidden bg-[#FAFAF8] border-b border-ink-ghost/10">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-transparent pointer-events-none" />
          <div className="container-xl relative z-10">
            <Tag variant="brand" size="sm" className="mb-4">2,000+ Vehicles</Tag>
            <h1 className="font-display font-black text-5xl md:text-6xl text-ink-strong tracking-tight mb-4">
              Built for India&apos;s<br />
              <span className="text-gradient-energy">toughest corridors.</span>
            </h1>
            <p className="text-ink-muted text-xl max-w-2xl">
              From last-mile LCVs to 40-tonne multi-axle trailers — BGTS operates
              the right vehicle for every freight type, route, and service level.
            </p>
          </div>
        </div>

        {/* Fleet categories */}
        <section className="section-py bg-surface-page">
          <div className="container-xl">
            <div className="mb-12">
              <SectionHeading
                eyebrow="Fleet Categories"
                title="Right vehicle for every load"
                align="left"
              />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {fleetCategories.map((cat) => (
                <div
                  key={cat.name}
                  className={`rounded-2xl border p-6 bg-white ${cat.tag === 'eko' ? 'border-eko/25 bg-eko-50' : 'border-ink-ghost/10'}`}
                >
                  <div className="text-3xl mb-3" aria-hidden="true">{cat.icon}</div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-bold text-ink-strong">{cat.name}</h3>
                    {cat.tag === 'eko' && <Tag variant="eko" size="sm">EV</Tag>}
                  </div>
                  <p className="text-xs font-mono text-brand font-semibold mb-2">{cat.range}</p>
                  <p className="text-sm text-ink-muted leading-relaxed mb-4">{cat.desc}</p>
                  <ul className="space-y-1.5">
                    {cat.types.map((t) => (
                      <li key={t} className="flex items-center gap-2 text-xs text-ink-body">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cat.tag === 'eko' ? 'bg-eko' : 'bg-brand'}`} aria-hidden="true" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fleet standards */}
        <section className="section-py bg-white border-t border-ink-ghost/10">
          <div className="container-xl">
            <SectionHeading
              eyebrow="Fleet Standards"
              title="Safety and compliance built in"
              subtitle="Every vehicle in our fleet meets BGTS's internal standards — above and beyond regulatory minimums."
              align="center"
              className="mb-12"
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {standards.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-brand-subtle flex items-center justify-center mx-auto mb-4">
                    <Icon size={22} className="text-brand" aria-hidden="true" />
                  </div>
                  <h3 className="font-display font-bold text-ink-strong mb-2">{label}</h3>
                  <p className="text-sm text-ink-muted">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EkoHaul CTA */}
        <section
          className="section-py"
          style={{ background: 'linear-gradient(135deg, #0C5B35, #138A4F, #119C97)' }}
        >
          <div className="container-xl text-center">
            <Tag variant="eko" size="sm" className="mx-auto mb-4 bg-white/10 text-eko-lime border-eko-lime/20">
              Now Accepting Fleet Orders
            </Tag>
            <h2 className="font-display font-black text-4xl text-white mb-3">
              Ready to go electric?
            </h2>
            <p className="text-white/70 mb-8 max-w-lg mx-auto">
              BGTS EV vehicles are available from 1 to 200+ units under FlexEV,
              DediEV, and FleetEV plans.
            </p>
            <Button
              variant="eko"
              size="lg"
              className="bg-white text-eko hover:bg-eko-50"
              asChild
            >
              <Link href="/BGTSEV">Explore BGTS EV Fleet</Link>
            </Button>
     
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
