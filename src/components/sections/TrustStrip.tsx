// Server component — no animation needed (CSS handles it)

const clients = [
  'Mafatlal Industries',
  'Zydus Healthcare',
  'Torrent Power',
  'L&T ECC',
  'Reliance Industries',
  'Asian Paints',
  'Pidilite Industries',
  'Adani Group',
  'Tata Chemicals',
  'ONGC',
  'GSFC',
  'V-Mart Retail',
]

export function TrustStrip() {
  // Duplicate for seamless marquee loop
  const doubled = [...clients, ...clients]

  return (
    <section
      className="py-8 bg-surface-card border-y border-ink-ghost/10 overflow-hidden"
      aria-label="Trusted by leading companies"
    >
      <p className="text-center text-xs text-ink-muted uppercase tracking-widest mb-5 font-display font-semibold">
        Trusted by Gujarat's leading industries
      </p>

      <div className="relative">
        {/* Fade edges */}
        <div
          className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #fff, transparent)' }}
          aria-hidden="true"
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #fff, transparent)' }}
          aria-hidden="true"
        />

        {/* Marquee track */}
        <div className="flex marquee-track" aria-hidden="true">
          {doubled.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="shrink-0 flex items-center gap-2 text-sm font-semibold text-ink-muted whitespace-nowrap"
            >
              <span
                className="w-5 h-5 rounded border border-brand/30 inline-flex items-center justify-center text-brand text-2xs font-black"
                aria-hidden="true"
              >
                ▶
              </span>
              {name}
              <span className="mx-4 text-ink-ghost" aria-hidden="true">·</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
