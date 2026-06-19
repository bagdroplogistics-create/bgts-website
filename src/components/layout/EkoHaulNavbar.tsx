'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Leaf, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const ekoLinks = [
  { label: 'Plans',           href: '/ekohaul/book'   },
  { label: 'Carbon Calculator', href: '/ekohaul/esg'  },
  { label: 'Fleet',           href: '/ekohaul/fleet'  },
  { label: 'About EkoHaul',   href: '/ekohaul#about'  },
]

export function EkoHaulNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md',
        'transition-shadow duration-base',
        scrolled && 'shadow-nav'
      )}
    >
      {/* EkoHaul gradient bar */}
      <div className="h-[3px] bg-gradient-eko" aria-hidden="true" />

      <nav
        className="container-xl flex items-center justify-between"
        style={{ height: '72px' }}
        aria-label="EkoHaul navigation"
      >
        {/* EkoHaul logo */}
        <Link
          href="/ekohaul"
          className="flex items-center gap-2.5"
          aria-label="EkoHaul — go to EkoHaul homepage"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-eko flex items-center justify-center">
            <Leaf size={16} className="text-white" aria-hidden="true" />
          </div>
          <div>
            <span className="font-display font-black text-eko text-lg leading-none">
              EkoHaul
            </span>
            <div className="text-2xs text-ink-muted font-mono leading-none">
              by BGTS
            </div>
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {ekoLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-eko bg-eko-50 font-semibold'
                    : 'text-ink-body hover:text-eko hover:bg-eko-50'
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/"
            className="text-xs text-ink-muted hover:text-eko transition-colors"
          >
            ← BGTS.in
          </Link>
          <Button
            variant="eko"
            size="sm"
            icon={<Zap size={14} />}
            iconPosition="left"
            asChild
          >
            <Link href="/ekohaul/book">Book EV Fleet</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md text-ink-body hover:bg-eko-50 hover:text-eko"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-ink-ghost/10 bg-white">
          <nav className="container-xl py-4 flex flex-col gap-1">
            {ekoLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2.5 text-sm text-ink-body hover:text-eko hover:bg-eko-50 rounded-lg"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-ink-ghost/10">
              <Button variant="eko" size="md" asChild>
                <Link href="/ekohaul/book">Book EV Fleet</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
