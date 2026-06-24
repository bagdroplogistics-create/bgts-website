import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { BookNowButton } from '@/components/ui/BookNowButton'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'
import { ArrowRight } from 'lucide-react'

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
  { year: '2024', event: "BGTS EV fleet division launched — Gujarat's first EV cargo fleet." },
  { year: '2025', event: 'BGTS EV fleet goes carbon-neutral. Gujarat’s first EV cargo carbon calculator launched, enabling clients to measure, report, and offset freight emissions.' },
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
    desc: "75 years across automotive, chemical, pharma, FMCG, and heavy engineering gives us sector-specific knowledge that generic logistics companies can't replicate.",
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

        {/* ── Hero with background image ── */}
        <section className="relative py-24 md:py-36 overflow-hidden">
          <Image
            src="/hero-2.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
            aria-hidden="true"
          />
          {/* Dark overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.68) 60%, rgba(0,0,0,0.80) 100%)',
            }}
            aria-hidden="true"
          />

          <div className="container-xl relative z-10">
            <Tag variant="brand" size="sm" className="mb-4">Est. 1950, Vadodara</Tag>
            <h1 className="font-display font-black text-5xl md:text-6xl text-white tracking-tight leading-tight mb-4">
              75 years of moving<br />
              <span className="text-gradient-energy">India&apos;s goods.</span>
            </h1>
            <p className="text-white/75 text-xl max-w-2xl leading-relaxed">
              Baroda Goods Transport Service started with one truck and one promise:
              deliver on time, every time. Seven decades later, that promise runs
              through everything we do.
            </p>
          </div>
        </section>

        {/* ── Values ── */}
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

        {/* ── Timeline ── */}
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
              <div className="absolute left-[84px] top-0 bottom-0 w-px bg-white/10 hidden md:block" aria-hidden="true" />
              <ol className="space-y-6">
                {milestones.map(({ year, event }) => (
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


        {/* ── CTA ── */}
        <section className="section-py bg-brand-subtle border-t border-brand/10">
          <div className="container-xl text-center">
            <h2 className="font-display font-black text-3xl md:text-4xl text-ink-strong mb-3">
              Ready to work with us?
            </h2>
            <p className="text-ink-muted mb-8 max-w-md mx-auto">
              75 years of relationships, built one shipment at a time. Let&apos;s start yours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" size="lg" asChild>
                <BookNowButton>Book Now</BookNowButton>
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
