'use client'

import Image from 'next/image'
import { Tag } from '@/components/ui/Tag'

export function FleetHeroSlider() {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: 'clamp(380px, 52vw, 600px)' }}
    >
      {/* Background image — fleet range: 3-wheeler to trailer */}
      <Image
        src="/bgts-hero-2.jpg"
        alt="BGTS fleet — from last-mile LCVs to 40-tonne multi-axle trailers across India"
        fill
        sizes="100vw"
        className="object-cover object-center"
        priority
      />

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.52) 50%, rgba(0,0,0,0.80) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Text overlay */}
      <div className="absolute inset-0 flex flex-col justify-end pb-14 md:pb-16">
        <div className="container-xl">
          <Tag
            variant="brand"
            size="sm"
            className="mb-4 bg-white/15 border-white/40 text-white"
          >
            2,000+ Vehicles
          </Tag>
          <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight mb-4">
            Built for India&apos;s<br />
            <span className="text-brand">toughest corridors.</span>
          </h1>
          <p className="text-white/80 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">
            From last-mile LCVs to 40-tonne multi-axle trailers — BGTS operates
            the right vehicle for every freight type, route, and service level.
          </p>
        </div>
      </div>
    </div>
  )
}
