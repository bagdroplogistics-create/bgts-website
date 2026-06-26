'use client'

import { useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT DATA
// slug = filename in /public/logos/{slug}.png  (add your logos there)
// domain = Clearbit fallback if local file missing
// short = abbreviated label shown below logo
// ─────────────────────────────────────────────────────────────────────────────
interface Client {
  name: string
  short: string
  slug: string
  domain?: string
}

const CLIENTS: Client[] = [
  { name: 'Zydus Cadila',                            short: 'Zydus Cadila',     slug: 'zydus-cadila',        domain: 'zyduscadila.com'           },
  { name: 'GSFC',                                    short: 'GSFC',             slug: 'gsfc-fertilizers'                                             },
  { name: 'Sun Pharmaceutical',                      short: 'Sun Pharma',       slug: 'sun-pharmaceutical',  domain: 'sunpharma.com'              },
  { name: 'NTPC Limited',                            short: 'NTPC',             slug: 'ntpc',                domain: 'ntpc.co.in'                 },
  { name: 'Alembic Pharmaceuticals',                 short: 'Alembic',          slug: 'alembic'                                                  },
  { name: 'Waaree Energies',                         short: 'Waaree Energies',  slug: 'waaree-energies',     domain: 'waaree.com'                 },
  { name: 'Gujarat Alkalies & Chemicals',            short: 'GACL',             slug: 'gacl',                domain: 'gacl.com'                   },
  { name: 'Sarabhai Group',                          short: 'Sarabhai Group',   slug: 'sarabhai-group',      domain: 'sarabhaigroup.com'          },
  { name: 'SAIL',                                    short: 'SAIL',             slug: 'sail'                                                     },
  { name: 'Rajkot Municipal Corporation',            short: 'RMC',              slug: 'rmc',                 domain: 'rmc.gov.in'                 },
  { name: 'GSECL',                                   short: 'GSECL',            slug: 'gsecl'                                                    },
  { name: 'Indian Railways',                         short: 'Indian Railways',  slug: 'indian-railways'                                          },
  { name: 'Ester Industries',                        short: 'Ester Industries', slug: 'ester-industries'                                         },
  { name: 'Asense Pharma',                           short: 'Asense Pharma',    slug: 'asense-pharma'                                            },
  { name: 'Zenex Pharmaceuticals',                   short: 'Zenex Pharma',     slug: 'zenex-pharmaceuticals'                                    },
  { name: 'Amerikan Steels',                         short: 'Amerikan Steels',  slug: 'amerikan-steels'                                          },
  { name: 'Subandhu Pakrite',                        short: 'Subandhu Pakrite', slug: 'subandhu'                                                 },
  { name: 'GUVNL',                                   short: 'GUVNL',            slug: 'gsecl'                                                    },
  { name: 'Dhuvaran Thermal Power',                  short: 'Dhuvaran TPS',     slug: 'gsecl'                                                    },
  { name: 'BLTPS Bhavnagar',                         short: 'BLTPS',            slug: 'gsecl'                                                    },
  { name: 'PWD Kadana',                              short: 'PWD Kadana',       slug: 'gsecl'                                                    },
]

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name
    .split(/[\s&\-\/]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGO CARD
// Default: full colour (grayscale-0 opacity-100)
// Hover:   grayscale + dimmed  (REVERSED from old behaviour)
// Priority: local /public/logos/{slug}.png → Clearbit → initials avatar
// ─────────────────────────────────────────────────────────────────────────────
function LogoCard({ client, index }: { client: Client; index: number }) {
  // 0 = try local, 1 = try clearbit, 2 = show initials
  const [stage, setStage] = useState(0)

  const localSrc    = `/logos/${client.slug}.png`
  const clearbitSrc = client.domain ? `https://logo.clearbit.com/${client.domain}` : null

  const imgSrc =
    stage === 0 ? localSrc :
    stage === 1 && clearbitSrc ? clearbitSrc :
    null

  const handleError = () => {
    if (stage === 0 && clearbitSrc) { setStage(1); return }
    setStage(2)
  }

  return (
    <div
      className="group flex-shrink-0 flex flex-col items-center justify-between gap-4
                 bg-white rounded-2xl border border-gray-100
                 px-6 py-6 shadow-sm
                 hover:shadow-none hover:border-gray-200
                 transition-all duration-300 cursor-default"
      style={{ width: '260px' }}
      aria-label={client.name}
    >
      {/* Logo area */}
      <div className="w-full h-36 flex items-center justify-center">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={`${client.name} logo`}
            /* REVERSED: full colour by default → grayscale on hover */
            className="max-h-28 max-w-[220px] w-auto object-contain
                       grayscale-0 opacity-100
                       group-hover:grayscale group-hover:opacity-50
                       transition-all duration-300"
            onError={handleError}
            loading={index < 10 ? 'eager' : 'lazy'}
          />
        ) : (
          // Initials avatar — shown when no logo file exists yet
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-brand/10 to-brand/20
                          flex items-center justify-center border border-brand/20
                          group-hover:opacity-50 transition-opacity duration-300">
            <span className="font-display font-black text-brand text-2xl tracking-tight">
              {initials(client.name)}
            </span>
          </div>
        )}
      </div>

      {/* Company name — REVERSED: strong by default → faded on hover */}
      <p className="text-sm font-bold text-gray-700
                    group-hover:text-gray-400
                    text-center leading-tight transition-colors duration-300 uppercase tracking-wide">
        {client.short}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION — infinite auto-scroll carousel
// ─────────────────────────────────────────────────────────────────────────────
export function TrustStrip() {
  // Triple the list so the loop is always seamless even at wide viewports
  const tripled = [...CLIENTS, ...CLIENTS, ...CLIENTS]

  return (
    <section
      className="section-py bg-gray-50 border-t border-gray-100"
      aria-labelledby="trust-heading"
    >
      {/* Keyframe injected inline — no globals.css change needed */}
      <style>{`
        @keyframes truststrip-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        .truststrip-track {
          animation: truststrip-scroll 55s linear infinite;
          will-change: transform;
        }
        .truststrip-wrap:hover .truststrip-track {
          animation-play-state: paused;
        }
      `}</style>

      {/* ── Header ── */}
      <div className="container-xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/8 border border-brand/15 mb-4">
            <span className="text-brand text-xs font-bold uppercase tracking-widest">Client Portfolio</span>
          </div>
          <h2
            id="trust-heading"
            className="font-display font-black text-3xl md:text-4xl text-ink-strong mb-3"
          >
            Trusted by Gujarat&apos;s Leading Industries
          </h2>
          <p className="text-ink-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Proudly serving leading manufacturers, engineering firms, pharmaceutical companies,
            and industrial enterprises across Gujarat — for over seven decades.
          </p>
        </div>
      </div>

      {/* ── Full-width carousel ── */}
      <div className="truststrip-wrap relative overflow-hidden">

        {/* Left fade edge */}
        <div
          className="absolute left-0 top-0 bottom-0 w-24 md:w-36 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #f9fafb, transparent)' }}
          aria-hidden="true"
        />

        {/* Right fade edge */}
        <div
          className="absolute right-0 top-0 bottom-0 w-24 md:w-36 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #f9fafb, transparent)' }}
          aria-hidden="true"
        />

        {/* Scrolling track */}
        <div className="truststrip-track flex gap-4 py-2 px-2 w-max">
          {tripled.map((client, i) => (
            <LogoCard key={`${client.slug}-${i}`} client={client} index={i} />
          ))}
        </div>
      </div>

      {/* ── Footer note ── */}
      <div className="container-xl">
        <p className="mt-8 text-center text-xs text-ink-ghost font-medium">
          Logos shown are trademarks of their respective companies.&nbsp;
          Long-term relationships since 1950 across Gujarat &amp; Maharashtra.
        </p>
      </div>
    </section>
  )
}
