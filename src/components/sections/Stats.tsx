'use client'

import { useInView } from '@/hooks/useInView'
import { useCounter } from '@/hooks/useCounter'
import { cn } from '@/lib/utils'

const stats = [
  { value: 75,   suffix: '+',  label: 'Years of trusted operations',  description: 'Serving India since 1950' },
  { value: 24,   suffix: '/7', label: 'Logistics Support',             description: 'Always Available' },
  { value: 992,  suffix: '/1000', label: 'Consignments on time',      description: '99.2% on-time delivery SLA' },
  { value: 2000, suffix: '+', label: 'Vehicles managed',              description: 'Road · Rail · Air network' },
]

function StatItem({
  value,
  suffix,
  label,
  description,
  active,
}: {
  value: number
  suffix: string
  label: string
  description: string
  active: boolean
}) {
  const count = useCounter(value, active, { duration: 1800 })

  return (
    <div className="flex flex-col items-center text-center p-6">
      <div className="font-display font-black text-5xl md:text-6xl text-ink-strong tabular-nums">
        <span className="font-mono">{active ? count.toLocaleString('en-IN') : '0'}</span>
        <span className="text-brand text-4xl">{suffix}</span>
      </div>
      <div className="mt-3 font-semibold text-ink-strong text-sm">{label}</div>
      <div className="mt-1 text-ink-muted text-xs">{description}</div>
    </div>
  )
}

export function Stats() {
  const [ref, isVisible] = useInView<HTMLDivElement>({ threshold: 0.2, once: true })

  return (
    <section
      ref={ref}
      className="section-py bg-surface-card border-y border-ink-ghost/10"
      aria-label="Company statistics"
    >
      <div className="container-xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-ink-ghost/10 rounded-2xl overflow-hidden border border-ink-ghost/10">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={cn(
                'transition-opacity duration-700',
                isVisible ? 'opacity-100' : 'opacity-0',
              )}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <StatItem {...stat} active={isVisible} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
