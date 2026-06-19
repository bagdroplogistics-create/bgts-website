import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { services, getService } from '@/data/services'
import { CheckCircle, ArrowRight, Truck } from 'lucide-react'

// ─── Static params for all service slugs ─────────────────────────────────
export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }))
}

// ─── Dynamic metadata ─────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const service = getService(slug)
  if (!service) return { title: 'Service Not Found' }

  return {
    title: service.name,
    description: service.description,
    openGraph: {
      title: `${service.name} | BGTS`,
      description: service.description,
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default async function ServiceDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const service = getService(slug)
  if (!service) notFound()

  return (
    <>
      <Navbar />

      <main className="pt-header min-h-screen bg-surface-page">
        {/* Hero */}
        <div className="py-14 md:py-20 relative overflow-hidden bg-[#FAFAF8] border-b border-ink-ghost/10">
          {/* Subtle brand accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-transparent pointer-events-none" />
          <div className="container-xl relative z-10">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-2 text-xs text-ink-muted">
                <li><Link href="/" className="hover:text-brand transition-colors">Home</Link></li>
                <li aria-hidden="true" className="text-ink-ghost">/</li>
                <li><Link href="/services" className="hover:text-brand transition-colors">Services</Link></li>
                <li aria-hidden="true" className="text-ink-ghost">/</li>
                <li className="text-ink-body font-medium" aria-current="page">{service.shortName}</li>
              </ol>
            </nav>

            <div className="flex items-start gap-3 mb-5">
              {service.isHighlighted && <Tag variant="brand" size="sm">Most Popular</Tag>}
              <Tag variant="neutral" size="sm">
                {service.modes.join(' · ')}
              </Tag>
            </div>

            <h1 className="font-display font-black text-4xl md:text-5xl text-ink-strong tracking-tight mb-3">
              {service.name}
            </h1>
            <p className="text-ink-muted text-xl max-w-2xl mb-8">
              {service.tagline}
            </p>

            {/* Key metrics */}
            <div className="flex flex-wrap gap-6">
              <div className="bg-white rounded-xl border border-ink-ghost/10 px-4 py-3 shadow-sm">
                <p className="text-ink-muted text-xs uppercase tracking-wider mb-0.5">Transit Time</p>
                <p className="text-ink-strong font-mono font-bold">{service.transitTimeDays}</p>
              </div>
              {service.ratePerKm > 0 && (
                <div className="bg-white rounded-xl border border-ink-ghost/10 px-4 py-3 shadow-sm">
                  <p className="text-ink-muted text-xs uppercase tracking-wider mb-0.5">Starting Rate</p>
                  <p className="text-brand font-mono font-bold">₹{service.ratePerKm}/km</p>
                </div>
              )}
              {service.minWeightKg && (
                <div className="bg-white rounded-xl border border-ink-ghost/10 px-4 py-3 shadow-sm">
                  <p className="text-ink-muted text-xs uppercase tracking-wider mb-0.5">Min Weight</p>
                  <p className="text-ink-strong font-mono font-bold">{service.minWeightKg} kg</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container-xl py-12 md:py-16">
          <div className="grid lg:grid-cols-3 gap-10 items-start">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-white rounded-2xl border border-ink-ghost/10 p-7">
                <h2 className="font-display font-bold text-xl text-ink-strong mb-4">
                  What is {service.shortName}?
                </h2>
                <p className="text-ink-body leading-relaxed">{service.description}</p>
              </div>

              {/* Features */}
              <div className="bg-white rounded-2xl border border-ink-ghost/10 p-7">
                <h2 className="font-display font-bold text-xl text-ink-strong mb-5">
                  What you get
                </h2>
                <ul className="space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle
                        size={16}
                        className="text-brand shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span className="text-sm text-ink-body">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ideal for */}
              <div className="bg-white rounded-2xl border border-ink-ghost/10 p-7">
                <h2 className="font-display font-bold text-xl text-ink-strong mb-5">
                  Ideal for
                </h2>
                <div className="flex flex-wrap gap-2">
                  {service.idealFor.map((industry) => (
                    <Tag key={industry} variant="neutral">{industry}</Tag>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar — sticky CTA */}
            <aside className="lg:sticky lg:top-24 space-y-4">
              <div className="bg-white rounded-2xl border border-ink-ghost/10 p-6">
                <h3 className="font-display font-bold text-ink-strong mb-2">
                  Get a {service.shortName} quote
                </h3>
                <p className="text-sm text-ink-muted mb-5">
                  Instant price estimate with transit time, insurance, and GST.
                </p>
                {service.ratePerKm > 0 && (
                  <div className="bg-brand-subtle rounded-xl p-3 mb-5 flex items-center justify-between">
                    <span className="text-xs text-ink-muted">Base rate</span>
                    <span className="font-mono font-bold text-brand">
                      ₹{service.ratePerKm}/km
                    </span>
                  </div>
                )}
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  icon={<Truck size={16} />}
                  iconPosition="left"
                  asChild
                >
                  <Link href={`/quote?service=${service.slug}`}>
                    Get Quote — {service.shortName}
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  className="w-full mt-2"
                  asChild
                >
                  <a href="tel:+916357225722">Call +91 63 5722 5722</a>
                </Button>
              </div>

              {/* Other services */}
              <div className="bg-surface-mid rounded-2xl border border-ink-ghost/10 p-5">
                <h3 className="text-xs font-display font-bold uppercase tracking-wider text-ink-muted mb-3">
                  Other services
                </h3>
                <ul className="space-y-1.5">
                  {services
                    .filter((s) => s.slug !== service.slug)
                    .slice(0, 5)
                    .map((s) => (
                      <li key={s.slug}>
                        <Link
                          href={`/services/${s.slug}`}
                          className="flex items-center gap-1.5 text-sm text-ink-body hover:text-brand transition-colors group"
                                 >
                          <ArrowRight size={10} className="text-ink-ghost group-hover:text-brand" aria-hidden="true" />
                          {s.shortName}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
