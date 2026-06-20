'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
      className="relative w-full overflow-hidden h-[58vh] sm:h-[62vh] md:h-[68vh] lg:h-[74vh]"
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

      {/* Dark overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.78) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Centered content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/20 border border-brand/40 mb-8">
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse" aria-hidden="true" />
          <span className="text-brand text-xs font-bold tracking-widest uppercase">
            Est. 1950 · Trusted Across India
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-white tracking-tight leading-[0.95] max-w-5xl">
          Move Freight.<br />
          Move <span className="text-brand">India.</span>
        </h1>
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
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
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
