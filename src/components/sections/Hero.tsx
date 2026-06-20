'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Truck, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useBookingModal } from '@/contexts/BookingModalContext'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const slides = [
  { src: '/hero-1.jpg', alt: 'BGTS freight truck on national highway' },
  { src: '/hero-2.jpg', alt: 'BGTS logistics fleet at depot' },
  { src: '/hero-3.jpg', alt: 'BGTS cargo operations' },
  { src: '/hero-4.jpg', alt: 'BGTS EV fleet on route' },
  { src: '/hero-5.jpg', alt: 'BGTS warehousing and distribution' },
]

const AUTO_INTERVAL = 5000

export function Hero() {
  const { openModal } = useBookingModal()
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  const goTo = useCallback((index: number) => {
    setFading(true)
    setTimeout(() => {
      setCurrent(index)
      setFading(false)
    }, 400)
  }, [])

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length)
  }, [current, goTo])

  const next = useCallback(() => {
    goTo((current + 1) % slides.length)
  }, [current, goTo])

  useEffect(() => {
    const t = setInterval(next, AUTO_INTERVAL)
    return () => clearInterval(t)
  }, [next])

  return (
    <section
      className="relative w-full overflow-hidden h-[60vh] sm:h-[65vh] md:h-[70vh] lg:h-[78vh]"
      aria-label="BGTS — India's Trusted Freight Partner"
    >
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className={cn(
            'absolute inset-0 transition-opacity duration-700 ease-in-out',
            i === current && !fading ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden={i !== current}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority={i === 0}
          />
        </div>
      ))}

      {/* Dark overlay — stronger at bottom and left for text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.58) 65%, rgba(0,0,0,0.72) 100%)',
        }}
        aria-hidden="true"
      />

      {/* ── Centered content overlay ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/20 border border-brand/40 mb-5">
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse" aria-hidden="true" />
          <span className="text-brand text-xs font-bold tracking-widest uppercase">
            Est. 1950 · Trusted Across India
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[1.0] mb-5 max-w-4xl">
          Move Freight.<br />
          Move <span className="text-brand">India.</span>
        </h1>

        {/* Sub */}
        <p className="text-white/80 text-base sm:text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
          2,000+ vehicles. 340+ routes. FTL, PTL, Express & EV Fleet —
          delivered on time, every time across Gujarat and Maharashtra.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 justify-center mb-10">
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand-600 transition-all shadow-lg shadow-brand/30 hover:shadow-brand/50 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Truck size={16} />
            Book Now
          </button>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/40 text-white font-bold text-sm hover:bg-white/10 transition-all"
          >
            Explore Services
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Trust stats */}
        <div className="flex flex-wrap gap-6 sm:gap-10 justify-center">
          {[
            { value: '75+',    label: 'Years' },
            { value: '2,000+', label: 'Vehicles' },
            { value: '340+',   label: 'Routes' },
            { value: '99.2%',  label: 'On-Time' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-display font-black text-2xl sm:text-3xl text-brand leading-none">{value}</p>
              <p className="text-xs text-white/60 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Prev arrow */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Next arrow */}
      <button
        type="button"
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i === current ? 'w-8 bg-brand' : 'w-2 bg-white/50 hover:bg-white/80'
            )}
          />
        ))}
      </div>
    </section>
  )
}
