# BGTS Next.js — Setup & Run Guide

## Quick start (3 commands)

```bash
cd bgts-nextjs
npm install
npm run dev
```

Then open: **http://localhost:3000**

---

## What's included (Phase 1–3 complete)

### Foundation files
- `package.json` — all dependencies
- `tailwind.config.ts` — full DS token mapping (brand orange, eko green, saffron, slate)
- `src/styles/globals.css` — CSS custom properties + base styles + animations
- `next.config.ts` — security headers, redirects, image config
- `tsconfig.json` — TypeScript strict mode, `@/*` path alias

### Types (`src/types/`)
- `index.ts` — shared types (NavLink, StatItem, Branch, Testimonial, Consignment, Vehicle, BookingFormData, QuoteResult)
- `freight.ts` — ServiceSlug, TransportMode, VehicleType, Service, FreightRate, Route
- `ekohaul.ts` — EkoVehicle, EkoFleetPlan, CarbonCalcInput/Result, EkoBookingForm, ESGReport

### Data (`src/data/`)
- `services.ts` — all 8 BGTS services with rates and features
- `branches.ts` — 12 branches across Gujarat and Maharashtra
- `industries.ts` — 9 industry verticals
- `ekohaul-vehicles.ts` — 4 EV vehicle specs + 3 fleet plans (FlexEV/DediEV/FleetEV)
- `testimonials.ts` — 5 client testimonials

### Lib (`src/lib/`)
- `utils.ts` — cn(), formatRs(), formatNumber(), generateLRNumber()
- `freight-calculator.ts` — calculateFreightQuote() with exact DS rate table
- `carbon-calculator.ts` — calculateCarbon() with exact DS emission factors (DIESEL_EF=2.68, GRID_EF=0.71, SOLAR_EF=0.04)

### Hooks (`src/hooks/`)
- `useCounter.ts` — animated count-up with ease-out cubic
- `useInView.ts` — IntersectionObserver hook for scroll animations

### App layout (`src/app/`)
- `layout.tsx` — Archivo + Hanken Grotesk + IBM Plex Mono fonts, org schema, metadata
- `page.tsx` — Homepage assembling all sections
- `ekohaul/layout.tsx` — EkoHaul sub-brand with `data-brand="ekohaul"` token override
- `sitemap.ts` — auto-generated sitemap
- `robots.ts` — robots.txt

### Components
- **Layout**: Navbar (sticky, scroll shadow, dropdowns, mobile), Footer (dark, link grid), EkoHaulNavbar, EkoHaulFooter
- **UI**: Button (6 variants, 4 sizes, loading state), Tag, StatusBadge (5 consignment states), SectionHeading
- **Sections**: Hero (dark, Gujarat route SVG), TrustStrip (marquee), Stats (animated counters), Services (8-card grid), Modes (Road/Rail/Air), Industries (9-tile grid), EkoBanner (green), CTABanner (energy gradient)

---

## What's next (Phases 4–6)

Run this session again to generate:

**Phase 4 — Core pages:**
- `app/quote/page.tsx` — 4-step booking wizard (Route → Cargo → Service → Confirm)
- `app/tracking/page.tsx` — consignment tracking
- `app/about/page.tsx`
- `app/contact/page.tsx`
- `app/fleet/page.tsx`
- `app/services/page.tsx` + `[slug]/page.tsx`

**Phase 5 — EkoHaul pages:**
- `app/ekohaul/page.tsx` — full EkoHaul landing
- `app/ekohaul/esg/page.tsx` — live carbon calculator
- `app/ekohaul/book/page.tsx` — fleet booking form

**Phase 6 — Polish:**
- Per-page loading.tsx / error.tsx
- `components/forms/QuoteForm.tsx` — React Hook Form + Zod
- `components/forms/TrackingForm.tsx`

---

## Design tokens reference

| Token | Value | Usage |
|---|---|---|
| `brand.DEFAULT` | `#E0731E` | BGTS orange — CTAs, icons |
| `eko.DEFAULT` | `#138A4F` | EkoHaul green |
| `saffron.DEFAULT` | `#F1D24A` | Gradient accent |
| `brick.DEFAULT` | `#C03030` | Gradient end |
| `ink.strong` | `#21211F` | Headings |
| `surface.page` | `#F6F6F4` | Page background |
| `surface.inverse` | `#131312` | Footer, dark sections |
