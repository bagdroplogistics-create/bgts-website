import type { Industry } from '@/types'

export const industries: Industry[] = [
  {
    slug: 'automotive',
    name: 'Automotive',
    icon: 'Car',
    description:
      "JIT delivery for OEM plants and Tier-1 suppliers. Dedicated milk-run circuits for Gujarat's Halol, Vithal Udyognagar, and Sanand industrial clusters.",
    services: ['full-truck-load', 'contract-logistics', 'heavy-odc'],
  },
  {
    slug: 'chemical',
    name: 'Chemical & Pharma',
    icon: 'FlaskConical',
    description:
      'ADC-compliant tanker fleet for hazardous and non-hazardous chemicals. Temperature-controlled options for pharma API and finished formulations.',
    services: ['tanker-bulk', 'full-truck-load', 'warehousing'],
  },
  {
    slug: 'fmcg',
    name: 'FMCG & Retail',
    icon: 'ShoppingCart',
    description:
      'High-frequency replenishment cycles with multi-point delivery. Integrated warehouse-to-shelf solutions across Gujarat and Maharashtra retail chains.',
    services: ['part-truck-load', 'warehousing', 'contract-logistics'],
  },
  {
    slug: 'textile',
    name: 'Textile & Apparel',
    icon: 'Scissors',
    description:
      "Surat's textile cluster to PAN India distribution. Parcel and FTL options for fabric rolls, garments, and finished goods with white-glove handling.",
    services: ['express-parcel', 'part-truck-load', 'warehousing'],
  },
  {
    slug: 'ecommerce',
    name: 'E-commerce & D2C',
    icon: 'Package',
    description:
      'API-ready last-mile and B2B fulfilment. Same-day pick-up from seller hubs, next-day delivery to buyer addresses across 200+ Gujarat pin codes.',
    services: ['express-parcel', 'warehousing', 'part-truck-load'],
  },
  {
    slug: 'engineering',
    name: 'Heavy Engineering',
    icon: 'Cog',
    description:
      'ODC and project cargo for power equipment, transformers, wind components, and industrial machinery. Route surveys and permits handled in-house.',
    services: ['heavy-odc', 'multimodal', 'full-truck-load'],
  },
  {
    slug: 'agri',
    name: 'Agri & Food',
    icon: 'Wheat',
    description:
      "Bulk grain, edible oil tankers, and cold-chain vans for Gujarat's agri heartland. Compliance with FSSAI transport norms across the supply chain.",
    services: ['tanker-bulk', 'part-truck-load', 'warehousing'],
  },
  {
    slug: 'infrastructure',
    name: 'Infrastructure & Construction',
    icon: 'Building',
    description:
      'Project logistics for cement, steel, and construction materials at scale. Dedicated fleet for major infrastructure projects across Western India.',
    services: ['full-truck-load', 'heavy-odc', 'contract-logistics'],
  },
  {
    slug: 'energy',
    name: 'Energy & Power',
    icon: 'Zap',
    description:
      'Specialist transport for transformers, cables, solar panels, and turbine components. Experience with L&T, Siemens, and ABB supply chains.',
    services: ['heavy-odc', 'multimodal', 'full-truck-load'],
  },
]

export const getIndustry = (slug: string): Industry | undefined =>
  industries.find((i) => i.slug === slug)
