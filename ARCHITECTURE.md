# BGTS Next.js — Architecture & Migration Plan
**Version 1.0 | June 2026 | Confidential**

---

## 1. Design System Audit

### Existing Assets (from BGTS Design System ZIP)
| UI Kit | Content | Next.js Route |
|---|---|---|
| `marketing/` | Homepage, hero, services, modes, EkoHaul banner, CTA | `app/page.tsx` |
| `booking/` | 4-step freight booking wizard (Route→Cargo→Service→Confirm) | `app/quote/page.tsx` |
| `dashboard/` | Ops control tower: KPIs, consignments, fleet, exceptions | `app/dashboard/page.tsx` |
| `mobile/` | Customer tracking app screens | `app/tracking/page.tsx` |
| `ekohaul_marketing/` | EkoHaul brand site, hero, pricing, ESG | `app/ekohaul/page.tsx` |
| `ekohaul_booking/` | EkoHaul FlexEV/DediEV/FleetEV booking | `app/ekohaul/book/page.tsx` |
| `ekohaul_esg/` | Live carbon calculator + BRSR report generator | `app/ekohaul/esg/page.tsx` |
| `ekohaul_fleet/` | EV fleet operations dashboard | `app/ekohaul/fleet/page.tsx` |
| `ekohaul_report/` | EkoHaul project report PDF view | `app/ekohaul/report/page.tsx` |

### Token Migration: CSS → Tailwind
| DS Token | Tailwind Key | Value |
|---|---|---|
| `--orange-500` (brand primary) | `brand.DEFAULT` | `#E0731E` |
| `--orange-600` (hover) | `brand.hover` | `#C45F14` |
| `--orange-50` (subtle) | `brand.subtle` | `#FEF4EB` |
| `--saffron-300` (accent/arrow gold) | `saffron.DEFAULT` | `#F1D24A` |
| `--red-500` (arrowhead) | `brick.DEFAULT` | `#C03030` |
| `--slate-900` (heading text) | `ink.strong` | `#21211F` |
| `--slate-800` (body) | `ink.body` | `#343432` |
| `--slate-500` (muted) | `ink.muted` | `#777672` |
| `--slate-50` (page bg) | `surface.page` | `#F6F6F4` |
| `--slate-0` (card) | `surface.card` | `#FFFFFF` |
| `--slate-950` (inverse/footer) | `surface.inverse` | `#131312` |
| `--eko-500` (EkoHaul green) | `eko.DEFAULT` | `#138A4F` |
| `--eko-teal-500` | `eko.teal` | `#119C97` |
| `--eko-lime-300` | `eko.lime` | `#B7E84B` |
| `--green-500` (success) | `success.DEFAULT` | `#1F8A4C` |
| `--blue-500` (info) | `info.DEFAULT` | `#2A6FB0` |

### Typography
- **Headings**: Archivo (800–900 weight) — `font-display`
- **Body**: Hanken Grotesk (400–700) — `font-body`
- **Mono**: IBM Plex Mono — `font-mono`
- **Eyebrows**: Archivo, uppercase, letter-spacing wide

### Gradient Signature
- `--gradient-energy`: `105deg, saffron-300 → orange-500 → red-500` (CTA banners, arrow motif)
- `--gradient-eko`: `120deg, teal-500 → eko-500 → eko-600` (EkoHaul CTAs)

---

## 2. Project Structure

```
bgts-nextjs/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    ← Root layout, fonts, metadata
│   │   ├── page.tsx                      ← BGTS Homepage
│   │   ├── about/page.tsx
│   │   ├── services/
│   │   │   ├── page.tsx                  ← Services index
│   │   │   └── [slug]/page.tsx           ← Individual service page
│   │   ├── fleet/page.tsx
│   │   ├── industries/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── tracking/page.tsx
│   │   ├── quote/page.tsx                ← 4-step booking wizard
│   │   ├── contact/page.tsx
│   │   ├── dashboard/page.tsx            ← Ops control tower (protected)
│   │   ├── ekohaul/
│   │   │   ├── layout.tsx                ← EkoHaul sub-brand layout
│   │   │   ├── page.tsx                  ← EkoHaul homepage
│   │   │   ├── book/page.tsx
│   │   │   ├── esg/page.tsx
│   │   │   └── fleet/page.tsx
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── EkoHaulNavbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── EkoHaulFooter.tsx
│   │   ├── sections/
│   │   │   ├── Hero.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── Modes.tsx
│   │   │   ├── Network.tsx
│   │   │   ├── TrackingPreview.tsx
│   │   │   ├── EkoBanner.tsx
│   │   │   ├── CTABanner.tsx
│   │   │   ├── Stats.tsx
│   │   │   └── Testimonials.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Tag.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   └── SectionHeading.tsx
│   │   ├── forms/
│   │   │   ├── QuoteForm.tsx             ← Multi-step booking
│   │   │   ├── ContactForm.tsx
│   │   │   └── TrackingForm.tsx
│   │   └── shared/
│   │       ├── EnergyGradientBar.tsx
│   │       └── EkoGradientBar.tsx
│   │
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── freight-calculator.ts         ← Ported from booking/index.html
│   │   └── carbon-calculator.ts          ← Ported from ekohaul_esg/index.html
│   │
│   ├── data/
│   │   ├── services.ts
│   │   ├── industries.ts
│   │   ├── fleet.ts
│   │   ├── branches.ts
│   │   ├── ekohaul-vehicles.ts
│   │   └── testimonials.ts
│   │
│   ├── hooks/
│   │   ├── useCounter.ts
│   │   └── useInView.ts
│   │
│   ├── types/
│   │   ├── index.ts
│   │   ├── freight.ts
│   │   └── ekohaul.ts
│   │
│   └── styles/
│       └── globals.css
│
├── public/
│   ├── logo-bgts-color.png
│   ├── logo-bgts-white.png
│   └── mark-arrow.png
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Migration Plan — Phase by Phase

### Phase 1: Foundation (this session)
- [x] package.json
- [x] tailwind.config.ts (full token mapping)
- [x] src/styles/globals.css
- [x] src/types/index.ts + freight.ts + ekohaul.ts
- [x] src/data/ (all static data files)
- [x] src/lib/utils.ts + calculators
- [x] src/hooks/useCounter.ts + useInView.ts
- [x] app/layout.tsx (fonts, metadata, Navbar, Footer)

### Phase 2: UI Component Library
- [x] components/ui/ — Button, Tag, StatusBadge, Card, Input, Select, SectionHeading
- [x] components/layout/ — Navbar, Footer, EkoHaulNavbar, EkoHaulFooter
- [x] components/shared/ — EnergyGradientBar, EkoGradientBar

### Phase 3: Homepage + Sections
- [x] components/sections/ — Hero, Services, Modes, Network, EkoBanner, CTABanner, Stats
- [x] app/page.tsx

### Phase 4: Core Pages
- [x] app/quote/page.tsx (4-step booking wizard)
- [x] app/tracking/page.tsx
- [x] app/about/page.tsx
- [x] app/contact/page.tsx
- [x] app/fleet/page.tsx
- [x] app/services/page.tsx

### Phase 5: EkoHaul Sub-brand
- [x] app/ekohaul/layout.tsx
- [x] app/ekohaul/page.tsx
- [x] app/ekohaul/esg/page.tsx (carbon calculator)
- [x] app/ekohaul/book/page.tsx

### Phase 6: SEO + Config
- [x] app/sitemap.ts
- [x] app/robots.ts
- [x] next.config.ts
- [x] Metadata for every page

---

## 4. Key Architectural Decisions

| Decision | Choice | Reason |
|---|---|---|
| Rendering | Server Components default, Client for interactive | SEO + performance |
| Styling | Tailwind CSS + CSS variables (dual-system) | DS tokens preserved exactly |
| Forms | React Hook Form + Zod | Booking wizard needs validation |
| Animation | Framer Motion | Subtle, enterprise-grade |
| Icons | Lucide React | Matches existing DS |
| UI base | Shadcn/UI (selective) | Accessible, unstyled, customisable |
| EkoHaul theming | `data-brand="ekohaul"` on layout root | Mirrors existing DS pattern |
| State | URL search params for booking steps | Shareable, SSR-compatible |

---

## 5. Improvements Beyond Original HTML

1. **TypeScript everywhere** — all data, components, and calculators fully typed
2. **React Hook Form + Zod validation** — booking wizard with proper error states
3. **Framer Motion scroll animations** — staggered service cards, counter animations
4. **Next.js Image** — optimised logos and fleet photos (WebP, lazy loading)
5. **Metadata API** — per-page title, description, OG tags, structured data
6. **Sitemap + robots** — auto-generated, SEO-ready
7. **Error boundaries** — each page has error.tsx and loading.tsx
8. **Accessibility** — skip-to-content link, ARIA labels on all interactive elements
9. **Carbon calculator accuracy** — exact methodology from EkoHaul ESG kit preserved
10. **Mobile-first breakpoints** — full responsive overhaul (existing DS only has 920px/560px breakpoints)
