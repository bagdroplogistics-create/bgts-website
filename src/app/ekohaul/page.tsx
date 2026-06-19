import type { Metadata } from 'next'
import Link from 'next/link'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ekoFleetPlans } from '@/data/ekohaul-vehicles'
import { CheckCircle, Zap, Leaf, BarChart3, ArrowRight, Truck } from 'lucide-react'

export const metadata: Metadata = {
  title: "EkoHaul — Gujarat's First 100% EV Cargo Fleet",
  description:
    "EkoHaul by BGTS: zero-emission commercial cargo delivery at or below diesel cost. FlexEV, DediEV, and FleetEV plans. Now operating in Ahmedabad, Surat, Vadodara.",
}

// ─── Static data ──────────────────────────────────────────────────────────

const ekoStats = [
  { value: '74%', label: 'CO₂ reduction vs diesel', sub: 'grid-powered' },
  { value: '97%', label: 'CO₂ reduction vs diesel', sub: 'solar-powered' },
  { value: '15–30%', label: 'Cost savings', sub: 'vs diesel fleet' },
  { value: '99.5%', label: 'Fleet uptime SLA', sub: 'FleetEV plan' },
]

const vehicles = [
  {
    emoji: '⚡',
    type: 'Three-Wheeler',
    make: 'Euler HiLoad EV',
    payload: '688 kg',
    range: '120 km',
    charge: '3.5 hrs',
    ideal: 'Last-mile, urban lanes',
  },
  {
    emoji: '🚐',
    type: 'Mini Truck',
    make: 'Tata Ace EV',
    payload: '550 kg',
    range: '154 km',
    charge: '3.8 hrs',
    ideal: 'City distribution',
  },
  {
    emoji: '🚚',
    type: 'Small CV',
    make: 'Switch IeV3',
    payload: '1,000 kg',
    range: '100 km',
    charge: '5.0 hrs',
    ideal: 'FMCG & retail routes',
  },
  {
    emoji: '🛻',
    type: 'Intermediate CV',
    make: 'Tata Ultra E.7',
    payload: '7,000 kg',
    range: '70 km',
    charge: '6.5 hrs',
    ideal: 'Hub-to-hub, heavy loads',
  },
]

const howItWorks = [
  {
    step: '01',
    title: 'Choose your plan',
    desc: 'FlexEV for on-demand access, DediEV for dedicated fleet, FleetEV for enterprise-scale operations.',
  },
  {
    step: '02',
    title: 'We deploy your fleet',
    desc: 'Vehicles, drivers, charging infrastructure advisory, and the EkoHaul ops dashboard — all set up within 7–14 days.',
  },
  {
    step: '03',
    title: 'Move zero-emission, save cost',
    desc: 'Monthly BRSR-ready ESG report, real-time tracking, and transparent per-km or fixed billing.',
  },
]

const tierColors: Record<string, { bg: string; border: string; badge: string }> = {
  'flex-ev':  { bg: 'bg-white', border: 'border-eko/20', badge: 'bg-eko/10 text-eko' },
  'dedi-ev':  { bg: 'bg-eko-50', border: 'border-eko/40', badge: 'bg-eko text-white' },
  'fleet-ev': { bg: 'bg-white', border: 'border-eko/20', badge: 'bg-eko/10 text-eko' },
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function EkoHaulPage() {
  return (
    <div className="pt-header">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[90vh] flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0C5B35 0%, #138A4F 55%, #119C97 100%)' }}
      >
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
          aria-hidden="true"
        />
        {/* Glow orb */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
          style={{ background: '#00A854' }}
          aria-hidden="true"
        />

        <div className="container-xl relative z-10 py-20 md:py-28">
          <Tag
            variant="eko"
            size="sm"
            className="mb-6 bg-white/15 text-white border-white/20"
          >
            Now accepting fleet orders · Gujarat &amp; Maharashtra
          </Tag>

          <h1 className="font-display font-black text-5xl md:text-7xl text-white tracking-tight leading-[1.0] mb-6">
            Gujarat's first<br />
            <span className="text-eko-lime">100% EV cargo</span><br />
            fleet service.
          </h1>

          <p className="text-white/75 text-xl md:text-2xl max-w-xl leading-relaxed mb-10">
            Zero-emission delivery at or below the cost of diesel.
            Fleet-as-a-Service for every business size.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              variant="eko"
              size="xl"
              className="bg-white text-eko hover:bg-eko-50"
              icon={<Truck size={18} />}
              iconPosition="left"
              asChild
            >
              <Link href="/ekohaul/book">Get EV Fleet Quote</Link>
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="border-white/40 text-white hover:bg-white/10 hover:border-white hover:text-white"
              icon={<BarChart3 size={18} />}
              iconPosition="left"
              asChild
            >
              <Link href="/ekohaul/esg">Carbon Calculator</Link>
            </Button>
          </div>

          {/* Hero stats row */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {ekoStats.map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/15">
                <p className="font-display font-black text-3xl text-eko-lime mb-0.5">{stat.value}</p>
                <p className="text-white/80 text-xs leading-snug">{stat.label}</p>
                <p className="text-white/50 text-xs">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fleet Plans ────────────────────────────────────────────────── */}
      <section className="section-py bg-surface-page" id="plans">
        <div className="container-xl">
          <SectionHeading
            eyebrow="Fleet Plans"
            title="The right EV plan for every scale"
            subtitle="From single-vehicle on-demand access to full enterprise fleet digitalisation — EkoHaul scales with your business."
            align="center"
            className="mb-14"
          />

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {ekoFleetPlans.map((plan) => {
              const colors = tierColors[plan.tier]
              const isPopular = plan.tier === 'dedi-ev'
              return (
                <div
                  key={plan.tier}
                  className={`relative rounded-2xl border-2 p-7 flex flex-col ${colors.bg} ${colors.border} ${isPopular ? 'shadow-xl shadow-eko/15 scale-[1.02]' : ''}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-eko text-white text-xs font-display font-bold px-4 py-1 rounded-full whitespace-nowrap">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-5">
                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 ${colors.badge}`}>
                      {plan.minVehicles}
                      {plan.maxVehicles ? `–${plan.maxVehicles}` : '+'} vehicles
                    </span>
                    <h3 className="font-display font-black text-2xl text-ink-strong mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-eko font-semibold mb-3">{plan.tagline}</p>
                    <p className="text-sm text-ink-muted leading-relaxed">{plan.description}</p>
                  </div>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <CheckCircle size={15} className="text-eko shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="text-sm text-ink-body">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-ink-ghost/10 pt-4 mb-5">
                    <p className="text-xs text-ink-ghost mb-1">SLA</p>
                    <p className="text-xs text-ink-body font-medium">{plan.sla}</p>
                    {plan.commitmentMonths > 0 && (
                      <p className="text-xs text-ink-ghost mt-1">{plan.commitmentMonths}-month commitment</p>
                    )}
                  </div>

                  <Button
                    variant={isPopular ? 'eko' : 'outline'}
                    size="md"
                    className={`w-full ${!isPopular ? 'border-eko text-eko hover:bg-eko hover:text-white' : ''}`}
                    icon={<ArrowRight size={15} />}
                    iconPosition="right"
                    asChild
                  >
                    <Link href={`/ekohaul/book?plan=${plan.tier}`}>
                      Get {plan.name} Quote
                    </Link>
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Vehicle Showcase ───────────────────────────────────────────── */}
      <section className="section-py bg-white border-t border-ink-ghost/10">
        <div className="container-xl">
          <SectionHeading
            eyebrow="EV Fleet"
            title="Right vehicle for every route"
            align="left"
            className="mb-10"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {vehicles.map((v) => (
              <div
                key={v.make}
                className="bg-eko-50 border border-eko/15 rounded-2xl p-5"
              >
                <div className="text-4xl mb-4" aria-hidden="true">{v.emoji}</div>
                <p className="text-xs font-mono font-semibold text-eko uppercase tracking-wider mb-1">
                  {v.type}
                </p>
                <h3 className="font-display font-bold text-ink-strong mb-3">{v.make}</h3>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-ghost">Payload</span>
                    <span className="font-mono font-bold text-ink-strong">{v.payload}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-ghost">Range/charge</span>
                    <span className="font-mono font-bold text-ink-strong">{v.range}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-ghost">Charge time</span>
                    <span className="font-mono font-bold text-ink-strong">{v.charge}</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg px-3 py-2">
                  <p className="text-2xs text-ink-ghost uppercase tracking-wider mb-0.5">Best for</p>
                  <p className="text-xs text-eko font-semibold">{v.ideal}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <section
        className="section-py"
        style={{ background: 'linear-gradient(180deg, #F0FAF4 0%, #E8F7EF 100%)' }}
      >
        <div className="container-xl">
          <SectionHeading
            eyebrow="How EkoHaul Works"
            title="Zero-emission in 3 steps"
            align="center"
            className="mb-14"
          />

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div
              className="hidden md:block absolute top-8 left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] h-px bg-eko/20"
              aria-hidden="true"
            />

            {howItWorks.map((step) => (
              <div key={step.step} className="text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-eko flex items-center justify-center mx-auto mb-5 relative z-10">
                  <span className="font-display font-black text-xl text-white">{step.step}</span>
                </div>
                <h3 className="font-display font-bold text-ink-strong text-lg mb-3">{step.title}</h3>
                <p className="text-ink-muted text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ESG / Carbon Impact ───────────────────────────────────────── */}
      <section className="section-py bg-surface-page">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — impact numbers */}
            <div>
              <Tag variant="eko" size="sm" className="mb-4">ESG & Sustainability</Tag>
              <h2 className="font-display font-black text-4xl text-ink-strong tracking-tight mb-4">
                Real carbon data.<br />BRSR-ready reports.
              </h2>
              <p className="text-ink-muted leading-relaxed mb-8">
                Every EkoHaul vehicle generates monthly ESG data — CO₂ avoided,
                PM2.5 reduction, cost savings — formatted for your BRSR sustainability
                report. No manual calculations, no greenwashing.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: Leaf, label: 'CO₂ avoided', value: 'Up to 97%', sub: 'solar-powered EVs' },
                  { icon: Zap, label: 'Cost parity', value: 'Day 1', sub: 'vs diesel fleet' },
                  { icon: BarChart3, label: 'BRSR report', value: 'Monthly', sub: 'auto-generated' },
                  { icon: CheckCircle, label: 'Scope 1 & 2', value: 'Certified', sub: 'emission data' },
                ].map(({ icon: Icon, label, value, sub }) => (
                  <div
                    key={label}
                    className="bg-white border border-ink-ghost/10 rounded-xl p-4"
                  >
                    <div className="w-8 h-8 rounded-lg bg-eko/10 flex items-center justify-center mb-3">
                      <Icon size={16} className="text-eko" aria-hidden="true" />
                    </div>
                    <p className="font-display font-black text-xl text-ink-strong mb-0.5">{value}</p>
                    <p className="text-xs font-semibold text-eko">{label}</p>
                    <p className="text-2xs text-ink-ghost">{sub}</p>
                  </div>
                ))}
              </div>

              <Button
                variant="eko"
                size="lg"
                icon={<BarChart3 size={16} />}
                iconPosition="left"
                asChild
              >
                <Link href="/ekohaul/esg">
                  Try the Carbon Calculator
                </Link>
              </Button>
            </div>

            {/* Right — methodology box */}
            <div className="bg-white border border-eko/20 rounded-2xl p-8">
              <p className="text-xs font-mono font-semibold text-eko uppercase tracking-wider mb-6">
                Calculation Methodology
              </p>
              <div className="space-y-4">
                {[
                  { label: 'Diesel emission factor', value: '2.68 kg CO₂/litre' },
                  { label: 'Indian grid emission factor', value: '0.71 kg CO₂/kWh' },
                  { label: 'Solar emission factor', value: '0.04 kg CO₂/kWh' },
                  { label: 'PM2.5 diesel baseline', value: '0.4 g/km (BS6)' },
                  { label: 'Tree absorption rate', value: '21 kg CO₂/year' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-ink-ghost/10 last:border-0">
                    <span className="text-sm text-ink-muted">{label}</span>
                    <span className="font-mono text-sm font-bold text-ink-strong">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-eko-50 rounded-xl p-4">
                <p className="text-xs text-eko leading-relaxed">
                  All emission factors align with the Bureau of Energy Efficiency (BEE)
                  and IPCC AR6 methodology. Reports are formatted for SEBI BRSR
                  compliance (Principle 6, Essential Indicators).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section
        className="section-py"
        style={{ background: 'linear-gradient(135deg, #0C5B35, #138A4F, #119C97)' }}
      >
        <div className="container-xl text-center">
          <Tag
            variant="eko"
            size="sm"
            className="mx-auto mb-5 bg-white/15 text-white border-white/20"
          >
            Fleet orders open · Min 1 vehicle
          </Tag>
          <h2 className="font-display font-black text-4xl md:text-5xl text-white tracking-tight mb-4">
            Ready to go electric?
          </h2>
          <p className="text-white/70 text-lg max-w-lg mx-auto mb-10">
            Get a customised EV fleet proposal in 48 hours. No obligation.
            We'll match the right plan to your route, volume, and ESG targets.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              variant="eko"
              size="xl"
              className="bg-white text-eko hover:bg-eko-50"
              icon={<Truck size={18} />}
              iconPosition="left"
              asChild
            >
              <Link href="/ekohaul/book">Get EV Fleet Quote</Link>
            </Button>
            <Button
              variant="ghost"
              size="xl"
              className="text-white hover:bg-white/10"
              asChild
            >
              <a href="tel:+916357225722">Call +91 63 5722 5722</a>
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}
