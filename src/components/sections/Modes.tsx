'use client'

import { useInView } from '@/hooks/useInView'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/utils'

const modes = [
  {
    icon: '🛣️',
    name: 'Road',
    headline: 'Gujarat to Goa. Mumbai to Mundra.',
    description:
      'Our primary mode: 2,000+ vehicles covering Gujarat, Maharashtra, and Pan-India corridors. FTL, PTL, Express, and Tanker services on every major NH.',
    highlights: ['200+ route corridors', '20+ branch network', 'GPS every vehicle'],
    color: 'brand',
  },
  {
    icon: '🚂',
    name: 'Rail',
    headline: 'For high-volume, long-haul cargo.',
    description:
      'Rail siding access at Vadodara Junction enables bulk container and wagon movement at 40–60% lower cost than road for distances above 500 km.',
    highlights: ['Vadodara rail siding', 'Container booking', '500+ km advantage'],
    color: 'brand',
  },
  {
    icon: '✈️',
    name: 'Air',
    headline: 'When time is non-negotiable.',
    description:
      'Cargo agent tie-ups at Mumbai, Delhi, and Ahmedabad airports for time-critical shipments. Same-day booking, next-flight options, door-to-door.',
    highlights: ['BOM, DEL, AMD airports', 'Next-flight booking', 'Priority handling'],
    color: 'brand',
  },
]

export function Modes() {
  const [ref, isVisible] = useInView<HTMLDivElement>({ threshold: 0.1 })

  return (
    <section
      ref={ref}
      className="section-py bg-surface-mid"
      aria-labelledby="modes-heading"
    >
      <div className="container-xl">
        <div className="mb-12 text-center">
          <SectionHeading
            eyebrow="Transport Modes"
            title="Road. Rail. Air."
            subtitle="Three modes, one LR number, one BGTS team responsible end-to-end."
            align="center"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {modes.map((mode, i) => (
            <div
              key={mode.name}
              className={cn(
                'bg-white rounded-2xl p-8 border border-ink-ghost/10',
                'transition-all duration-700',
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              )}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              {/* Icon */}
              <div className="text-4xl mb-4" aria-hidden="true">{mode.icon}</div>

              {/* Mode name */}
              <div className="eyebrow mb-2">{mode.name}</div>

              {/* Headline */}
              <h3 className="font-display font-bold text-xl text-ink-strong mb-3 leading-snug">
                {mode.headline}
              </h3>

              {/* Description */}
              <p className="text-sm text-ink-muted leading-relaxed mb-6">
                {mode.description}
              </p>

              {/* Highlights */}
              <ul className="space-y-2">
                {mode.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-xs text-ink-body">
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-brand shrink-0"
                      aria-hidden="true"
                    />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
