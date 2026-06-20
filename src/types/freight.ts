// ─── Freight / Transport Types ───────────────────────────────────────────

export type ServiceSlug =
  | 'full-truck-load'
  | 'part-truck-load'
  | 'express-parcel'
  | 'warehousing'
  | 'heavy-odc'
  | 'multimodal'
  | 'contract-logistics'

export type TransportMode = 'road' | 'rail' | 'air' | 'multimodal'

export type VehicleType =
  | 'tata-ace'
  | 'bolero-pickup'
  | 'single-axle'
  | 'multi-axle'
  | 'trailer'
  | 'tanker'
  | 'container-20ft'
  | 'container-40ft'

export interface Service {
  slug: ServiceSlug
  name: string
  shortName: string
  tagline: string
  description: string
  icon: string
  modes: TransportMode[]
  features: string[]
  idealFor: string[]
  ratePerKm: number           // base rate ₹/km from DS pricing
  minWeightKg?: number
  maxWeightKg?: number
  transitTimeDays: string     // e.g. "2–4 business days"
  isHighlighted?: boolean     // hero services
}

export interface FreightRate {
  serviceType: ServiceSlug
  vehicleType: VehicleType
  ratePerKm: number           // ₹
  minimumChargeRs: number
  insurancePercent: number    // 0.002 = 0.2% of declared value
  ewayBillFlatRs: number      // ₹80
  gstPercent: number          // 0.12 = 12%
}

export interface City {
  name: string
  state: string
  code: string                // 3-letter code e.g. "BOM", "DEL", "AMD"
  isMajorHub?: boolean
}

export interface Route {
  originCode: string
  destinationCode: string
  distanceKm: number
  estimatedHours: number
  isExpressSupported: boolean
}
