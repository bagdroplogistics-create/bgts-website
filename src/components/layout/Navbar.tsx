'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, Truck, Phone, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBookingModal } from '@/contexts/BookingModalContext'
import { Button } from '@/components/ui/Button'

const navLinks = [
  { label: 'Services',  href: '/services',  hasDropdown: true  },
  { label: 'Fleet',     href: '/fleet',     hasDropdown: false },
  { label: 'Industries', href: '/industries', hasDropdown: true },
  { label: 'Tracking',  href: '/tracking',  hasDropdown: false },
  { label: 'About',     href: '/about',     hasDropdown: false },
]

const serviceLinks = [
  { label: 'Full Truck Load (FTL)',    href: '/services/full-truck-load'  },
  { label: 'Part Truck Load (PTL)',    href: '/services/part-truck-load'  },
  { label: 'Express Parcel',           href: '/services/express-parcel'   },
  { label: 'Warehousing',              href: '/services/warehousing'      },
  { label: 'Heavy & ODC',             href: '/services/heavy-odc'        },
  { label: 'Multimodal Logistics',    href: '/services/multimodal'       },
]

const industryLinks = [
  { label: 'Automotive',       href: '/industries/automotive'   },
  { label: 'Chemical & Pharma', href: '/industries/chemical'    },
  { label: 'FMCG & Retail',   href: '/industries/fmcg'         },
  { label: 'Textile & Apparel', href: '/industries/textile'     },
  { label: 'E-commerce',       href: '/industries/ecommerce'    },
  { label: 'Heavy Engineering', href: '/industries/engineering' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const pathname = usePathname()
  const { openModal } = useBookingModal()

  // Scroll shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
    setActiveDropdown(null)
  }, [pathname])

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md',
        'transition-shadow duration-base',
        scrolled && 'shadow-nav'
      )}
    >
      {/* Energy gradient top bar */}
      <div className="h-[3px] bg-gradient-energy" aria-hidden="true" />

      <nav
        className="container-xl flex items-center justify-between"
        style={{ height: '72px' }}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-md"
          aria-label="BGTS — go to homepage"
        >
          <Image
            src="/logo-bgts-color.png"
            alt="BGTS — Baroda Goods Transport Service"
            width={140}
            height={56}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-1" role="list">
          {navLinks.map((link) => (
            <li
              key={link.href}
              className="relative"
              onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href={link.href}
                className={cn(
                  'flex items-center gap-1 px-3 py-2 rounded-md text-base font-medium',
                  'transition-colors duration-fast',
                  'hover:text-brand hover:bg-brand-subtle',
                  pathname.startsWith(link.href) && link.href !== '/'
                    ? 'text-brand font-semibold'
                    : 'text-ink-body'
                )}
                aria-current={pathname === link.href ? 'page' : undefined}
                aria-haspopup={link.hasDropdown ? 'true' : undefined}
                aria-expanded={activeDropdown === link.label ? 'true' : undefined}
              >
                {link.label}
                {link.hasDropdown && (
                  <ChevronDown
                    size={14}
                    className={cn(
                      'transition-transform duration-fast',
                      activeDropdown === link.label && 'rotate-180'
                    )}
                    aria-hidden="true"
                  />
                )}
              </Link>

              {/* Dropdown — Services */}
              {link.label === 'Services' && activeDropdown === 'Services' && (
                <div
                  className="absolute top-full left-0 mt-1 w-60 bg-white rounded-xl shadow-hover border border-ink-ghost/10 py-2 z-50"
                  role="menu"
                >
                  {serviceLinks.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="block px-4 py-2.5 text-sm text-ink-body hover:bg-brand-subtle hover:text-brand transition-colors"
                      role="menuitem"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Dropdown — Industries */}
              {link.label === 'Industries' && activeDropdown === 'Industries' && (
                <div
                  className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-hover border border-ink-ghost/10 py-2 z-50"
                  role="menu"
                >
                  {industryLinks.map((i) => (
                    <Link
                      key={i.href}
                      href={i.href}
                      className="block px-4 py-2.5 text-sm text-ink-body hover:bg-brand-subtle hover:text-brand transition-colors"
                      role="menuitem"
                    >
                      {i.label}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}

          {/* BGTS EV link — brand pill */}
          <li>
            <Link
              href="/ekohaul"
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold',
                'transition-all duration-200',
                pathname.startsWith('/ekohaul')
                  ? 'bg-eko text-white shadow-md shadow-eko/30'
                  : 'bg-eko text-white hover:bg-eko-700 hover:shadow-md hover:shadow-eko/30 hover:scale-105'
              )}
            >
              <Zap size={13} className="shrink-0" aria-hidden="true" />
              BGTS EV
            </Link>
          </li>
        </ul>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href="tel:+916357225722"
            className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-brand transition-colors"
          >
            <Phone size={14} aria-hidden="true" />
            <span className="font-mono">+91 63 5722 5722</span>
          </a>
          <Button
            variant="primary"
            size="sm"
            icon={<Truck size={14} />}
            iconPosition="left"
            asChild
          >
            <button type="button" onClick={openModal}>Book Now</button>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="lg:hidden p-2 rounded-md text-ink-body hover:bg-brand-subtle hover:text-brand transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden border-t border-ink-ghost/10 bg-white"
        >
          <nav className="container-xl py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <div key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium',
                    pathname.startsWith(link.href) && link.href !== '/'
                      ? 'bg-brand-subtle text-brand font-semibold'
                      : 'text-ink-body hover:bg-surface-mid'
                  )}
                  onClick={() =>
                    link.hasDropdown
                      ? setActiveDropdown(
                          activeDropdown === link.label ? null : link.label
                        )
                      : undefined
                  }
                >
                  {link.label}
                  {link.hasDropdown && (
                    <ChevronDown
                      size={14}
                      className={cn(
                        'transition-transform',
                        activeDropdown === link.label && 'rotate-180'
                      )}
                    />
                  )}
                </Link>

                {/* Mobile dropdown */}
                {link.hasDropdown && activeDropdown === link.label && (
                  <div className="ml-4 mt-1 flex flex-col gap-1">
                    {(link.label === 'Services' ? serviceLinks : industryLinks).map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className="px-3 py-2 text-sm text-ink-muted hover:text-brand rounded-md"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <Link
              href="/ekohaul"
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-white bg-eko hover:bg-eko-700"
            >
              <Zap size={14} aria-hidden="true" />
              BGTS EV Fleet
            </Link>

            <div className="mt-3 pt-3 border-t border-ink-ghost/10 flex flex-col gap-2">
              <Button variant="primary" size="md" icon={<Truck size={16} />} asChild>
                <button type="button" onClick={openModal} className="w-full text-left">Book Now</button>
              </Button>
              <Button variant="secondary" size="md" asChild>
                <Link href="/tracking">Track Consignment</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
