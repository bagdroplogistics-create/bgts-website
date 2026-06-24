import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, ArrowRight } from 'lucide-react'

const footerLinks = {
  Services: [
    { label: 'Full Truck Load (FTL)',  href: '/services/full-truck-load'  },
    { label: 'Part Truck Load (PTL)', href: '/services/part-truck-load'  },
    { label: 'Warehousing',            href: '/services/warehousing'      },
    { label: 'Heavy & ODC',           href: '/services/heavy-odc'        },
    { label: 'Multimodal Logistics',  href: '/services/multimodal'       },
  ],
  Company: [
    { label: 'About BGTS',    href: '/about'          },
    { label: 'Our Fleet',     href: '/fleet'          },
    { label: 'Industries',    href: '/industries'     },
    { label: 'Branches',      href: '/about#branches' },
    { label: 'Careers',       href: '/careers'        },
    { label: 'Contact Us',    href: '/contact'        },
  ],
  'BGTS EV': [
    { label: 'BGTS EV Overview',  href: '/BGTSEV'                    },
    { label: 'FlexEV Plan',       href: '/BGTSEV/book?tier=flex-ev'  },
    { label: 'DediEV Plan',       href: '/BGTSEV/book?tier=dedi-ev'  },
    { label: 'FleetEV Plan',      href: '/BGTSEV/book?tier=fleet-ev' },
    { label: 'Carbon Calculator', href: '/BGTSEV/esg'                },
    { label: 'ESG / BRSR Report', href: '/BGTSEV/esg'                },
  ],
  Tools: [
    { label: 'Book Now', href: '/quote' },
  ],
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-surface-inverse text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>

      {/* Energy gradient bar at top */}
      <div className="h-[3px] bg-gradient-energy" aria-hidden="true" />

      <div className="container-xl py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Image
                src="/logo-bgts-white.png"
                alt="BGTS — Baroda Goods Transport Service"
                width={240}
                height={96}
                className="h-24 w-auto object-contain"
              />
            </div>

            <p className="text-white/60 text-base leading-relaxed mb-6">
              Baroda Goods Transport Service Pvt. Ltd.<br />
              Technology-enabled road, rail, and multimodal<br />
              logistics since 1950. Est. Vadodara, Gujarat.
            </p>

            <ul className="space-y-3 text-base" role="list">
              <li>
                <a href="tel:+916357225722"
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                  <Phone size={14} className="shrink-0 text-brand" aria-hidden="true" />
                  +91 63 5722 5722
                </a>
              </li>
              <li>
                <a href="mailto:info@bgts.in"
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                  <Mail size={14} className="shrink-0 text-brand" aria-hidden="true" />
                  info@bgts.in
                </a>
              </li>
              <li>
                <address className="flex items-start gap-2 text-white/70 not-italic">
                  <MapPin size={14} className="shrink-0 text-brand mt-0.5" aria-hidden="true" />
                  Nr Natraj Cinema, Pratapgunj Naka, Vadodara — 390002, Gujarat, India
                </address>
              </li>
            </ul>

            <div className="mt-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-eko/10 border border-eko/20">
              <span className="w-2 h-2 rounded-full bg-eko animate-pulse-brand" aria-hidden="true" />
              <Link href="/BGTSEV" className="text-eko text-sm font-semibold hover:underline">
                BGTS EV — Gujarat's First EV Cargo Fleet
              </Link>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-display font-bold uppercase tracking-widest text-white/40 mb-4">
                {title}
              </h3>
              <ul className="space-y-2.5" role="list">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-1 text-base text-white/60 hover:text-white transition-colors"
                    >
                      <ArrowRight
                        size={10}
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity -ml-0.5"
                        aria-hidden="true"
                      />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © {year} Baroda Goods Transport Service Pvt. Ltd. All rights reserved.
          </p>
          <nav aria-label="Legal links">
            <ul className="flex items-center gap-6" role="list">
              {[
                { label: 'Privacy Policy',   href: '/legal/privacy'  },
                { label: 'Terms of Service', href: '/legal/terms'    },
                { label: 'Cookie Policy',    href: '/legal/cookies'  },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}
                    className="text-sm text-white/40 hover:text-white/70 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
