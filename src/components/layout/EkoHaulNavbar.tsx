'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BookNowButton } from '@/components/ui/BookNowButton'

const ekoLinks = [
  { label: 'Plans',             href: '/BGTSEV/book'  },
  { label: 'Carbon Calculator', href: '/BGTSEV/esg'   },
  { label: 'About BGTS EV',     href: '/BGTSEV#about' },
]

export function EkoHaulNavbar() {
  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md',
        'transition-shadow duration-base',
        scrolled && 'shadow-nav'
      )}
    >
      {/* EV gradient accent bar */}
      <div className="h-[3px] bg-gradient-eko" aria-hidden="true" />

      <nav
        className="container-xl flex items-center justify-between"
        style={{ height: '90px' }}
        aria-label="BGTS EV navigation"
      >
        {/* Logo — same as main Navbar */}
        <Link href="/BGTSEV" aria-label="BGTS EV — go to homepage">
          <Image
            src="/logo-bgts-color.png"
            alt="BGTS logo"
            width={160}
            height={56}
            className="h-20 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop links — same sizing as main Navbar */}
        <ul className="hidden lg:flex items-center gap-1" role="list">
          {ekoLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'flex items-center gap-1 px-3 py-2 rounded-md text-[1.2rem] font-medium transition-colors',
                  pathname === link.href.split('#')[0] || (!link.href.includes('#') && pathname.startsWith(link.href))
                    ? 'text-eko font-semibold bg-eko-50'
                    : 'text-ink-body hover:text-eko hover:bg-eko-50'
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-brand transition-colors"
          >
            back to BGTS.in
          </Link>
          <BookNowButton
            variant="eko"
            size="sm"
            modalType="ev"
            className="flex items-center gap-1.5 font-bold text-[1.2rem]"
          >
            <Zap size={14} aria-hidden="true" />
            Book Now
          </BookNowButton>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="lg:hidden p-2 rounded-md text-ink-body hover:bg-eko-50 hover:text-eko"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-ink-ghost/10 bg-white">
          <nav className="container-xl py-4 flex flex-col gap-1">
            {ekoLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href.split('#')[0] || (!link.href.includes('#') && pathname.startsWith(link.href))
                    ? 'bg-eko-50 text-eko font-semibold'
                    : 'text-ink-body hover:text-eko hover:bg-eko-50'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-ink-ghost/10 flex flex-col gap-2">
              <BookNowButton
                variant="eko"
                size="md"
                modalType="ev"
                className="w-full justify-center flex items-center gap-2 font-bold"
              >
                <Zap size={15} aria-hidden="true" />
                Book Now
              </BookNowButton>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
