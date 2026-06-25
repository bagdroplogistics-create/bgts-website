'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BarChart3, ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EVSlide {
  src: string
  alt: string
  eyebrow: string
  line1: string
  line2: string
  accent: string
  sub: string
}

const EV_SLIDES: EVSlide[] = [
  {
    src: '/bgts-ev-hero-1.jpg',
    alt: 'BGTS EV cargo vehicle on city road',
    eyebrow: 'Now Accepting Fleet Orders · Gujarat & Maharashtra',
    line1: "Gujarat's First",
    line2: '100% EV Cargo ',
    accent: 'Fleet.',
    sub: 'Zero-emission delivery at or below the cost of diesel. Fleet-as-a-Service for every business size.',
  },
  {
    src: '/bgts-ev-hero-2.jpg',
    alt: 'BGTS EV fleet deployment and operations',
    eyebrow: 'FlexEV · DediEV · FleetEV Plans',
    line1: 'Fleet-as-a-Service.',
    line2: 'Scaled to Your ',
    accent: 'Business.',
    sub: 'From 1 vehicle on-demand to full enterprise fleet deployment — BGTS EV is live within 7–14 days.',
  },
  {
    src: '/bgts-ev-hero-3.jpg',
    alt: 'BGTS EV vehicle charging and cost savings',
    eyebrow: '15–30% Cost Savings vs Diesel · Guaranteed',
    line1: 'Save on Every Route.',
    line2: 'From ',
    accent: 'Day 1.',
    sub: 'EV freight economics that beat diesel across every route we serve — with full price transparency.',
  },
  {
    src: '/bgts-ev-hero-4.jpg',
    alt: 'BGTS EV sustainability and ESG reporting dashboard',
    eyebrow: 'BRSR-Ready · SEBI Principle 6 Compliant',
    line1: 'BRSR-Ready ESG',
    line2: 'Reports. Every ',
    accent: 'Month.',
    sub: 'Every vehicle generates CO₂ avoided data formatted for SEBI BRSR compliance — zero manual work.',
  },
  {
    src: '/bgts-ev-hero-5.jpg',
    alt: 'BGTS EV zero emission freight operations',
    eyebrow: '97% CO₂ Reduction · Solar-Powered Routes',
    line1: 'Zero Emission.',
    line2: 'Zero ',
    accent: 'Compromise.',
    sub: '97% CO₂ reduction on solar-powered routes. 99.5% fleet uptime SLA. Clean freight, no trade-offs.',
  },
]

const AUTO_INTERVAL = 6000

const ekoStats = [
  { value: '74%',    label: 'CO₂ reduction', sub: 'grid-powered' },
  { value: '97%',    label: 'CO₂ reduction', sub: 'solar-powered' },
  { value: '15–30%', label: 'Cost savings',  sub: 'vs diesel fleet' },
  { value: '99.5%',  label: 'Fleet uptime',  sub: 'FleetEV SLA' },
]

export function EVHeroSlider() {
  const [current, setCurrent] = useState(0)
  const [fading,  setFading]  = useState(false)

  const goTo = useCallback((index: number) => {
    setFading(true)
    setTimeout(() => { setCurrent(index); setFading(false) }, 350)
  }, [])

  const prev = useCallback(() => goTo((current - 1 + EV_SLIDES.length) % EV_SLIDES.length), [current, goTo])
  const next = useCallback(() => goTo((current + 1) % EV_SLIDES.length), [current, goTo])

  useEffect(() => {
    const t = setInterval(next, AUTO_INTERVAL)
    return () => clearInterval(t)
  }, [next])

  const slide = EV_SLIDES[current]

  return (
    <section
      className="relative w-full overflow-hidden h-[75vh] sm:h-[82vh] md:h-[88vh] lg:h-[92vh]"
      aria-label="BGTS EV — Gujarat's First 100% EV Cargo Fleet"
    >
      {/* Background images */}
      {EV_SLIDES.map((s, i) => (
        <div
          key={s.src}
          className={cn(
            'absolute inset-0 transition-opacity duration-700 ease-in-out',
            i === current && !fading ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden={i !== current}
        >
          <Image
            src={s.src}
            alt={s.alt}
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority={i === 0}
          />
        </div>
      ))}

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, rgba(0,30,10,0.55) 45%, rgba(0,20,10,0.82) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Per-slide content */}
      <div
        className={cn(
          'absolute inset-0 flex flex-col justify-center px-5 sm:px-10 md:px-16 lg:px-20 transition-opacity duration-300 pb-32 sm:pb-24',
          fading ? 'opacity-0' : 'opacity-100'
        )}
      >
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/50 mb-5 w-fit">
          <Zap size={11} className="text-white" aria-hidden="true" />
          <span className="text-white text-[10px] sm:text-xs font-bold tracking-widest uppercase">
            {slide.eyebrow}
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[1.0] mb-5 max-w-3xl">
          {slide.line1}<br />
          {slide.line2}<span className="text-eko-lime">{slide.accent}</span>
        </h1>

        {/* Sub */}
        <p className="text-white/80 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed mb-8 hidden sm:block">
          {slide.sub}
        </p>

        {/* Single static CTA — Carbon Calculator */}
        <div>
          <Link
            href="/EV/book"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-eko text-white font-bold text-sm hover:bg-eko-700 transition-all shadow-lg shadow-eko/30 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Zap size={15} aria-hidden="true" />
            Book Now
          </Link>
        </div>
      </div>

      {/* Stats strip pinned to bottom */}
      <div className="absolute bottom-0 inset-x-0 bg-black/50 backdrop-blur-md border-t border-white/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-10 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {ekoStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display font-black text-xl sm:text-2xl text-eko-lime leading-none mb-0.5">
                {stat.value}
              </p>
              <p className="text-white/75 text-xs">{stat.label}</p>
              <p className="text-white/45 text-[10px]">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-20 sm:bottom-[4.5rem] right-5 sm:right-10 flex gap-2">
        {EV_SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === current ? 'w-7 bg-eko' : 'w-1.5 bg-white/40 hover:bg-white/70'
            )}
          />
        ))}
      </div>
    </section>
  )
}
