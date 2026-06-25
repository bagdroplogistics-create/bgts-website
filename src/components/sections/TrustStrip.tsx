'use client'

import { useState } from 'react'

// ─── Client list with Clearbit logo domains ────────────────────────────────
// domain: undefined = show styled initials avatar

interface Client {
  name: string
  domain?: string
}

const CLIENTS: Client[] = [
  { name: 'Zydus Cadila',                             domain: 'zyduscadila.com'            },
  { name: 'GSFC',                                     domain: 'gsfclimited.com'             },
  { name: 'Sun Pharmaceutical',                       domain: 'sunpharma.com'               },
  { name: 'NTPC',                                     domain: 'ntpc.co.in'                  },
  { name: 'Alembic Pharmaceuticals',                  domain: 'alembicpharmaceuticals.com'  },
  { name: 'Waaree Energies',                          domain: 'waaree.com'                  },
  { name: 'Gujarat Alkalies & Chemicals',             domain: 'gacl.com'                    },
  { name: 'Sarabhai Group',                           domain: 'sarabhaigroup.com'            },
  { name: 'SAIL',                                     domain: 'sail.co.in'                  },
  { name: 'Rajkot Municipal Corporation',             domain: 'rmc.gov.in'                  },
  { name: 'GSECL',                                    domain: 'gsecl.in'                    },
  { name: 'Indian Railways',                          domain: 'indianrailways.gov.in'       },
  { name: 'Ester Industries',                         domain: 'esterindustries.com'          },
  { name: 'Gujarat State Fertilizers & Chemicals',   domain: 'gsfclimited.com'             },
  { name: 'Asense Pharma'                                                                   },
  { name: 'Zenex Pharmaceuticals'                                                           },
  { name: 'Amerikan Steels'                                                                 },
  { name: 'Subandhu Pakrite'                                                                },
  { name: 'GUVNL',                                   domain: 'guvnl.in'                    },
  { name: 'Dhuvaran Thermal Power Station',           domain: 'gsecl.in'                    },
  { name: 'BLTPS — Bhavnagar',                        domain: 'gsecl.in'                    },
  { name: 'PWD Kadana'                                                                      },
]

// ─── Single logo chip ──────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(/[\s&\-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

function LogoChip({ client }: { client: Client }) {
  const [failed, setFailed] = useState(false)
  const showImg = !!client.domain && !failed

  return (
    <div className="shrink-0 flex items-center gap-2.5 px-1">
      {/* Logo or initials */}
      {showImg ? (
        <img
          src={`https://logo.clearbit.com/${client.domain}`}
          alt={`${client.name} logo`}
          width={28}
          height={28}
          className="w-7 h-7 object-contain rounded"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="w-7 h-7 rounded bg-brand/10 border border-brand/20 flex items-center justify-center text-brand text-[10px] font-black shrink-0">
          {initials(client.name)}
        </span>
      )}

      {/* Company name */}
      <span className="text-sm font-bold text-ink-body whitespace-nowrap">
        {client.name}
      </span>

      {/* Separator */}
      <span className="ml-4 text-ink-ghost/50 select-none" aria-hidden="true">·</span>
    </div>
  )
}

// ─── Marquee strip ─────────────────────────────────────────────────────────

export function TrustStrip() {
  // Triple the list so the seamless loop never shows a gap on wide screens
  const items = [...CLIENTS, ...CLIENTS, ...CLIENTS]

  return (
    <section
      className="py-6 bg-surface-card border-y border-ink-ghost/15 overflow-hidden"
      aria-label="Trusted by Gujarat's Leading Industries"
    >
      <p className="text-center text-base sm:text-lg text-ink-strong uppercase tracking-widest mb-5 font-display font-black">
        Trusted by Gujarat&apos;s Leading Industries
      </p>

      <div className="relative">
        {/* Fade edges */}
        <div
          className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, var(--color-surface-card, #fff), transparent)' }}
          aria-hidden="true"
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, var(--color-surface-card, #fff), transparent)' }}
          aria-hidden="true"
        />

        {/* Scrolling track */}
        <div className="flex marquee-track gap-1" aria-hidden="true">
          {items.map((client, i) => (
            <LogoChip key={`${client.name}-${i}`} client={client} />
          ))}
        </div>
      </div>
    </section>
  )
}
