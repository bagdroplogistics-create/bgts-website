'use client'

import Link from 'next/link'
import {
  Car, FlaskConical, ShoppingCart, Scissors,
  Package, Cog, Wheat, Building, Zap, ArrowRight,
} from 'lucide-react'
import { useInView } from '@/hooks/useInView'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/utils'
import { industries } from '@/data/industries'

const iconMap: Record<string, React.ElementType> = {
  Car, FlaskConical, ShoppingCart, Scissors,
  Package, Cog, Wheat, Building, Zap,
}

export function Industries() {
  const [ref, isVisible] = useInView<HTMLDivElement>({ threshold: 0.05 })

  return (
    <section
      ref={ref}
      className="section-py bg-surface-page"
      aria-labelledby="industries-heading"
    >
      <div className="container-xl">
        <div className="mb-12">
          <SectionHeading
            eyebrow="Industries We Serve"
            title="Deep expertise across sectors"
            subtitle="75 years of sector-specific logistics knowledge — from chemicals to e-commerce, automotive to agriculture."
            align="left"
            titleClassName="text-5xl md:text-6xl"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {industries.map((industry, i) => {
            const Icon = iconMap[industry.icon] ?? Package

            return (
              <Link
                key={industry.slug}
                href={`/industries/${industry.slug}`}
                className={cn(
                  'group flex items-start gap-4 p-5 rounded-xl',
                  'border border-ink-ghost/10 bg-white',
                  'hover:border-brand/30 hover:shadow-card',
                  'transition-all duration-base no-underline',
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-6'
                )}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <div className="w-10 h-10 rounded-lg bg-brand-subtle flex items-center justify-center shrink-0 group-hover:bg-brand transition-colors">
                  <Icon
                    size={18}
                    className="text-brand group-hover:text-white transition-colors"
                    aria-hidden="true"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-sm text-ink-strong group-hover:text-brand transition-colors mb-1">
                    {industry.name}
                  </h3>
                  <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">
                    {industry.description}
                  </p>
                </div>

                <ArrowRight
                  size={14}
                  className="text-ink-ghost group-hover:text-brand group-hover:translate-x-1 shrink-0 mt-1 transition-all"
                  aria-hidden="true"
                />
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
