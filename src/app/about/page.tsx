import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'
import { branches, hubs } from '@/data/branches'
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About BGTS',
  description:
    'Baroda Goods Transport Service — 75 years of trusted freight across Gujarat and Maharashtra. Our story, values, network, and leadership.',
}

const milestones = [
  { year: '1950', event: 'Founded in Vadodara as a single-truck road transport operator.' },
  { year: '1965', event: 'Expanded to 5 cities in Gujarat. First tanker fleet acquired.' },
  { year: '1980', event: '20-vehicle fleet serving Ahmedabad, Surat, and Rajkot.' },
  { year: '1998', event: 'Opened Maharashtra operations with Mumbai and Pune hubs.' },
  { year: '2008', event: 'Launched warehousing division. First WMS implementation.' },
  { year: '2015', event: 'GPS fleet tracking deployed across all vehicles.' },
  { year: '2022', event: 'Digital booking platform launched. Pan-India rail tie-ups.' },
  { year: '2024', event: 'EkoHaul EV fleet division launched — Gujarat\'s first EV cargo fleet.' },
  { year: '2025', event: '2,000+ vehicle network. 20+ branches. 99.2% SLA track record.' },
]

const values = [
  {
    title: 'Reliability First',
    desc: "99.2% on-time delivery isn't a target — it's a baseline. Every system, every process, every hire is oriented around keeping this number.",
  },
  {
    title: 'Technology-Led',
    desc: "From GPS tracking to digital LR generation, we invest in technology that makes our clients' supply chains smarter, not just faster.",
  },
  {
    title: 'Deep Industry Expertise',
    desc: '75 years across automotive, chemical, pharma, FMCG, and heavy engineering gives us sector-specific knowledge that generic logistics companies can\'t replicate.',
  },
  {
    title: 'Sustainability Commitment',
    desc: "EkoHaul isn't a marketing initiative — it's our conviction that the logistics industry must decarbonise. We're building Gujarat's EV infrastructure one fleet at a time.",
  },
]

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="pt-header">
        {/* Hero */}
        <section
          className="relative py-20 md:py-28 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #131312 0%, #21211F 100%)' }}
        >
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '48px 48px' }}
            aria-hidden="true"
          />
          <div className="container-xl relative z-10">
            <Tag variant="brand" size="sm" className="mb-4">Est. 1950, Vadodara</Tag>
            <h1 className="font-display font-black text-5xl md:text-6xl text-white tracking-tight leading-tight mb-4">
              75 years of moving<br />
              <span className="text-gradient-energy">India's goods.</span>
            </h1>
            <p className="text-white/70 text-xl max-w-2xl leading-relaxed">
              Baroda Goods Transport Service started with one truck and one promise:
              deliver on time, every time. Seven decades later, that promise runs
              through everything we do.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="section-py bg-surface-page">
          <div className="container-xl">
            <SectionHeading
              eyebrow="Our Values"
              title="What we stand for"
              align="left"
              className="mb-12"
            />
            <div className="grid sm:grid-cols-2 gap-6">
              {values.map((v) => (
                <div key={v.title} className="bg-white rounded-2xl border border-ink-ghost/10 p-6">
                  <div className="w-1 h-10 bg-gradient-energy rounded-pill mb-4" aria-hidden="true" />
                  <h3 className="font-display font-bold text-lg text-ink-strong mb-2">{v.title}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="section-py bg-surface-inverse" aria-labelledby="history-heading">
          <div className="container-xl">
            <SectionHeading
              eyebrow="Our History"
              title="7 decades of milestones"
              theme="dark"
              align="left"
              className="mb-12"
            />
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[84px] top-0 bottom-0 w-px bg-white/10 hidden md:block" aria-hidden="true" />

              <ol className="space-y-6">
                {milestones.map(({ year, event }, i) => (
                  <li key={year} className="flex gap-6 md:gap-10 items-start">
                    <div className="shrink-0 w-16 text-right">
                      <span className="font-mono font-bold text-brand text-sm">{year}</span>
                    </div>
                    <div className="hidden md:flex w-4 justify-center shrink-0 mt-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand border-2 border-surface-inverse" />
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed pt-0.5">{event}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Branch network */}
        <section id="branches" className="section-py bg-surface-page" aria-labelledby="branches-heading">
          <div className="container-xl">
            <div className="mb-10">
              <SectionHeading
                eyebrow="Our Network"
                title="20+ branches across West India"
                subtitle="Gujarat and Maharashtra covered, with 5 major hub facilities handling consolidation and distribution."
                align="left"
              />
            </div>

            {/* Hubs */}
            <div className="mb-8">
              <h3 className="text-xs font-display font-bold uppercase tracking-widest text-ink-muted mb-4">
                Hub Facilities
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {hubs.map((b) => (
                  <div key={b.city} className="bg-white rounded-xl border border-brand/20 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag variant="brand" size="sm">Hub</Tag>
                      <span className="font-display font-bold text-ink-strong">{b.city}</span>
                      <span className="text-xs text-ink-muted">{b.state}</span>
                    </div>
                    <p className="text-xs text-ink-muted mb-3">{b.address}</p>
                    <div className="flex flex-col gap-1.5">
                      <a href={`tel:${b.phone}`} className="flex items-center gap-1.5 text-xs text-ink-body hover:text-brand">
                        <Phone size={11} className="text-brand" aria-hidden="true" />
                        {b.phone}
                      </a>
                      <a href={`mailto:${b.email}`} className="flex items-center gap-1.5 text-xs text-ink-body hover:text-brand">
                        <Mail size={11} className="text-brand" aria-hidden="true" />
                        {b.email}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All branches */}
            <div>
              <h3 className="text-xs font-display font-bold uppercase tracking-widest text-ink-muted mb-4">
                Branch Offices
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {branches.filter((b) => !b.isHub).map((b) => (
                  <div key={b.city} className="bg-white rounded-xl border border-ink-ghost/10 p-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <MapPin size={12} className="text-brand shrink-0" aria-hidden="true" />
                      <span className="font-semibold text-sm text-ink-strong">{b.city}</span>
                    </div>
                    <p className="text-xs text-ink-muted">{b.state}</p>
                    <a href={`tel:${b.phone}`} className="mt-2 block text-xs text-ink-muted hover:text-brand font-mono">
                      {b.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-py bg-brand-subtle border-t border-brand/10">
          <div className="container-xl text-center">
            <h2 className="font-display font-black text-3xl md:text-4xl text-ink-strong mb-3">
              Ready to work with us?
            </h2>
            <p className="text-ink-muted mb-8 max-w-md mx-auto">
              75 years of relationships, built one shipment at a time. Let's start yours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" size="lg" asChild>
                <Link href="/quote">Get a Quote</Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/contact">Contact Us <ArrowRight size={14} /></Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
