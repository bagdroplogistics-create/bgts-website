'use client'

import Link from 'next/link'
import { Truck, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'

// ─── Transport SVG illustration ───────────────────────────────────────────
function TransportScene() {
  return (
    <svg
      viewBox="0 0 680 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8F4FD" />
          <stop offset="100%" stopColor="#F8F4EE" />
        </linearGradient>
        <linearGradient id="hRoad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A4A48" />
          <stop offset="100%" stopColor="#3A3A38" />
        </linearGradient>
        <linearGradient id="hTruck" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E0731E" />
          <stop offset="100%" stopColor="#C45F14" />
        </linearGradient>
        <linearGradient id="hTruck2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F1D24A" />
          <stop offset="100%" stopColor="#D4AA0C" />
        </linearGradient>
        <linearGradient id="hHills" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C8E6C9" />
          <stop offset="100%" stopColor="#A5D6A7" />
        </linearGradient>
        <linearGradient id="hHills2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DCEDC8" />
          <stop offset="100%" stopColor="#C5E1A5" />
        </linearGradient>
        <radialGradient id="hSun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF9C4" />
          <stop offset="100%" stopColor="#F1D24A" stopOpacity="0" />
        </radialGradient>
        <filter id="hShadow" x="-10%" y="-10%" width="130%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#00000025" />
        </filter>
      </defs>

      {/* Sky */}
      <rect width="680" height="480" fill="url(#hSky)" />

      {/* Sun */}
      <circle cx="560" cy="80" r="55" fill="url(#hSun)" opacity="0.7" />
      <circle cx="560" cy="80" r="32" fill="#FFF9C4" opacity="0.9" />

      {/* Clouds */}
      <ellipse cx="110" cy="75" rx="55" ry="22" fill="white" opacity="0.85" />
      <ellipse cx="148" cy="62" rx="42" ry="20" fill="white" opacity="0.85" />
      <ellipse cx="76"  cy="70" rx="36" ry="17" fill="white" opacity="0.7"  />
      <ellipse cx="370" cy="50" rx="48" ry="19" fill="white" opacity="0.75" />
      <ellipse cx="408" cy="38" rx="36" ry="17" fill="white" opacity="0.75" />
      <ellipse cx="338" cy="46" rx="30" ry="15" fill="white" opacity="0.6"  />

      {/* Far hills */}
      <path
        d="M0 290 Q80 215 160 250 Q240 205 320 248 Q400 208 480 242 Q560 200 640 232 L680 230 L680 310 L0 310 Z"
        fill="url(#hHills2)" opacity="0.5"
      />
      {/* Near hills */}
      <path
        d="M0 318 Q60 262 140 292 Q220 258 310 288 Q380 260 450 282 Q530 254 620 277 L680 272 L680 328 L0 328 Z"
        fill="url(#hHills)" opacity="0.8"
      />

      {/* Ground */}
      <rect x="0" y="328" width="680" height="37" fill="#8BC34A" opacity="0.28" />

      {/* Road */}
      <rect x="0" y="358" width="680" height="122" fill="url(#hRoad)" />
      <rect x="0" y="358" width="680" height="3"   fill="#6A6A68" />

      {/* Lane dashes */}
      <rect x="0"   y="418" width="80" height="5" rx="2" fill="#F1D24A" opacity="0.65" />
      <rect x="110" y="418" width="80" height="5" rx="2" fill="#F1D24A" opacity="0.65" />
      <rect x="220" y="418" width="80" height="5" rx="2" fill="#F1D24A" opacity="0.65" />
      <rect x="330" y="418" width="80" height="5" rx="2" fill="#F1D24A" opacity="0.65" />
      <rect x="440" y="418" width="80" height="5" rx="2" fill="#F1D24A" opacity="0.65" />
      <rect x="550" y="418" width="80" height="5" rx="2" fill="#F1D24A" opacity="0.65" />
      <rect x="640" y="418" width="40" height="5" rx="2" fill="#F1D24A" opacity="0.65" />
      {/* Shoulder stripe */}
      <rect x="0" y="474" width="680" height="4" fill="#F1D24A" opacity="0.4" />

      {/* Gujarat route network */}
      <line x1="80"  y1="140" x2="200" y2="185" stroke="#E0731E" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.18" />
      <line x1="200" y1="185" x2="110" y2="235" stroke="#E0731E" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.18" />
      <line x1="200" y1="185" x2="300" y2="255" stroke="#E0731E" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.18" />
      <line x1="110" y1="235" x2="300" y2="255" stroke="#E0731E" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.18" />
      <line x1="300" y1="255" x2="460" y2="196" stroke="#E0731E" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.18" />
      <line x1="300" y1="255" x2="400" y2="285" stroke="#E0731E" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.18" />
      <line x1="460" y1="196" x2="400" y2="285" stroke="#E0731E" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.18" />

      {/* Route dots */}
      <circle cx="80"  cy="140" r="6" fill="#E0731E" opacity="0.18" />
      <circle cx="80"  cy="140" r="3" fill="#E0731E" opacity="0.45" />
      <text x="92" y="144" fontSize="9" fill="#6B6B68" fontWeight="600" opacity="0.7">AMD</text>

      <circle cx="200" cy="185" r="6" fill="#E0731E" opacity="0.18" />
      <circle cx="200" cy="185" r="3" fill="#E0731E" opacity="0.45" />
      <text x="212" y="189" fontSize="9" fill="#6B6B68" fontWeight="600" opacity="0.7">VDR</text>

      <circle cx="110" cy="235" r="6" fill="#E0731E" opacity="0.18" />
      <circle cx="110" cy="235" r="3" fill="#E0731E" opacity="0.45" />
      <text x="122" y="239" fontSize="9" fill="#6B6B68" fontWeight="600" opacity="0.7">RJK</text>

      <circle cx="300" cy="255" r="6" fill="#E0731E" opacity="0.18" />
      <circle cx="300" cy="255" r="3" fill="#E0731E" opacity="0.45" />
      <text x="312" y="259" fontSize="9" fill="#6B6B68" fontWeight="600" opacity="0.7">SUR</text>

      <circle cx="460" cy="196" r="6" fill="#E0731E" opacity="0.18" />
      <circle cx="460" cy="196" r="3" fill="#E0731E" opacity="0.45" />
      <text x="472" y="200" fontSize="9" fill="#6B6B68" fontWeight="600" opacity="0.7">BOM</text>

      <circle cx="400" cy="285" r="6" fill="#E0731E" opacity="0.18" />
      <circle cx="400" cy="285" r="3" fill="#E0731E" opacity="0.45" />
      <text x="412" y="289" fontSize="9" fill="#6B6B68" fontWeight="600" opacity="0.7">PUN</text>

      {/* ── Main FTL truck ───────────────────────────────────────────────── */}
      <g transform="translate(190, 335)" filter="url(#hShadow)">
        {/* Trailer body */}
        <rect x="0" y="0" width="290" height="95" rx="4" fill="#D8D6D0" />
        <rect x="0" y="0" width="290" height="95" rx="4" fill="none" stroke="#C0BDB6" strokeWidth="1.5" />
        {/* BGTS branding stripe */}
        <rect x="0" y="28" width="290" height="36" fill="url(#hTruck)" opacity="0.92" />
        <text x="145" y="53" textAnchor="middle" fill="white" fontSize="19" fontWeight="900"
          fontFamily="system-ui, sans-serif" letterSpacing="5">BGTS</text>
        {/* Trailer ribs */}
        <line x1="58"  y1="0" x2="58"  y2="95" stroke="#B8B5AE" strokeWidth="1.5" opacity="0.6" />
        <line x1="116" y1="0" x2="116" y2="95" stroke="#B8B5AE" strokeWidth="1.5" opacity="0.6" />
        <line x1="174" y1="0" x2="174" y2="95" stroke="#B8B5AE" strokeWidth="1.5" opacity="0.6" />
        <line x1="232" y1="0" x2="232" y2="95" stroke="#B8B5AE" strokeWidth="1.5" opacity="0.6" />
        {/* Rear door detail */}
        <rect x="1" y="1" width="20" height="93" rx="2" fill="#C8C5BE" opacity="0.5" />
        <rect x="9" y="42" width="4"  height="10" rx="2" fill="#8A8880" />
        {/* Cab */}
        <rect x="285" y="5" width="55" height="90" rx="5" fill="#C45F14" />
        <rect x="290" y="10" width="44" height="33" rx="3" fill="#AED6F1" opacity="0.85" />
        <rect x="330" y="54" width="10" height="37" rx="2" fill="#B0470E" />
        <rect x="330" y="13" width="8"  height="6"  rx="1" fill="#FFF9C4" />
        <rect x="330" y="21" width="8"  height="4"  rx="1" fill="#FFF176" opacity="0.7" />
        <rect x="330" y="83" width="10" height="8"  rx="1" fill="#9A3D0A" />
        {/* Wheels — trailer */}
        <circle cx="30"  cy="97" r="20" fill="#2D2D2B" />
        <circle cx="30"  cy="97" r="12" fill="#454542" />
        <circle cx="30"  cy="97" r="6"  fill="#6A6A68" />
        <circle cx="90"  cy="97" r="20" fill="#2D2D2B" />
        <circle cx="90"  cy="97" r="12" fill="#454542" />
        <circle cx="90"  cy="97" r="6"  fill="#6A6A68" />
        <circle cx="180" cy="97" r="20" fill="#2D2D2B" />
        <circle cx="180" cy="97" r="12" fill="#454542" />
        <circle cx="180" cy="97" r="6"  fill="#6A6A68" />
        <circle cx="240" cy="97" r="20" fill="#2D2D2B" />
        <circle cx="240" cy="97" r="12" fill="#454542" />
        <circle cx="240" cy="97" r="6"  fill="#6A6A68" />
        {/* Cab wheel */}
        <circle cx="305" cy="97" r="20" fill="#2D2D2B" />
        <circle cx="305" cy="97" r="12" fill="#454542" />
        <circle cx="305" cy="97" r="6"  fill="#6A6A68" />
      </g>

      {/* ── Smaller saffron truck (background left) ──────────────────────── */}
      <g transform="translate(40, 355)" filter="url(#hShadow)" opacity="0.72">
        <rect x="0" y="0" width="140" height="50" rx="3" fill="url(#hTruck2)" />
        <rect x="0" y="12" width="140" height="18" fill="#D4AA0C" opacity="0.4" />
        <text x="70" y="25" textAnchor="middle" fill="#7A5A00" fontSize="9" fontWeight="700"
          fontFamily="system-ui, sans-serif" letterSpacing="2">BGTS PTL</text>
        <rect x="135" y="3" width="30" height="47" rx="3" fill="#C89A0A" />
        <rect x="137" y="7" width="24" height="20" rx="2" fill="#AED6F1" opacity="0.8" />
        <circle cx="20"  cy="52" r="12" fill="#2D2D2B" />
        <circle cx="20"  cy="52" r="6"  fill="#454542" />
        <circle cx="60"  cy="52" r="12" fill="#2D2D2B" />
        <circle cx="60"  cy="52" r="6"  fill="#454542" />
        <circle cx="100" cy="52" r="12" fill="#2D2D2B" />
        <circle cx="100" cy="52" r="6"  fill="#454542" />
        <circle cx="148" cy="52" r="12" fill="#2D2D2B" />
        <circle cx="148" cy="52" r="6"  fill="#454542" />
      </g>

      {/* Floating badge — On-time */}
      <g transform="translate(488, 160)">
        <rect width="170" height="44" rx="10" fill="white" opacity="0.97" />
        <circle cx="21" cy="22" r="8" fill="#E0731E" opacity="0.15" />
        <circle cx="21" cy="22" r="4" fill="#E0731E" />
        <text x="36" y="17" fontSize="10" fill="#6B6B68" fontFamily="system-ui, sans-serif">On-Time Delivery</text>
        <text x="36" y="33" fontSize="13" fill="#1A1A18" fontWeight="800" fontFamily="system-ui, sans-serif">99.2% · FY 2025</text>
      </g>

      {/* Floating badge — Routes */}
      <g transform="translate(488, 215)">
        <rect width="170" height="44" rx="10" fill="white" opacity="0.97" />
        <circle cx="21" cy="22" r="8" fill="#4A90D9" opacity="0.15" />
        <circle cx="21" cy="22" r="4" fill="#4A90D9" />
        <text x="36" y="17" fontSize="10" fill="#6B6B68" fontFamily="system-ui, sans-serif">Active Routes</text>
        <text x="36" y="33" fontSize="13" fill="#1A1A18" fontWeight="800" fontFamily="system-ui, sans-serif">340+ · Guj · MH</text>
      </g>
    </svg>
  )
}

// ─── Hero section ─────────────────────────────────────────────────────────
export function Hero() {
  return (
    <section
      className="relative pt-header overflow-hidden bg-[#FAFAF8]"
      aria-label="BGTS — Baroda Goods Transport Service"
    >
      {/* Radial brand glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 80% 40%, rgba(224,115,30,0.06) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="container-xl relative z-10 py-16 md:py-24 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left column ───────────────────────────────────────────── */}
          <div className="flex gap-5">
            {/* Accent bar */}
            <div
              className="hidden md:block w-1.5 self-stretch rounded-full shrink-0"
              style={{ background: 'linear-gradient(180deg,#E0731E 0%,#F1D24A 100%)' }}
              aria-hidden="true"
            />

            <div>
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Tag variant="brand" size="sm">Est. 1950 · Vadodara</Tag>
                <Tag variant="neutral" size="sm">Gujarat · Maharashtra</Tag>
              </div>

              <h1 className="font-display font-black text-5xl md:text-6xl text-ink-strong tracking-tight leading-[1.05] mb-5">
                India moves<br />
                <span className="text-gradient-energy">on BGTS.</span>
              </h1>

              <p className="text-ink-muted text-lg md:text-xl leading-relaxed mb-8 max-w-lg">
                Technology-enabled road, rail &amp; multimodal freight. FTL,
                PTL, express parcel, tankers, and ODC across 340+ routes
                from Gujarat to PAN India.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mb-10">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Truck size={16} />}
                  iconPosition="left"
                  asChild
                >
                  <Link href="/quote">Get a Quote</Link>
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<Search size={16} />}
                  iconPosition="left"
                  asChild
                >
                  <Link href="/tracking">Track Shipment</Link>
                </Button>
              </div>

              {/* Stat strip */}
              <div className="flex flex-wrap gap-x-8 gap-y-4 pt-6 border-t border-ink-ghost/15">
                {[
                  { value: '75+',    label: 'Years in freight' },
                  { value: '2,000+', label: 'Vehicles' },
                  { value: '340+',   label: 'Active routes' },
                  { value: '99.2%',  label: 'On-time FY25' },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="font-display font-black text-2xl text-brand leading-none mb-0.5">
                      {value}
                    </p>
                    <p className="text-xs text-ink-muted">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column: SVG illustration ──────────────────────── */}
          <div className="relative w-full aspect-[680/480] max-h-[480px]">
            <TransportScene />
          </div>

        </div>
      </div>

      {/* Bottom rule */}
      <div className="h-px bg-ink-ghost/10" aria-hidden="true" />
    </section>
  )
}
