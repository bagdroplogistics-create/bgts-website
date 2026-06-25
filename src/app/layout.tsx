import type { Metadata } from 'next'
import Script from 'next/script'
import { Archivo, Hanken_Grotesk, IBM_Plex_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { BookingModalProvider } from '@/contexts/BookingModalContext'
import { BGTSBookingModal } from '@/components/forms/BGTSBookingModal'
import { BGTSEVBookingModal } from '@/components/forms/BGTSEVBookingModal'

// ─── Font loading ─────────────────────────────────────────────────────────
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-archivo',
  display: 'swap',
})

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hanken',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-mono',
  display: 'swap',
})

// ─── Root metadata ────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL('https://bgts.in'),
  title: {
    default: 'BGTS — Technology-Enabled Transport & Logistics | Gujarat, Maharashtra',
    template: '%s | BGTS',
  },
  description:
    "Baroda Goods Transport Service — India's trusted road, rail, and multimodal logistics company since 1950. FTL, PTL, Express, Warehousing, and BGTS EV Fleet across Gujarat and Maharashtra.",
  keywords: [
    'transport company Gujarat',
    'logistics India',
    'FTL freight',
    'PTL parcel',
    'Vadodara transport',
    'EV cargo fleet',
    'warehousing Gujarat',
    'BGTS EV',
    'BGTS',
    'Baroda Goods Transport',
  ],
  authors: [{ name: 'BGTS', url: 'https://bgts.in' }],
  creator: 'BGTS — Baroda Goods Transport Service Pvt. Ltd.',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://bgts.in',
    siteName: 'BGTS',
    title: 'BGTS — Technology-Enabled Transport & Logistics',
    description:
      "India's trusted road, rail, and multimodal logistics company since 1950. FTL, PTL, Express, Warehousing, and BGTS EV Fleet across Gujarat and Maharashtra.",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "BGTS — Moving India's goods, on time, since 1950",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BGTS — Technology-Enabled Transport & Logistics',
    description:
      "India's trusted road and multimodal logistics company since 1950. FTL, PTL, Express, Warehousing.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

// ─── Root layout ──────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${hankenGrotesk.variable} ${ibmPlexMono.variable}`}
    >
      <body className="font-body antialiased bg-surface-page text-ink-body">
        {/* Accessibility: skip to main content */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>

        {/* Booking modals — available site-wide */}
        <BookingModalProvider>
          <BGTSBookingModal />
          <BGTSEVBookingModal />

          {/* Main content — Navbar and Footer are added per-layout */}
          <main id="main-content">
            {children}
          </main>
        </BookingModalProvider>

        {/* Structured data: Organisation */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Baroda Goods Transport Service Pvt. Ltd.',
              alternateName: 'BGTS',
              url: 'https://bgts.in',
              logo: 'https://bgts.in/logo-bgts-color.png',
              foundingDate: '1950',
              description:
                'Technology-enabled road, rail, and multimodal logistics company serving Gujarat and Maharashtra since 1950.',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Old Padra Road',
                addressLocality: 'Vadodara',
                addressRegion: 'Gujarat',
                postalCode: '390015',
                addressCountry: 'IN',
              },
              contactPoint: [
                {
                  '@type': 'ContactPoint',
                  telephone: '+91 63 5722 5722',
                  contactType: 'customer service',
                  availableLanguage: ['English', 'Hindi', 'Gujarati'],
                },
              ],
              sameAs: [
                'https://www.linkedin.com/company/bgts',
              ],
            }),
          }}
        />
      {/* ── Google Ads Tag (AW-18267437854) ── */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=AW-18267437854"
        strategy="afterInteractive"
      />
      <Script id="google-ads-tag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-18267437854');
        `}
      </Script>
      {/* ── Google Ads Conversion — Submit lead form ── */}
      <Script id="google-ads-conversion" strategy="afterInteractive">
        {`
          gtag('event', 'conversion', {
            'send_to': 'AW-18267437854/96quCNSL0cQcEJ72y4ZE',
            'value': 1.0,
            'currency': 'INR'
          });
        `}
      </Script>
      </body>
    </html>
  )
}
