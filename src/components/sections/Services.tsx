'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Truck, PackageOpen, Zap, Warehouse, Droplets,
  Building2, Network, Handshake, ArrowRight,
} from 'lucide-react'
import { useInView } from '@/hooks/useInView'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Tag } from '@/components/ui/Tag'
import { cn } from '@/lib/utils'
import { useBookingModal } from '@/contexts/BookingModalContext'
import { PTLBookingModal } from '@/components/forms/PTLBookingModal'
import { services } from '@/data/services'

const iconMap: Record<string, React.ElementType> = {
  Truck, PackageOpen, Zap, Warehouse, Droplets,
  Building2, Network, Handshake,
}

// Remove Express (same as FTL for user's purposes)
const displayServices = services.filter(s => s.slug !== 'express-parcel')

export function Services() {
  const [ref, isVisible] = useInView<HTMLDivElement>({ threshold: 0.05, once: true })
  const { openModal } = useBookingModal()
  const [ptlOpen, setPtlOpen] = useState(false)

  return (
    <section
      ref={ref}
      className="section-py bg-surface-page"
      aria-labelledby="services-heading"
    >
      <div className="container-xl">
        {/* Heading */}
        <div className="mb-12">
          <SectionHeading
            eyebrow="Our Services"
            title="End-to-end freight solutions"
            subtitle="From dedicated FTL to complex multimodal — every service built on BGTS's 75-year network and 99.2% on-time record."
            align="left"
            titleClassName="text-5xl md:text-6xl"
          />
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayServices.map((service, i) => {
            const Icon = iconMap[service.icon] ?? Truck
            const isPTL = service.slug === 'part-truck-load'

            return (
              <div
                key={service.slug}
                className={cn(
                  'group card p-6 flex flex-col gap-4',
                  'transition-all duration-slow',
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-6'
                )}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-brand-subtle flex items-center justify-center group-hover:bg-brand group-hover:shadow-brand transition-all duration-base">
                  <Icon
                    size={22}
                    className="text-brand group-hover:text-white transition-colors"
                    aria-hidden="true"
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-display font-bold text-base text-ink-strong group-hover:text-brand transition-colors">
                      {service.shortName}
                    </h3>
                    {service.isHighlighted && (
                      <Tag variant="brand" size="sm">Popular</Tag>
                    )}
                  </div>
                  <p className="text-sm text-ink-muted leading-relaxed line-clamp-2">
                    {service.tagline}
                  </p>
                </div>

                {/* Transit time */}
                <div className="text-xs text-ink-muted font-mono">
                  {service.transitTimeDays}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-1 border-t border-ink-ghost/10">
                  <button
                    type="button"
                    onClick={() => isPTL ? setPtlOpen(true) : openModal()}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand/90 transition-all shadow-sm hover:shadow-brand/30 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Truck size={12} /> Book Now
                  </button>
                  <Link
                    href={`/services/${service.slug}`}
                    className="flex items-center gap-1 text-xs text-ink-muted hover:text-brand font-medium transition-colors"
                  >
                    Details <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-brand font-semibold text-sm hover:gap-3 transition-all"
          >
            View all services & capabilities
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* PTL-specific booking modal */}
      <PTLBookingModal open={ptlOpen} onClose={() => setPtlOpen(false)} />
    </section>
  )
}
