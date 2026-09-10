import Image from 'next/image'
import Link from 'next/link'
import { Tag } from '@/components/ui/Tag'

interface FleetSubPageHeroProps {
  image: string
  imageAlt: string
  tagLabel: string
  headlineLine1: string
  headlineAccent: string
  subtitle: string
  category: string // breadcrumb label e.g. "Pickup"
}

export function FleetSubPageHero({
  image,
  imageAlt,
  tagLabel,
  headlineLine1,
  headlineAccent,
  subtitle,
  category,
}: FleetSubPageHeroProps) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: 'clamp(380px, 52vw, 580px)' }}
    >
      {/* Background image */}
      <Image
        src={image}
        alt={imageAlt}
        fill
        sizes="100vw"
        className="object-cover object-center"
        priority
      />

      {/* Dark gradient — top light for breadcrumb, bottom heavy for text */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.38) 35%, rgba(0,0,0,0.75) 75%, rgba(0,0,0,0.88) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Breadcrumb — top of image */}
      <div className="absolute top-0 left-0 right-0 pt-5">
        <div className="container-xl">
          <nav className="flex items-center gap-2 text-sm text-white/70" aria-label="Breadcrumb">
            <Link href="/fleet" className="hover:text-white transition-colors">
              Fleet
            </Link>
            <span aria-hidden="true" className="text-white/40">/</span>
            <span className="text-white font-medium">{category}</span>
          </nav>
        </div>
      </div>

      {/* Main text — bottom of image */}
      <div className="absolute inset-0 flex flex-col justify-end pb-10 md:pb-14">
        <div className="container-xl">
          <Tag
            variant="brand"
            size="sm"
            className="mb-4 bg-white/15 border-white/40 text-white"
          >
            {tagLabel}
          </Tag>
          <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight mb-4">
            {headlineLine1}<br />
            <span className="text-brand">{headlineAccent}</span>
          </h1>
          <p className="text-white/80 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  )
}
