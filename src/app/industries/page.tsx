import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { industries } from '@/data/industries'
import {
  Car, FlaskConical, ShoppingCart, Scissors,
  Package, Cog, Wheat, Building, Zap, ArrowRight, Truck,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Industries We Serve | BGTS — Baroda Goods Transport',
  description:
    'Specialised freight solutions for automotive, chemical, FMCG, textile, e-commerce, heavy engineering, agri, infrastructure, and energy sectors across Gujarat and Maharashtra.',
}

const iconMap: Record<string, React.ReactNode> = {
  Car:           <Car size={28} />,
  FlaskConical:  <FlaskConical size={28} />,
  ShoppingCart:  <ShoppingCart size={28} />,
  Scissors:      <Scissors size={28} />,
  Package:       <Package size={28} />,
  Cog:           <Cog size={28} />,
  Wheat:         <Wheat size={28} />,
  Building:      <Building size={28} />,
  Zap:           <Zap size={28} />,
}

// Industry-specific accent colours (light backgrounds, brand-safe)
const industryAccent: Record<string, { bg: string; icon: string }> = {
  automotive:     { bg: 'bg-orange-50',   icon: 'text-orange-500' },
  chemical:       { bg: 'bg-purple-50',   icon: 'text-purple-500' },
  fmcg:           { bg: 'bg-blue-50',     icon: 'text-blue-500'   },
  textile:        { bg: 'bg-pink-50',     icon: 'text-pink-500'   },
  ecommerce:      { bg: 'bg-sky-50',      icon: 'text-sky-500'    },
  engineering:    { bg: 'bg-zinc-100',    icon: 'text-zinc-500'   },
  agri:           { bg: 'bg-green-50',    icon: 'text-green-600'  },
  infrastructure: { bg: 'bg-amber-50',    icon: 'text-amber-600'  },
  energy:         { bg: 'bg-yellow-50',   icon: 'text-yellow-600' },
}

export default function IndustriesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-header min-h-screen bg-surface-page">

        {/* Page hero */}
        <div className="py-16 md:py-24 bg-[#FAFAF8] border-b border-ink-ghost/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-transparent pointer-events-none" />
          <div className="container-xl relative z-10">
            <Tag variant="brand" size="sm" className="mb-4">9 Sectors</Tag>
            <h1 className="font-display font-black text-5xl md:text-6xl text-ink-strong tracking-tight mb-4">
              Built for your<br />
              <span className="text-gradient-energy">industry.</span>
            </h1>
            <p className="text-ink-muted text-xl max-w-2xl">
              Sector-specific freight expertise built over 75 years. From JIT automotive
              lines to pharma cold-chain to ODC project cargo — BGTS has the fleet,
              compliance, and route intelligence your industry demands.
            </p>
          </div>
        </div>

        {/* Industry grid */}
        <section className="section-py">
          <div className="container-xl">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {industries.map((industry) => {
                const accent = industryAccent[industry.slug] ?? { bg: 'bg-surface-mid', icon: 'text-ink-muted' }
                return (
                  <Link
                    key={industry.slug}
                    href={`/industries/${industry.slug}`}
                    className="group bg-white rounded-2xl border border-ink-ghost/10 p-7 shadow-card hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                  >
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl ${accent.bg} ${accent.icon} flex items-center justify-center mb-5 shrink-0`}>
                      {iconMap[industry.icon]}
                    </div>

                    <h2 className="font-display font-bold text-lg text-ink-strong mb-2 group-hover:text-brand transition-colors">
                      {industry.name}
                    </h2>
                    <p className="text-sm text-ink-muted leading-relaxed flex-1">
                      {industry.description}
                    </p>

                    <div className="mt-5 flex items-center gap-1 text-brand text-sm font-semibold">
                      View solutions
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="section-py bg-brand-subtle border-y border-brand/10">
          <div className="container-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '75+', label: 'Years in freight' },
                { value: '9',   label: 'Industry verticals' },
                { value: '340+', label: 'Active routes' },
                { value: '2,000+', label: 'Vehicles on network' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="font-display font-black text-3xl text-brand mb-1">{value}</p>
                  <p className="text-sm text-ink-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-py bg-surface-page">
          <div className="container-xl text-center max-w-2xl mx-auto">
            <h2 className="font-display font-black text-3xl text-ink-strong mb-3">
              Not sure which solution fits?
            </h2>
            <p className="text-ink-muted mb-8">
              Talk to a BGTS freight specialist. We&apos;ll match you to the right service,
              fleet, and route — no obligation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                size="lg"
                icon={<Truck size={16} />}
                iconPosition="left"
                asChild
              >
                <Link href="/quote">Get a Quote</Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <a href="tel:+916357225722">Call +91 63 5722 5722</a>
              </Button>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
