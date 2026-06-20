import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { Stats } from '@/components/sections/Stats'
import { Services } from '@/components/sections/Services'
import { EkoBanner } from '@/components/sections/EkoBanner'
import { CTABanner } from '@/components/sections/CTABanner'
import { TrustStrip } from '@/components/sections/TrustStrip'
import { Industries } from '@/components/sections/Industries'
import { Modes } from '@/components/sections/Modes'

export const metadata: Metadata = {
  title: 'BGTS — Technology-Enabled Transport & Logistics | Gujarat, Maharashtra',
  description:
    "Baroda Goods Transport Service — India's trusted road, rail, and multimodal logistics company since 1950. FTL, PTL, Express, Warehousing across Gujarat and Maharashtra.",
  openGraph: {
    title: "BGTS — Moving India's goods, on time, since 1950",
    description:
      'Technology-enabled road, rail, and multimodal logistics across Gujarat and Maharashtra. FTL, PTL, Express, Warehousing, and BGTS EV Fleet.',
  },
}

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* 1. Hero */}
      <Hero />

      {/* 2. Trust strip — industry logos marquee */}
      <TrustStrip />

      {/* 3. Stats — animated counters */}
      <Stats />

      {/* 4. Services grid */}
      <Services />

      {/* 5. Transport modes — Road, Rail, Air */}
      <Modes />

      {/* 6. Industries served */}
      <Industries />

      {/* 7. BGTS EV section — green */}
      <EkoBanner />

      {/* 8. CTA — energy gradient */}
      <CTABanner />

      <Footer />
    </>
  )
}
