import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BookNowButton } from '@/components/ui/BookNowButton'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { industries, getIndustry } from '@/data/industries'
import { services } from '@/data/services'
import {
  Car, FlaskConical, ShoppingCart, Scissors,
  Package, Cog, Wheat, Building, Zap, ArrowRight,
  CheckCircle, Truck,
} from 'lucide-react'

// ─── Static params ────────────────────────────────────────────────────────
export function generateStaticParams() {
  return industries.map((i) => ({ slug: i.slug }))
}

// ─── Dynamic metadata ─────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const industry = getIndustry(slug)
  if (!industry) return { title: 'Industry Not Found' }
  return {
    title: `${industry.name} Logistics | BGTS — Baroda Goods Transport`,
    description: industry.description,
    openGraph: {
      title: `${industry.name} Freight Solutions | BGTS`,
      description: industry.description,
    },
  }
}

// ─── Industry config ──────────────────────────────────────────────────────
const iconMap: Record<string, React.ReactNode> = {
  Car:           <Car size={24} />,
  FlaskConical:  <FlaskConical size={24} />,
  ShoppingCart:  <ShoppingCart size={24} />,
  Scissors:      <Scissors size={24} />,
  Package:       <Package size={24} />,
  Cog:           <Cog size={24} />,
  Wheat:         <Wheat size={24} />,
  Building:      <Building size={24} />,
  Zap:           <Zap size={24} />,
}

const industryAccent: Record<string, { bg: string; icon: string; tag: string }> = {
  automotive:     { bg: 'bg-orange-50',  icon: 'text-orange-500', tag: 'bg-orange-100 text-orange-700 border-orange-200' },
  chemical:       { bg: 'bg-purple-50',  icon: 'text-purple-500', tag: 'bg-purple-100 text-purple-700 border-purple-200' },
  fmcg:           { bg: 'bg-blue-50',    icon: 'text-blue-500',   tag: 'bg-blue-100 text-blue-700 border-blue-200'       },
  textile:        { bg: 'bg-pink-50',    icon: 'text-pink-500',   tag: 'bg-pink-100 text-pink-700 border-pink-200'       },
  ecommerce:      { bg: 'bg-sky-50',     icon: 'text-sky-500',    tag: 'bg-sky-100 text-sky-700 border-sky-200'          },
  engineering:    { bg: 'bg-zinc-100',   icon: 'text-zinc-600',   tag: 'bg-zinc-100 text-zinc-700 border-zinc-200'       },
  agri:           { bg: 'bg-green-50',   icon: 'text-green-600',  tag: 'bg-green-100 text-green-700 border-green-200'    },
  infrastructure: { bg: 'bg-amber-50',   icon: 'text-amber-600',  tag: 'bg-amber-100 text-amber-700 border-amber-200'    },
  energy:         { bg: 'bg-yellow-50',  icon: 'text-yellow-600', tag: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
}

// ─── Industry-specific key benefits ──────────────────────────────────────
const industryBenefits: Record<string, string[]> = {
  automotive: [
    'JIT milk-run circuits for OEM assembly lines',
    'Dedicated routes: Halol, Vithal Udyognagar, Sanand clusters',
    'In-plant logistics support with trained crew',
    'Real-time LR tracking integrated with ERP systems',
    'Cross-dock facilities near major plant gates',
  ],
  chemical: [
    'ADC-certified tanker fleet for hazmat transport',
    'Dedicated pharma-grade vehicles with temp monitoring',
    'Compliance documentation: TREM cards, emergency plans',
    'Leak-proof bulk containers for corrosive materials',
    'Driver training for hazardous material handling',
  ],
  fmcg: [
    'High-frequency daily replenishment from DCs to stores',
    'Multi-point PTL delivery across 200+ pin codes',
    'Warehouse-to-shelf solutions with in-store helpers',
    'Returns logistics and damaged goods management',
    'Route-optimised fleet for seasonal demand spikes',
  ],
  textile: [
    'Surat cluster to PAN India distribution',
    'White-glove handling for premium fabric and garments',
    'Temperature and humidity controlled options',
    'Customs-bonded warehousing for export shipments',
    'Express parcel with next-day delivery to metros',
  ],
  ecommerce: [
    'API-ready integration with major e-commerce platforms',
    'Same-day pick-up from seller fulfilment centres',
    'Next-day delivery across 200+ Gujarat pin codes',
    'Returns pick-up with automated reconciliation',
    'COD remittance within 48 hours of delivery',
  ],
  engineering: [
    'ODC and project cargo with pre-route survey',
    'Police escort coordination for oversized loads',
    'In-house permit management across state borders',
    'Heavy-lift cranes and rigging crew available',
    'Certified lashing, blocking, and securing experts',
  ],
  agri: [
    'FSSAI-compliant transport for food grade cargo',
    'Bulk grain, edible oil, and commodity tankers',
    'Cold-chain vans for fresh produce and dairy',
    'Mandi-to-processor freight across Gujarat heartland',
    'Seasonal surge fleet for harvest period peaks',
  ],
  infrastructure: [
    'Bulk cement and steel transport at project scale',
    'Dedicated fleet for NHAI and state highway projects',
    'Tipper and flatbed fleet for construction materials',
    'On-site logistics coordinator for large projects',
    'Flexible billing: trip-based or tonnage-based',
  ],
  energy: [
    'Specialist transport for transformers up to 300 MT',
    'Solar panel and wind turbine blade logistics',
    'Experience with L&T, Siemens, ABB supply chains',
    'Route engineering for heavy-haul power corridors',
    'Hydraulic modular trailers for oversized components',
  ],
}

// ─── SVG illustrations per industry ──────────────────────────────────────
function IndustryIllustration({ slug }: { slug: string }) {
  const illustrations: Record<string, React.ReactNode> = {
    automotive: (
      <svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Sky */}
        <rect width="480" height="300" fill="#F8F9FA" />
        {/* Factory silhouette */}
        <rect x="20" y="120" width="80" height="80" fill="#E9ECEF" rx="2" />
        <rect x="40" y="100" width="20" height="30" fill="#DEE2E6" />
        <rect x="65" y="105" width="15" height="25" fill="#DEE2E6" />
        {/* Chimneys */}
        <rect x="44" y="80" width="8" height="25" fill="#CED4DA" />
        <rect x="68" y="85" width="6" height="22" fill="#CED4DA" />
        {/* Smoke */}
        <circle cx="48" cy="75" r="5" fill="#E9ECEF" opacity="0.6" />
        <circle cx="51" cy="68" r="4" fill="#E9ECEF" opacity="0.4" />
        {/* Road */}
        <rect x="0" y="200" width="480" height="40" fill="#E9ECEF" />
        <rect x="0" y="215" width="480" height="5" fill="#DEE2E6" />
        {/* Road dashes */}
        {[40, 100, 160, 220, 280, 340, 400].map((x) => (
          <rect key={x} x={x} y="217" width="30" height="2" fill="white" rx="1" />
        ))}
        {/* Truck — carrier */}
        <rect x="150" y="155" width="130" height="50" fill="#E0731E" rx="4" />
        <rect x="260" y="163" width="40" height="42" fill="#B85A15" rx="3" />
        {/* Cab window */}
        <rect x="265" y="168" width="28" height="18" fill="#AED6F1" rx="2" opacity="0.8" />
        {/* Wheels */}
        <circle cx="175" cy="208" r="12" fill="#343A40" />
        <circle cx="175" cy="208" r="5" fill="#6C757D" />
        <circle cx="225" cy="208" r="12" fill="#343A40" />
        <circle cx="225" cy="208" r="5" fill="#6C757D" />
        <circle cx="275" cy="208" r="12" fill="#343A40" />
        <circle cx="275" cy="208" r="5" fill="#6C757D" />
        {/* Car being transported on bed */}
        <rect x="160" y="140" width="70" height="22" fill="#4A90D9" rx="6" />
        <rect x="170" y="130" width="50" height="16" fill="#5B9FE6" rx="5" />
        {/* Car windows */}
        <rect x="174" y="133" width="18" height="8" fill="#AED6F1" rx="2" opacity="0.9" />
        <rect x="196" y="133" width="18" height="8" fill="#AED6F1" rx="2" opacity="0.9" />
        {/* Small car 2 */}
        <rect x="250" y="142" width="55" height="18" fill="#E74C3C" rx="5" />
        <rect x="257" y="134" width="38" height="13" fill="#EC7063" rx="4" />
        <rect x="261" y="137" width="12" height="7" fill="#AED6F1" rx="1" opacity="0.9" />
        <rect x="276" y="137" width="12" height="7" fill="#AED6F1" rx="1" opacity="0.9" />
        {/* BGTS label */}
        <text x="175" y="185" fontSize="10" fill="white" fontWeight="700" fontFamily="monospace">BGTS AUTO</text>
        {/* Route sign */}
        <rect x="370" y="160" width="80" height="30" fill="white" rx="4" stroke="#DEE2E6" strokeWidth="1" />
        <text x="410" y="178" fontSize="9" fill="#495057" textAnchor="middle" fontWeight="600">Halol → Pune</text>
      </svg>
    ),

    chemical: (
      <svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="480" height="300" fill="#F8F9FA" />
        {/* Chemical plant */}
        <rect x="30" y="100" width="100" height="100" fill="#E9ECEF" rx="2" />
        {/* Tanks */}
        <ellipse cx="55" cy="110" rx="20" ry="10" fill="#DEE2E6" />
        <rect x="35" y="110" width="40" height="50" fill="#DEE2E6" />
        <ellipse cx="55" cy="160" rx="20" ry="10" fill="#CED4DA" />
        <ellipse cx="105" cy="110" rx="18" ry="9" fill="#B8C6D1" />
        <rect x="87" y="110" width="36" height="45" fill="#C8D6DF" />
        <ellipse cx="105" cy="155" rx="18" ry="9" fill="#A0B5C0" />
        {/* Pipes */}
        <path d="M75 130 Q90 125 95 130" stroke="#ADB5BD" strokeWidth="3" fill="none" />
        {/* Road */}
        <rect x="0" y="200" width="480" height="40" fill="#E9ECEF" />
        {[30, 90, 150, 210, 270, 330, 390].map((x) => (
          <rect key={x} x={x} y="217" width="30" height="2" fill="white" rx="1" />
        ))}
        {/* Tanker truck */}
        <rect x="200" y="165" width="120" height="38" fill="#6C63B0" rx="4" />
        {/* Tanker cylinder */}
        <ellipse cx="205" cy="184" rx="10" ry="18" fill="#5A529E" />
        <ellipse cx="315" cy="184" rx="10" ry="18" fill="#5A529E" />
        {/* Cab */}
        <rect x="310" y="170" width="50" height="36" fill="#4A4290" rx="3" />
        <rect x="315" y="175" width="35" height="18" fill="#AED6F1" rx="2" opacity="0.8" />
        {/* Hazmat diamond */}
        <rect x="235" y="174" width="14" height="14" fill="#E74C3C" transform="rotate(45 242 181)" rx="1" />
        <text x="242" y="184" fontSize="7" fill="white" textAnchor="middle" fontWeight="700">3</text>
        {/* ADC label */}
        <text x="250" y="190" fontSize="8" fill="white" fontWeight="700">ADC COMPLIANT</text>
        {/* Wheels */}
        {[215, 265, 325, 350].map((x) => (
          <g key={x}>
            <circle cx={x} cy="205" r="11" fill="#343A40" />
            <circle cx={x} cy="205" r="4" fill="#6C757D" />
          </g>
        ))}
        {/* Regulatory badge */}
        <rect x="360" y="155" width="90" height="28" fill="white" rx="4" stroke="#DEE2E6" strokeWidth="1" />
        <text x="405" y="169" fontSize="8" fill="#6C757D" textAnchor="middle">Certified Hazmat</text>
        <text x="405" y="178" fontSize="8" fill="#495057" textAnchor="middle" fontWeight="600">Transport Partner</text>
      </svg>
    ),

    fmcg: (
      <svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="480" height="300" fill="#F8F9FA" />
        {/* Warehouse */}
        <rect x="20" y="110" width="120" height="90" fill="#E9ECEF" rx="2" />
        <polygon points="20,110 80,75 140,110" fill="#DEE2E6" />
        {/* Warehouse doors */}
        <rect x="40" y="155" width="25" height="45" fill="#CED4DA" rx="1" />
        <rect x="75" y="155" width="25" height="45" fill="#CED4DA" rx="1" />
        {/* Shelves visible inside */}
        <rect x="28" y="120" width="50" height="3" fill="#B0B8BF" />
        <rect x="28" y="130" width="50" height="3" fill="#B0B8BF" />
        <rect x="28" y="140" width="50" height="3" fill="#B0B8BF" />
        {/* Boxes on shelves */}
        <rect x="30" y="115" width="8" height="8" fill="#E0731E" rx="1" />
        <rect x="40" y="115" width="8" height="8" fill="#4A90D9" rx="1" />
        <rect x="50" y="115" width="8" height="8" fill="#2ECC71" rx="1" />
        <rect x="30" y="125" width="8" height="8" fill="#9B59B6" rx="1" />
        <rect x="40" y="125" width="8" height="8" fill="#E74C3C" rx="1" />
        {/* Road */}
        <rect x="0" y="200" width="480" height="40" fill="#E9ECEF" />
        {[50, 110, 170, 230, 290, 350, 410].map((x) => (
          <rect key={x} x={x} y="217" width="28" height="2" fill="white" rx="1" />
        ))}
        {/* Delivery truck */}
        <rect x="180" y="160" width="100" height="42" fill="#2ECC71" rx="4" />
        <rect x="270" y="165" width="45" height="38" fill="#27AE60" rx="3" />
        <rect x="275" y="170" width="32" height="18" fill="#AED6F1" rx="2" opacity="0.8" />
        {/* FMCG boxes on truck */}
        <rect x="188" y="150" width="15" height="14" fill="#E0731E" rx="2" />
        <rect x="206" y="150" width="15" height="14" fill="#4A90D9" rx="2" />
        <rect x="224" y="150" width="15" height="14" fill="#E74C3C" rx="2" />
        <rect x="242" y="152" width="12" height="12" fill="#9B59B6" rx="2" />
        {/* Wheels */}
        {[200, 248, 282, 305].map((x) => (
          <g key={x}>
            <circle cx={x} cy="204" r="11" fill="#343A40" />
            <circle cx={x} cy="204" r="4" fill="#6C757D" />
          </g>
        ))}
        <text x="205" y="188" fontSize="9" fill="white" fontWeight="700">BGTS FMCG</text>
        {/* Store delivery point */}
        <rect x="360" y="140" width="80" height="60" fill="white" rx="4" stroke="#DEE2E6" strokeWidth="1.5" />
        <text x="400" y="162" fontSize="9" fill="#495057" textAnchor="middle" fontWeight="600">RETAIL</text>
        <text x="400" y="174" fontSize="8" fill="#6C757D" textAnchor="middle">Multi-point</text>
        <text x="400" y="184" fontSize="8" fill="#6C757D" textAnchor="middle">delivery</text>
        <rect x="370" y="190" width="60" height="10" fill="#2ECC71" rx="2" opacity="0.3" />
      </svg>
    ),

    textile: (
      <svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="480" height="300" fill="#F8F9FA" />
        {/* Surat textile cluster */}
        <rect x="20" y="100" width="60" height="100" fill="#E9ECEF" rx="2" />
        <rect x="88" y="115" width="50" height="85" fill="#DEE2E6" rx="2" />
        <text x="35" y="95" fontSize="8" fill="#6C757D" fontWeight="600">SURAT</text>
        {/* Fabric rolls */}
        <ellipse cx="40" cy="155" rx="10" ry="22" fill="#F8BBD9" />
        <ellipse cx="60" cy="155" rx="10" ry="22" fill="#CE93D8" />
        <ellipse cx="80" cy="155" rx="10" ry="22" fill="#80DEEA" />
        <ellipse cx="100" cy="160" rx="10" ry="20" fill="#FFB74D" />
        <ellipse cx="120" cy="158" rx="10" ry="21" fill="#A5D6A7" />
        {/* Road */}
        <rect x="0" y="200" width="480" height="40" fill="#E9ECEF" />
        {[40, 100, 160, 220, 280, 340, 400].map((x) => (
          <rect key={x} x={x} y="217" width="28" height="2" fill="white" rx="1" />
        ))}
        {/* PTL truck with fabric rolls */}
        <rect x="165" y="158" width="115" height="44" fill="#E0731E" rx="4" />
        <rect x="268" y="163" width="45" height="40" fill="#B85A15" rx="3" />
        <rect x="273" y="168" width="33" height="18" fill="#AED6F1" rx="2" opacity="0.8" />
        {/* Fabric rolls on truck */}
        <ellipse cx="185" cy="158" rx="9" ry="20" fill="#F8BBD9" />
        <ellipse cx="203" cy="158" rx="9" ry="20" fill="#CE93D8" />
        <ellipse cx="221" cy="158" rx="9" ry="20" fill="#80DEEA" />
        <ellipse cx="239" cy="160" rx="9" ry="19" fill="#FFB74D" />
        <ellipse cx="257" cy="159" rx="8" ry="19" fill="#A5D6A7" />
        {/* Wheels */}
        {[185, 235, 275, 300].map((x) => (
          <g key={x}>
            <circle cx={x} cy="204" r="11" fill="#343A40" />
            <circle cx={x} cy="204" r="4" fill="#6C757D" />
          </g>
        ))}
        <text x="192" y="186" fontSize="8" fill="white" fontWeight="700">BGTS EXPRESS</text>
        {/* Destination */}
        <rect x="370" y="150" width="80" height="35" fill="white" rx="4" stroke="#DEE2E6" strokeWidth="1" />
        <text x="410" y="165" fontSize="8" fill="#6C757D" textAnchor="middle">Surat → Delhi</text>
        <text x="410" y="178" fontSize="8" fill="#E0731E" textAnchor="middle" fontWeight="600">Next Day</text>
      </svg>
    ),

    ecommerce: (
      <svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="480" height="300" fill="#F8F9FA" />
        {/* Fulfilment centre */}
        <rect x="15" y="105" width="130" height="95" fill="#E9ECEF" rx="2" />
        <rect x="15" y="95" width="130" height="15" fill="#DEE2E6" rx="2 2 0 0" />
        <text x="80" y="106" fontSize="8" fill="#6C757D" textAnchor="middle" fontWeight="600">FULFILMENT CENTRE</text>
        {/* Conveyor belt indication */}
        <rect x="25" y="150" width="100" height="6" fill="#CED4DA" rx="3" />
        <circle cx="30" cy="153" r="3" fill="#ADB5BD" />
        <circle cx="120" cy="153" r="3" fill="#ADB5BD" />
        {/* Boxes on conveyor */}
        <rect x="45" y="142" width="12" height="12" fill="#E0731E" rx="2" />
        <rect x="62" y="142" width="12" height="12" fill="#4A90D9" rx="2" />
        <rect x="79" y="142" width="12" height="12" fill="#2ECC71" rx="2" />
        {/* Barcode scan indication */}
        <rect x="93" y="143" width="2" height="10" fill="#343A40" />
        <rect x="97" y="143" width="1" height="10" fill="#343A40" />
        <rect x="100" y="143" width="3" height="10" fill="#343A40" />
        {/* Road */}
        <rect x="0" y="200" width="480" height="40" fill="#E9ECEF" />
        {[50, 110, 170, 230, 290, 350, 410].map((x) => (
          <rect key={x} x={x} y="217" width="28" height="2" fill="white" rx="1" />
        ))}
        {/* Express van */}
        <rect x="180" y="163" width="90" height="40" fill="#4A90D9" rx="4" />
        <rect x="255" y="167" width="40" height="37" fill="#3A7BD5" rx="3" />
        <rect x="260" y="172" width="28" height="16" fill="#AED6F1" rx="2" opacity="0.8" />
        {/* Packages */}
        <rect x="188" y="156" width="12" height="12" fill="#E0731E" rx="2" />
        <rect x="204" y="154" width="14" height="14" fill="#2ECC71" rx="2" />
        <rect x="222" y="156" width="12" height="12" fill="#9B59B6" rx="2" />
        {/* Wheels */}
        {[197, 240, 268, 288].map((x) => (
          <g key={x}>
            <circle cx={x} cy="205" r="11" fill="#343A40" />
            <circle cx={x} cy="205" r="4" fill="#6C757D" />
          </g>
        ))}
        <text x="197" y="187" fontSize="8" fill="white" fontWeight="700">BGTS EXPRESS</text>
        {/* Pin drop delivery */}
        <circle cx="390" cy="175" r="12" fill="#E0731E" />
        <circle cx="390" cy="172" r="6" fill="white" />
        <path d="M390 178 L390 192" stroke="#E0731E" strokeWidth="2" />
        <text x="390" y="205" fontSize="8" fill="#495057" textAnchor="middle" fontWeight="600">DELIVERED</text>
        {/* Route dots */}
        {[330, 350, 370].map((x) => (
          <circle key={x} cx={x} cy="170" r="3" fill="#E0731E" opacity="0.4" />
        ))}
      </svg>
    ),

    engineering: (
      <svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="480" height="300" fill="#F8F9FA" />
        {/* Industrial facility */}
        <rect x="15" y="100" width="110" height="100" fill="#E9ECEF" rx="2" />
        <rect x="30" y="80" width="25" height="25" fill="#DEE2E6" />
        <rect x="62" y="88" width="20" height="18" fill="#DEE2E6" />
        <rect x="88" y="85" width="20" height="20" fill="#DEE2E6" />
        {/* Crane */}
        <rect x="115" y="50" width="5" height="150" fill="#B0BEC5" />
        <rect x="100" y="50" width="50" height="5" fill="#B0BEC5" />
        <line x1="120" y1="55" x2="120" y2="120" stroke="#90A4AE" strokeWidth="2" />
        <rect x="113" y="120" width="14" height="10" fill="#78909C" rx="1" />
        {/* Road (wider for ODC) */}
        <rect x="0" y="195" width="480" height="50" fill="#DEE2E6" />
        <rect x="0" y="210" width="480" height="4" fill="white" opacity="0.5" />
        <rect x="0" y="230" width="480" height="4" fill="white" opacity="0.5" />
        {/* Escort vehicle */}
        <rect x="150" y="200" width="40" height="22" fill="#E74C3C" rx="3" />
        <rect x="162" y="194" width="20" height="10" fill="#EC7063" rx="2" />
        <rect x="165" y="196" width="14" height="6" fill="#AED6F1" rx="1" opacity="0.8" />
        <circle cx="158" cy="224" r="8" fill="#343A40" />
        <circle cx="182" cy="224" r="8" fill="#343A40" />
        {/* Heavy-haul truck + trailer */}
        <rect x="195" y="185" width="200" height="35" fill="#607D8B" rx="4" />
        <rect x="370" y="188" width="55" height="33" fill="#546E7A" rx="3" />
        <rect x="376" y="193" width="40" height="18" fill="#AED6F1" rx="2" opacity="0.8" />
        {/* Transformer load */}
        <rect x="200" y="165" width="160" height="25" fill="#78909C" rx="3" />
        <rect x="215" y="155" width="130" height="16" fill="#8D9EA8" rx="3" />
        {/* Transformer details */}
        <rect x="225" y="158" width="15" height="10" fill="#607D8B" />
        <rect x="248" y="158" width="15" height="10" fill="#607D8B" />
        <rect x="271" y="158" width="15" height="10" fill="#607D8B" />
        <rect x="294" y="158" width="15" height="10" fill="#607D8B" />
        {/* Axle wheels */}
        {[210, 235, 265, 295, 325, 350, 390, 415].map((x) => (
          <g key={x}>
            <circle cx={x} cy="222" r="9" fill="#343A40" />
            <circle cx={x} cy="222" r="3" fill="#6C757D" />
          </g>
        ))}
        <text x="258" y="182" fontSize="9" fill="white" fontWeight="700">ODC CARGO — BGTS</text>
        {/* ODC permit sign */}
        <rect x="15" y="165" width="80" height="22" fill="#E74C3C" rx="3" />
        <text x="55" y="178" fontSize="9" fill="white" textAnchor="middle" fontWeight="700">⚠ WIDE LOAD</text>
      </svg>
    ),

    agri: (
      <svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="480" height="300" fill="#F0F7EE" />
        {/* Fields */}
        <rect x="0" y="160" width="160" height="40" fill="#C8E6C9" />
        <rect x="0" y="160" width="160" height="4" fill="#A5D6A7" />
        {[10, 30, 50, 70, 90, 110, 130, 150].map((x) => (
          <line key={x} x1={x} y1="160" x2={x} y2="200" stroke="#81C784" strokeWidth="1" opacity="0.5" />
        ))}
        {/* Grain silo */}
        <rect x="20" y="90" width="40" height="75" fill="#FFF9C4" rx="2" />
        <ellipse cx="40" cy="90" rx="20" ry="10" fill="#FFF176" />
        <rect x="25" y="140" width="30" height="30" fill="#F5F0B0" />
        {/* Second silo */}
        <rect x="68" y="100" width="35" height="65" fill="#FFF9C4" rx="2" />
        <ellipse cx="85" cy="100" rx="17" ry="8" fill="#FFF176" />
        {/* Road */}
        <rect x="0" y="200" width="480" height="40" fill="#E9ECEF" />
        {[40, 100, 160, 220, 280, 340, 400].map((x) => (
          <rect key={x} x={x} y="217" width="28" height="2" fill="white" rx="1" />
        ))}
        {/* Grain tanker */}
        <rect x="160" y="162" width="140" height="40" fill="#F39C12" rx="4" />
        <ellipse cx="165" cy="182" rx="8" ry="18" fill="#D68910" />
        <ellipse cx="295" cy="182" rx="8" ry="18" fill="#D68910" />
        {/* Cab */}
        <rect x="290" y="166" width="50" height="37" fill="#CA8A04" rx="3" />
        <rect x="295" y="171" width="36" height="18" fill="#AED6F1" rx="2" opacity="0.8" />
        {/* FSSAI label */}
        <rect x="190" y="174" width="85" height="14" fill="white" rx="2" opacity="0.85" />
        <text x="232" y="184" fontSize="8" fill="#2E7D32" textAnchor="middle" fontWeight="700">FSSAI CERTIFIED</text>
        {/* Wheels */}
        {[178, 225, 300, 330].map((x) => (
          <g key={x}>
            <circle cx={x} cy="204" r="11" fill="#343A40" />
            <circle cx={x} cy="204" r="4" fill="#6C757D" />
          </g>
        ))}
        {/* Wheat icon decoration */}
        <text x="370" y="190" fontSize="32" textAnchor="middle" opacity="0.15">🌾</text>
        <rect x="350" y="150" width="80" height="28" fill="white" rx="4" stroke="#DEE2E6" strokeWidth="1" />
        <text x="390" y="162" fontSize="8" fill="#6C757D" textAnchor="middle">Mandi → Processor</text>
        <text x="390" y="173" fontSize="8" fill="#2E7D32" textAnchor="middle" fontWeight="600">Gujarat Agri Routes</text>
      </svg>
    ),

    infrastructure: (
      <svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="480" height="300" fill="#F8F9FA" />
        {/* Construction site */}
        <rect x="15" y="130" width="90" height="70" fill="#E9ECEF" rx="2" />
        {/* Tower crane */}
        <rect x="95" y="50" width="8" height="150" fill="#F39C12" />
        <rect x="60" y="50" width="80" height="8" fill="#F39C12" />
        <line x1="99" y1="58" x2="90" y2="110" stroke="#D4860A" strokeWidth="2" />
        <line x1="99" y1="58" x2="135" y2="110" stroke="#D4860A" strokeWidth="2" />
        <rect x="85" y="108" width="16" height="12" fill="#E67E22" rx="1" />
        {/* Building under construction */}
        <rect x="15" y="110" width="70" height="90" fill="#F5F5F5" rx="1" />
        {[120, 135, 150, 165].map((y) => (
          <rect key={y} x="15" y={y} width="70" height="2" fill="#E9ECEF" />
        ))}
        {[25, 40, 55, 65].map((x) => (
          <rect key={x} x={x} y="110" width="2" height="90" fill="#E9ECEF" />
        ))}
        {/* Road (under construction — orange cones) */}
        <rect x="0" y="198" width="480" height="45" fill="#DEE2E6" />
        {[160, 220, 280].map((x) => (
          <g key={x}>
            <polygon points={`${x},198 ${x - 6},213 ${x + 6},213`} fill="#E0731E" />
          </g>
        ))}
        {/* Tipper truck */}
        <rect x="305" y="163" width="120" height="38" fill="#795548" rx="4" />
        {/* Raised tipper bed */}
        <rect x="310" y="148" width="80" height="22" fill="#8D6E63" rx="3" transform="rotate(-8 310 148)" />
        {/* Cab */}
        <rect x="390" y="167" width="50" height="35" fill="#6D4C41" rx="3" />
        <rect x="395" y="172" width="36" height="18" fill="#AED6F1" rx="2" opacity="0.8" />
        {/* Gravel spilling */}
        <ellipse cx="345" cy="185" rx="18" ry="5" fill="#BCAAA4" />
        {/* Wheels */}
        {[325, 370, 400, 428].map((x) => (
          <g key={x}>
            <circle cx={x} cy="203" r="11" fill="#343A40" />
            <circle cx={x} cy="203" r="4" fill="#6C757D" />
          </g>
        ))}
        <text x="330" y="188" fontSize="8" fill="white" fontWeight="700">BGTS INFRA</text>
        {/* Material labels */}
        <rect x="15" y="75" width="60" height="20" fill="white" rx="3" stroke="#DEE2E6" strokeWidth="1" />
        <text x="45" y="88" fontSize="8" fill="#495057" textAnchor="middle">Steel · Cement</text>
      </svg>
    ),

    energy: (
      <svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="480" height="300" fill="#FFFEF0" />
        {/* Solar panels */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${15 + i * 35}, 90)`}>
            <rect width="28" height="20" fill="#1565C0" rx="1" />
            <line x1="14" y1="0" x2="14" y2="20" stroke="#0D47A1" strokeWidth="1" />
            <line x1="0" y1="10" x2="28" y2="10" stroke="#0D47A1" strokeWidth="1" />
            <rect x="11" y="20" width="6" height="20" fill="#78909C" />
          </g>
        ))}
        {/* Wind turbine */}
        <rect x="130" y="80" width="6" height="120" fill="#90A4AE" />
        {/* Blades */}
        <line x1="133" y1="95" x2="133" y2="60" stroke="#B0BEC5" strokeWidth="5" strokeLinecap="round" />
        <line x1="133" y1="95" x2="108" y2="115" stroke="#B0BEC5" strokeWidth="5" strokeLinecap="round" />
        <line x1="133" y1="95" x2="158" y2="115" stroke="#B0BEC5" strokeWidth="5" strokeLinecap="round" />
        <circle cx="133" cy="95" r="5" fill="#78909C" />
        {/* Road */}
        <rect x="0" y="198" width="480" height="45" fill="#E9ECEF" />
        {[40, 100, 160, 220, 280, 340, 400].map((x) => (
          <rect key={x} x={x} y="215" width="28" height="2" fill="white" rx="1" />
        ))}
        {/* Heavy-haul with transformer */}
        <rect x="165" y="178" width="220" height="25" fill="#546E7A" rx="3" />
        {/* Multi-axle trailer */}
        <rect x="168" y="160" width="190" height="22" fill="#607D8B" rx="3" />
        {/* Transformer */}
        <rect x="175" y="130" width="170" height="35" fill="#455A64" rx="3" />
        <rect x="190" y="123" width="20" height="12" fill="#546E7A" rx="2" />
        <rect x="225" y="123" width="20" height="12" fill="#546E7A" rx="2" />
        <rect x="260" y="123" width="20" height="12" fill="#546E7A" rx="2" />
        <rect x="295" y="123" width="20" height="12" fill="#546E7A" rx="2" />
        {/* BGTS Heavy label */}
        <text x="230" y="150" fontSize="9" fill="white" fontWeight="700">BGTS HEAVY — ODC</text>
        {/* Escort truck */}
        <rect x="385" y="180" width="60" height="22" fill="#E74C3C" rx="3" />
        <rect x="395" y="174" width="30" height="10" fill="#EC7063" rx="2" />
        <rect x="398" y="176" width="22" height="6" fill="#AED6F1" rx="1" opacity="0.8" />
        {/* Wheels */}
        {[180, 215, 255, 295, 325, 360, 395, 435].map((x) => (
          <g key={x}>
            <circle cx={x} cy="205" r="9" fill="#343A40" />
            <circle cx={x} cy="205" r="3" fill="#6C757D" />
          </g>
        ))}
        {/* Permit */}
        <rect x="16" y="165" width="80" height="22" fill="#F39C12" rx="3" />
        <text x="56" y="179" fontSize="8" fill="white" textAnchor="middle" fontWeight="700">SPECIAL PERMIT</text>
      </svg>
    ),
  }

  return (
    <div className="w-full h-56 rounded-2xl overflow-hidden border border-ink-ghost/10 bg-[#F8F9FA]">
      {illustrations[slug] ?? (
        // Fallback generic truck illustration
        <svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <rect width="480" height="300" fill="#F8F9FA" />
          <rect x="0" y="200" width="480" height="40" fill="#E9ECEF" />
          {[40, 100, 160, 220, 280, 340, 400].map((x) => (
            <rect key={x} x={x} y="217" width="28" height="2" fill="white" rx="1" />
          ))}
          <rect x="180" y="160" width="130" height="42" fill="#E0731E" rx="4" />
          <rect x="295" y="165" width="45" height="38" fill="#B85A15" rx="3" />
          <rect x="300" y="170" width="33" height="18" fill="#AED6F1" rx="2" opacity="0.8" />
          {[200, 248, 310, 330].map((x) => (
            <g key={x}>
              <circle cx={x} cy="204" r="11" fill="#343A40" />
              <circle cx={x} cy="204" r="4" fill="#6C757D" />
            </g>
          ))}
          <text x="210" y="185" fontSize="10" fill="white" fontWeight="700">BGTS TRANSPORT</text>
        </svg>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default async function IndustryDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const industry = getIndustry(slug)
  if (!industry) notFound()

  const accent = industryAccent[industry.slug] ?? { bg: 'bg-surface-mid', icon: 'text-ink-muted', tag: '' }
  const benefits = industryBenefits[industry.slug] ?? []

  // Resolve linked service names
  const linkedServices = industry.services
    .map((serviceSlug) => services.find((s) => s.slug === serviceSlug))
    .filter(Boolean) as typeof services

  // Sibling industries for "also explore" section
  const siblings = industries.filter((i) => i.slug !== industry.slug).slice(0, 4)

  return (
    <>
      <Navbar />
      <main className="pt-header min-h-screen bg-surface-page">

        {/* Hero */}
        <div className="py-14 md:py-20 bg-[#FAFAF8] border-b border-ink-ghost/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-transparent pointer-events-none" />
          <div className="container-xl relative z-10">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-2 text-xs text-ink-muted">
                <li><Link href="/" className="hover:text-brand transition-colors">Home</Link></li>
                <li aria-hidden="true" className="text-ink-ghost">/</li>
                <li><Link href="/industries" className="hover:text-brand transition-colors">Industries</Link></li>
                <li aria-hidden="true" className="text-ink-ghost">/</li>
                <li className="text-ink-body font-medium" aria-current="page">{industry.name}</li>
              </ol>
            </nav>

            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {/* Left: text */}
              <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${accent.bg} ${accent.icon} text-sm font-semibold mb-5`}>
                  {iconMap[industry.icon]}
                  <span>{industry.name}</span>
                </div>
                <h1 className="font-display font-black text-4xl md:text-5xl text-ink-strong tracking-tight mb-4">
                  Freight solutions<br />for{' '}
                  <span className="text-gradient-energy">{industry.name}.</span>
                </h1>
                <p className="text-ink-muted text-lg leading-relaxed mb-8">
                  {industry.description}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    icon={<Truck size={15} />}
                    iconPosition="left"
                    asChild
                  >
                    <BookNowButton>Book Now</BookNowButton>
                  </Button>
                  <Button variant="secondary" size="md" asChild>
                    <a href="tel:+916357225722">Call +91 63 5722 5722</a>
                  </Button>
                </div>
              </div>

              {/* Right: SVG illustration */}
              <div>
                <IndustryIllustration slug={industry.slug} />
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="container-xl py-12 md:py-16">
          <div className="grid lg:grid-cols-3 gap-10 items-start">

            {/* Left: benefits + services */}
            <div className="lg:col-span-2 space-y-8">

              {/* Key benefits */}
              {benefits.length > 0 && (
                <div className="bg-white rounded-2xl border border-ink-ghost/10 p-7">
                  <h2 className="font-display font-bold text-xl text-ink-strong mb-5">
                    What BGTS brings to {industry.name}
                  </h2>
                  <ul className="space-y-3">
                    {benefits.map((b) => (
                      <li key={b} className="flex items-start gap-3">
                        <CheckCircle size={16} className="text-brand shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="text-sm text-ink-body">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended services */}
              {linkedServices.length > 0 && (
                <div className="bg-white rounded-2xl border border-ink-ghost/10 p-7">
                  <h2 className="font-display font-bold text-xl text-ink-strong mb-5">
                    Recommended services
                  </h2>
                  <div className="space-y-4">
                    {linkedServices.map((svc) => (
                      <Link
                        key={svc.slug}
                        href={`/services/${svc.slug}`}
                        className="group flex items-center justify-between p-4 rounded-xl border border-ink-ghost/10 hover:border-brand/30 hover:bg-brand-subtle transition-all"
                      >
                        <div>
                          <p className="font-semibold text-ink-strong group-hover:text-brand transition-colors text-sm">
                            {svc.name}
                          </p>
                          <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">{svc.tagline}</p>
                        </div>
                        <ArrowRight size={14} className="text-ink-ghost group-hover:text-brand group-hover:translate-x-0.5 transition-all shrink-0 ml-4" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 space-y-4">
              {/* Quick CTA card */}
              <div className="bg-white rounded-2xl border border-ink-ghost/10 p-6">
                <h3 className="font-display font-bold text-ink-strong mb-2">
                  Talk to a {industry.name} specialist
                </h3>
                <p className="text-sm text-ink-muted mb-5">
                  Our freight team has sector-specific knowledge and will match
                  you to the right fleet and route.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  icon={<Truck size={15} />}
                  iconPosition="left"
                  asChild
                >
                  <BookNowButton>Book Now</BookNowButton>
                </Button>
                <Button variant="ghost" size="md" className="w-full mt-2" asChild>
                  <a href="tel:+916357225722">Call +91 63 5722 5722</a>
                </Button>
              </div>

              {/* Tags */}
              <div className="bg-surface-mid rounded-2xl border border-ink-ghost/10 p-5">
                <h3 className="text-xs font-display font-bold uppercase tracking-wider text-ink-muted mb-3">
                  Other industries
                </h3>
                <div className="flex flex-wrap gap-2">
                  {siblings.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/industries/${s.slug}`}
                      className="inline-flex items-center gap-1 text-xs text-ink-body hover:text-brand border border-ink-ghost/20 rounded-full px-3 py-1 hover:border-brand/30 transition-colors"
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>

      </main>
      <Footer />
    </>
  )
}
