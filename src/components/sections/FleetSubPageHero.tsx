import Image from 'next/image'
import { Tag } from '@/components/ui/Tag'

interface FleetSubPageHeroProps {
  image: string
  imageAlt: string
  tagLabel: string
  headlineLine1: string
  headlineAccent: string
  subtitle: string
}

export function FleetSubPageHero({
  image,
  imageAlt,
  tagLabel,
  headlineLine1,
  headlineAccent,
  subtitle,
}: FleetSubPageHeroProps) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: 'clamp(340px, 46vw, 540px)' }}
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

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.50) 50%, rgba(0,0,0,0.82) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Text overlay */}
      <div className="absolute inset-0 flex flex-col justify-end pb-12 md:pb-16">
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
