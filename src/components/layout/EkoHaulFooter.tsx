import Link from 'next/link'
import { Zap, Mail, Phone } from 'lucide-react'

export function EkoHaulFooter() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="py-12 mt-auto"
      style={{ background: '#0C5B35' }}
      aria-label="BGTS EV footer"
    >
      <div className="container-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-eko-lime/20 flex items-center justify-center">
                <Zap size={14} className="text-eko-lime" aria-hidden="true" />
              </div>
              <span className="font-display font-black text-white text-lg">BGTS EV</span>
              <span className="text-eko-lime/60 text-xs font-mono">by BGTS</span>
            </div>
            <p className="text-white/50 text-xs max-w-xs leading-relaxed">
              Gujarat&apos;s first 100% EV commercial cargo fleet. Zero emissions, zero compromise.
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label="BGTS EV footer links">
            <ul className="flex flex-wrap gap-x-8 gap-y-2">
              {[
                { label: 'BGTS EV Plans',       href: '/ekohaul/book'   },
                { label: 'Carbon Calculator',   href: '/ekohaul/esg'    },
                { label: 'Back to BGTS',        href: '/'               },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="flex flex-col gap-2">
            <a
              href="mailto:ev@bgts.in"
              className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
            >
              <Mail size={13} className="text-eko-lime" aria-hidden="true" />
              ev@bgts.in
            </a>
            <a
              href="tel:+916357225722"
              className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-mono transition-colors"
            >
              <Phone size={13} className="text-eko-lime" aria-hidden="true" />
              +91 63 5722 5722
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-white/30 text-xs">
          © {year} Baroda Goods Transport Service Pvt. Ltd. · BGTS EV is a registered brand of BGTS.
        </div>
      </div>
    </footer>
  )
}
