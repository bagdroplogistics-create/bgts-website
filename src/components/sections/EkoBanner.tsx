'use client'

import Link from 'next/link'
import { ArrowRight, Leaf, Zap, TrendingDown } from 'lucide-react'
import { useInView } from '@/hooks/useInView'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const ekoStats = [
  { icon: TrendingDown, value: '15%', label: 'below diesel total cost' },
  { icon: Leaf,         value: '0g',  label: 'PM2.5 tailpipe emissions' },
  { icon: Zap,          value: '99.5%', label: 'uptime SLA (DediEV plan)' },
]

export function EkoBanner() {
  const [ref, isVisible] = useInView<HTMLDivElement>({ threshold: 0.15, once: true })

  return (
    <section
      ref={ref}
      className="section-py relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0C5B35 0%, #138A4F 50%, #119C97 100%)' }}
      data-brand="ekohaul"
      aria-labelledby="ekohaul-heading"
    >
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      <div className="container-xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: content */}
          <div
            className={cn(
              'transition-all duration-700',
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            )}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-white/10 border border-white/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-eko-lime animate-pulse-brand" aria-hidden="true" />
              <span className="text-eko-lime text-xs font-bold tracking-wider uppercase">
                Now Live — Gujarat&apos;s First EV Cargo Fleet
              </span>
            </div>

            <h2
              id="ekohaul-heading"
              className="font-display font-black text-4xl md:text-5xl text-white leading-tight tracking-tight mb-4"
            >
              Go green without<br />going over budget.
            </h2>

            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-lg">
              BGTS EV is our EV fleet-as-a-service division — zero-emission
              delivery vehicles at or below the cost of diesel. Built for
              Gujarat&apos;s logistics corridors. ESG-ready from day one.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="eko"
                size="lg"
                icon={<ArrowRight size={16} />}
                className="bg-white text-eko hover:bg-eko-50 hover:text-eko-700 shadow-none"
                asChild
              >
                <Link href="/BGTSEV">Explore BGTS EV</Link>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                icon={<Leaf size={16} />}
                iconPosition="left"
                className="text-white hover:bg-white/10 border border-white/20"
                asChild
              >
                <Link href="/BGTSEV/esg">Carbon Calculator</Link>
              </Button>
            </div>
          </div>

          {/* Right: stats cards */}
          <div
            className={cn(
              'grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4',
              'transition-all duration-700 delay-200',
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            )}
          >
            {ekoStats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className={cn(
                    'flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-4',
                    'transition-all duration-500',
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  )}
                  style={{ transitionDelay: `${300 + i * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-eko-lime" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-display font-black text-2xl text-white">
                      {stat.value}
                    </div>
                    <div className="text-white/60 text-xs mt-0.5">{stat.label}</div>
                  </div>
                </div>
              )
            })}

            {/* Fleet tier badges */}
            <div className="flex gap-2 flex-wrap">
              {['FlexEV', 'DediEV', 'FleetEV'].map((tier) => (
                <span
                  key={tier}
                  className="px-3 py-1 rounded-pill bg-white/10 border border-white/15 text-white/80 text-xs font-semibold"
                >
                  {tier}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

