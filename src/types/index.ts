// ─── BGTS Type Definitions ───────────────────────────────────────────────
// Central export — import everything from '@/types'

export type { Service, ServiceSlug, TransportMode } from './freight'
export type {
  EkoVehicle,
  EkoFleetTier,
  CarbonCalcInput,
  CarbonCalcResult,
  EkoBookingForm,
} from './ekohaul'

// ─── Shared / Generic ───────────────────────────────────────────────────

export interface NavLink {
  label: string
  href: string
  children?: NavLink[]
}

export interface StatItem {
  value: number
  suffix: string
  label: string
  description?: string
}

export interface Testimonial {
  name: string
  designation: string
  company: string
  quote: string
  avatar?: string
  rating?: 1 | 2 | 3 | 4 | 5
}

export interface Branch {
  city: string
  state: string
  address: string
  phone: string
  email: string
  pincode: string
  isHub?: boolean
}

export interface Industry {
  slug: string
  name: string
  icon: string
  description: string
  services: string[]
}

export interface FAQItem {
  question: string
  answer: string
  category?: string
}

// ─── Booking / Quote wizard ──────────────────────────────────────────────

export type BookingStep = 'route' | 'cargo' | 'service' | 'confirm'

export interface BookingFormData {
  // Step 1: Route
  originCity: string
  destinationCity: string
  estimatedDistanceKm?: number

  // Step 2: Cargo
  cargoType: string
  weightKg: number
  volumeCbm?: number
  packagesCount?: number
  declaredValueRs?: number
  specialHandling?: string[]

  // Step 3: Service
  serviceType: string
  vehicleType?: string
  preferredDate?: string
  urgency?: 'standard' | 'express' | 'economy'
  requireInsurance?: boolean
  requireEwayBill?: boolean

  // Step 4: Confirm
  companyName: string
  contactName: string
  contactPhone: string
  contactEmail: string
  gstin?: string
  billingAddress?: string
}

export interface QuoteResult {
  baseFreightRs: number
  insuranceRs: number
  ewayBillRs: number
  gstRs: number
  totalRs: number
  estimatedTransitDays: string
  lrNumber?: string
  validTillDate?: string
  breakdown: {
    ratePerKm: number
    distanceKm: number
    vehicles: number
    weightKg: number
  }
}

// ─── Status / Tracking ───────────────────────────────────────────────────

export type ConsignmentStatus =
  | 'booked'
  | 'transit'
  | 'delayed'
  | 'delivered'
  | 'exception'

export interface ConsignmentEvent {
  timestamp: string
  location: string
  status: ConsignmentStatus
  description: string
  updatedBy?: string
}

export interface Consignment {
  lrNumber: string
  origin: string
  destination: string
  status: ConsignmentStatus
  serviceType: string
  vehicleType?: string
  driver?: string
  eta?: string
  events: ConsignmentEvent[]
  weightKg?: number
  packages?: number
}

// ─── Fleet ───────────────────────────────────────────────────────────────

export type FuelType = 'diesel' | 'ev' | 'cng'

export interface Vehicle {
  id: string
  type: string
  make: string
  model: string
  year: number
  regNumber: string
  capacity: string
  fuelType: FuelType
  isEkoHaul?: boolean
  currentDriver?: string
  currentRoute?: string
  status: 'active' | 'maintenance' | 'idle'
}

// ─── SEO / Metadata ──────────────────────────────────────────────────────

export interface PageMeta {
  title: string
  description: string
  keywords?: string[]
  ogImage?: string
  canonical?: string
  noIndex?: boolean
}
