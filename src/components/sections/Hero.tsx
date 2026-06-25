'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Slide {
  src: string
  alt: string
  eyebrow: string
  line1: string
  line2: string
  accent: string
}

const slides: Slide[] = [
  {
    src: '/bgts-hero-1.jpg',
    alt: 'BGTS freight trucks on national highway',
    eyebrow: 'Est. 1950 · Trusted Across India',
    line1: 'Move Freight.',
    line2: 'Move ',
    accent: 'India.',
  },
  {
    src: '/bgts-hero-2.jpg',
    alt: 'BGTS logistics fleet at Vadodara depot',
    eyebrow: '75 Years · Gujarat to Maharashtra',
    line1: '75 Years of Trust.',
    line2: 'Built on Every ',
    accent: 'Route.',
  },
  {
    src: '/bgts-hero-3.jpg',
    alt: 'BGTS hazardous chemical freight — hydrogen and chlorine transport',
    eyebrow: 'ADR Certified · Hazardous Cargo Specialists',
    line1: 'Hydrogen. Chlorine.',
    line2: 'Moved ',
    accent: 'Safely.',
  },
  {
    src: '/bgts-hero-4.jpg',
    alt: 'BGTS fleet covering routes across India',
    eyebrow: '340+ Routes · 99.2% On-Time',
    line1: 'Your Cargo.',
    line2: 'Our ',
    accent: 'Commitment.',
  },
  {
    src: '/bgts-hero-5.jpg',
    alt: 'BGTS fleet — 3-wheeler to trailer, every load covered',
    eyebrow: '3-Wheeler to 40 FT Trailer · Full Fleet',
    line1: 'Every Vehicle.',
    line2: 'Every ',
    accent: 'Load.',
  },
  {
    src: '/bgts-hero-3.jpg',
    alt: 'BGTS PSU & Government industrial logistics — hazardous cargo specialists',
    eyebrow: 'ADR Certified · PSU Trusted · Since 1995',
    line1: "Trusted by India's",
    line2: 'Largest ',
    accent: 'PSUs.',
  },
]

const AUTO_INTERVAL = 6000

export function Hero() {
  const [current, setCurrent] = useState(0)
  const [fading,  setFading]  = useState(false)

  const goTo = useCallback((index: number) => {
    setFading(true)
    setTimeout(() => { setCurrent(index); setFading(false) }, 350)
  }, [])

  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo])
  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo])

  useEffect(() => {
    const t = setInterval(next, AUTO_INTERVAL)
    return () => clearInterval(t)
  }, [next])

  const slide = slides[current]

  return (
    <section
      className="relative w-full overflow-hidden h-[56vh] sm:h-[58vh] md:h-[64vh] lg:h-[calc(100vh-195px)]"
      aria-label="BGTS — India's Trusted Freight Partner"
    >
      {/* Background images */}
      {slides.map((s, i) => (
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

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.50) 50%, rgba(0,0,0,0.78) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Per-slide content — fades with slide */}
      <div
        className={cn(
          'absolute inset-0 flex flex-col items-center justify-center text-center px-4 transition-opacity duration-300',
          fading ? 'opacity-0' : 'opacity-100'
        )}
      >
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/50 mb-5 sm:mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" aria-hidden="true" />
          <span className="text-white text-[10px] sm:text-xs font-bold tracking-widest uppercase">
            {slide.eyebrow}
          </span>
        </div>

        {/* Headline only — no subtitle, no buttons */}
        <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white tracking-tight leading-[0.97] max-w-5xl">
          {slide.line1}<br />
          {slide.line2}<span className="text-brand">{slide.accent}</span>
        </h1>
      </div>

      {/* Prev / Next arrows */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === current ? 'w-7 bg-brand' : 'w-1.5 bg-white/50 hover:bg-white/80'
            )}
          />
        ))}
      </div>
    </section>
  )
}
