// Server component — no animation needed (CSS handles it)

const clients = [
  'Zydus Healthcare',
  'Torrent Power',
  'L&T ECC',
  'Reliance Industries',
  'ONGC',
  'GSFC',
]

export function TrustStrip() {
  const doubled = [...clients, ...clients]

  return (
    <section
      className="py-5 bg-surface-card border-y border-ink-ghost/15 overflow-hidden"
      aria-label="Trusted by leading companies"
    >
      <p className="text-center text-base sm:text-lg text-ink-strong uppercase tracking-widest mb-4 font-display font-black">
        Trusted by Gujarat's Leading Industries
      </p>

      <div className="relative">
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

        <div className="flex marquee-track" aria-hidden="true">
          {doubled.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="shrink-0 flex items-center gap-3 text-base sm:text-lg font-bold text-ink-body whitespace-nowrap"
            >
              <span
                className="w-6 h-6 rounded border border-brand/40 inline-flex items-center justify-center text-brand font-black"
                aria-hidden="true"
              >
                &#9654;
              </span>
              {name}
              <span className="mx-5 text-ink-ghost" aria-hidden="true">·</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
