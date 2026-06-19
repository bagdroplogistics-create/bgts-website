import type { Service } from '@/types/freight'

export const services: Service[] = [
  {
    slug: 'full-truck-load',
    name: 'Full Truck Load (FTL)',
    shortName: 'FTL',
    tagline: 'Dedicated trucks. Direct routes. No cross-docking.',
    description:
      'Exclusive vehicle allocation for your entire consignment. Direct point-to-point movement ensures faster transit and zero handling risk. Ideal for time-critical and high-value cargo.',
    icon: 'Truck',
    modes: ['road'],
    features: [
      'Exclusive vehicle — no co-loading',
      'Direct door-to-door movement',
      'GPS tracking every consignment',
      'E-way bill generation included',
      'Dedicated relationship manager',
    ],
    idealFor: ['Manufacturing', 'FMCG', 'Automotive', 'Retail'],
    ratePerKm: 68,
    transitTimeDays: '1–3 business days',
    isHighlighted: true,
  },
  {
    slug: 'part-truck-load',
    name: 'Part Truck Load (PTL)',
    shortName: 'PTL',
    tagline: 'Cost-optimised freight sharing across our Gujarat network.',
    description:
      "Smart consolidation of multiple shippers on a single optimised route. BGTS's Gujarat hub network ensures next-day movement across the state without compromising on safety or SLA.",
    icon: 'PackageOpen',
    modes: ['road'],
    features: [
      'Competitive per-kg pricing',
      'Hub-and-spoke consolidation',
      'Shared GPS visibility',
      'Secure packaging standards',
      '20+ branch collection points',
    ],
    idealFor: ['SMEs', 'E-commerce', 'Pharma', 'Textile'],
    ratePerKm: 22,
    minWeightKg: 50,
    transitTimeDays: '2–5 business days',
    isHighlighted: true,
  },
  {
    slug: 'express-parcel',
    name: 'Express Parcel',
    shortName: 'Express',
    tagline: 'Overnight delivery across Gujarat and Maharashtra.',
    description:
      'Priority lane for parcels up to 100 kg. Guaranteed next-day delivery within our Gujarat network, 2-day to Maharashtra. Backed by our 99.2% SLA.',
    icon: 'Zap',
    modes: ['road', 'air'],
    features: [
      'Next-day delivery Gujarat',
      '2-day delivery Maharashtra',
      'Real-time SMS/WhatsApp updates',
      'Proof of delivery digital',
      'Secure sealed packaging',
    ],
    idealFor: ['E-commerce', 'Documents', 'Samples', 'Spare Parts'],
    ratePerKm: 95,
    maxWeightKg: 100,
    transitTimeDays: '1–2 business days',
    isHighlighted: true,
  },
  {
    slug: 'warehousing',
    name: 'Warehousing & Distribution',
    shortName: 'Warehousing',
    tagline: 'Multi-city fulfilment hubs across West India.',
    description:
      "Integrated warehousing with pick-and-pack, labelling, and last-mile fulfilment. BGTS's Ahmedabad, Surat, and Pune facilities cover 2,00,000+ sq ft of organised storage with full WMS integration.",
    icon: 'Warehouse',
    modes: ['road'],
    features: [
      '2,00,000+ sq ft organised space',
      'WMS system integration',
      'Pick-pack-ship same day',
      'Cold chain available',
      'CCTV monitored 24/7',
    ],
    idealFor: ['Retail', 'FMCG', 'E-commerce', 'Pharma'],
    ratePerKm: 0,   // flat warehousing rate, not per-km
    transitTimeDays: 'Same-day dispatch if order by 2pm',
  },
  {
    slug: 'tanker-bulk',
    name: 'Tanker & Bulk Cargo',
    shortName: 'Tanker',
    tagline: 'Certified tanker fleet for liquid and dry bulk.',
    description:
      'Stainless-steel and MS tanker fleet for chemicals, edible oils, food-grade liquids, and dry bulk commodities. All vehicles are ADC-compliant with valid pollution certificates.',
    icon: 'Droplets',
    modes: ['road'],
    features: [
      'Food-grade SS tankers available',
      'Chemical-grade MS tankers',
      'ADC compliance certified',
      'Dry bulk containers',
      'Dedicated tanker operations team',
    ],
    idealFor: ['Chemical Industry', 'Food & Beverage', 'Agriculture'],
    ratePerKm: 78,
    transitTimeDays: '1–4 business days',
  },
  {
    slug: 'heavy-odc',
    name: 'Heavy & ODC Cargo',
    shortName: 'Heavy/ODC',
    tagline: 'Over-dimensional and project cargo specialists.',
    description:
      'Multi-axle fleet and flatbed trailers for over-dimensional cargo (ODC). Route surveys, police permissions, and pilot vehicles arranged in-house for project cargo movements.',
    icon: 'Building2',
    modes: ['road'],
    features: [
      'Multi-axle and low-bed trailers',
      'Route survey and permissions',
      'Pilot vehicle arrangement',
      'Insurance for high-value cargo',
      'Project cargo expertise',
    ],
    idealFor: ['Infrastructure', 'Power', 'Wind Energy', 'Heavy Engineering'],
    ratePerKm: 120,
    transitTimeDays: 'Project-specific',
  },
  {
    slug: 'multimodal',
    name: 'Multimodal Logistics',
    shortName: 'Multimodal',
    tagline: 'Road + Rail + Air under one LR number.',
    description:
      'Seamless intermodal coordination combining road, rail, and air freight under a single booking and tracking interface. Best for long-distance, time-sensitive Pan-India movements.',
    icon: 'Network',
    modes: ['road', 'rail', 'air'],
    features: [
      'Single LR number across modes',
      'Rail siding access at Vadodara',
      'Air cargo tie-ups Mumbai/Delhi',
      'Pan-India coverage',
      'Integrated tracking dashboard',
    ],
    idealFor: ['Pan-India shippers', 'Export cargo', 'Auto sector'],
    ratePerKm: 45,
    transitTimeDays: '2–7 business days',
  },
  {
    slug: 'contract-logistics',
    name: 'Contract Logistics',
    shortName: 'Contract',
    tagline: 'Dedicated fleet and warehouse on a long-term SLA.',
    description:
      'Outsource your entire primary distribution or secondary logistics operation to BGTS under a structured SLA. Dedicated vehicles, drivers, and a dedicated BGTS operations manager.',
    icon: 'Handshake',
    modes: ['road', 'multimodal'],
    features: [
      'Dedicated fleet assignment',
      'Embedded operations manager',
      'Monthly SLA reporting',
      'Customised IT integration',
      'Cost-plus or fixed-fee models',
    ],
    idealFor: ['Large Manufacturers', 'FMCG Giants', 'Retail Chains'],
    ratePerKm: 0,
    transitTimeDays: 'Per SLA agreement',
  },
]

export const getService = (slug: string): Service | undefined =>
  services.find((s) => s.slug === slug)

export const highlightedServices = services.filter((s) => s.isHighlighted)
