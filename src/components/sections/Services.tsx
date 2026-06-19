'use client'

import Link from 'next/link'
import {
  Truck, PackageOpen, Zap, Warehouse, Droplets,
  Building2, Network, Handshake, ArrowRight,
} from 'lucide-react'
import { useInView } from '@/hooks/useInView'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Tag } from '@/components/ui/Tag'
import { cn } from '@/lib/utils'
import { services } from '@/data/services'

const iconMap: Record<string, React.ElementType> = {
  Truck, PackageOpen, Zap, Warehouse, Droplets,
  Building2, Network, Handshake,
}

export function Services() {
  const [ref, isVisible] = useInView<HTMLDivElement>({ threshold: 0.05, once: true })

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
          />
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon] ?? Truck

            return (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className={cn(
                  'group card p-6 flex flex-col gap-4 no-underline',
                  'transition-all duration-slow',
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-6'
                )}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-brand-subtle flex items-center justify-center group-hover:bg-brand group-hover:shadow-brand transition-all duration-base">
                  <Icon
                    size={20}
                    className="text-brand group-hover:text-white transition-colors"
                    aria-hidden="true"
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-bold text-sm text-ink-strong group-hover:text-brand transition-colors">
                      {service.shortName}
                    </h3>
                    {service.isHighlighted && (
                      <Tag variant="brand" size="sm">Popular</Tag>
                    )}
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">
                    {service.tagline}
                  </p>
                </div>

                {/* Transit time */}
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-ink-muted font-mono">
                    {service.transitTimeDays}
                  </span>
                  <ArrowRight
                    size={14}
                    className="text-ink-ghost group-hover:text-brand group-hover:translate-x-1 transition-all"
                    aria-hidden="true"
                  />
                </div>
              </Link>
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
    </section>
  )
}
