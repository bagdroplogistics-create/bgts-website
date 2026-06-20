// ─── BGTS EV Fleet Types ──────────────────────────────────────────────

export type EkoFleetTier = 'flex-ev' | 'dedi-ev' | 'fleet-ev'

export interface EkoVehicle {
  id: string
  type: '3w' | 'mini' | 'scv' | 'icv'
  make: string
  model: string
  payload: string             // e.g. "500 kg"
  rangeKm: number             // per charge
  chargeTimeHrs: number
  // Carbon calculator coefficients (from ekohaul_esg/index.html)
  dieselEquivKmpl: number     // diesel equivalent fuel economy
  energyKwhPerKm: number      // kWh/km actual
  // EkoHaul specific
  isAvailable: boolean
  currentCharge?: number      // percentage 0–100
  currentRoute?: string
}

export interface EkoFleetPlan {
  tier: EkoFleetTier
  name: string
  tagline: string
  description: string
  minVehicles: number
  maxVehicles?: number
  commitmentMonths: number
  pricingModel: 'per-km' | 'monthly-fixed' | 'custom'
  priceRs?: number
  features: string[]
  idealFor: string[]
  sla: string
}

// ─── Carbon Calculator (exact methodology from ekohaul_esg/index.html) ──

export interface CarbonCalcInput {
  vehicleType: '3w' | 'mini' | 'scv' | 'icv'
  quantity: number            // number of vehicles
  dailyDistanceKm: number
  powerSource: 'grid' | 'solar'
  workingDaysPerMonth: number // default 26
  declaredValueRs?: number    // for fuel cost calculation
  dieselPricePerLitre?: number // ₹ — default ~95
  electricityRatePerKwh?: number // ₹ — default ~8
}

export interface CarbonCalcResult {
  // Emissions
  dieselCO2KgPerMonth: number
  evCO2KgPerMonth: number
  co2AvoidedKgPerMonth: number
  co2ReductionPercent: number
  treesEquivalent: number     // one tree absorbs ~21 kg CO2/year

  // Cost
  dieselCostRsPerMonth: number
  evCostRsPerMonth: number
  savingRsPerMonth: number
  savingRsPerYear: number
  savingPercent: number

  // Pollution
  pm25AvoidedGPerMonth: number

  // Inputs (echoed for display)
  vehicleLabel: string
  quantity: number
  dailyDistanceKm: number
  monthlyDistanceKm: number
}

// ─── EkoHaul Booking Form ────────────────────────────────────────────────

export interface EkoBookingForm {
  // Fleet requirement
  tier: EkoFleetTier
  vehicleType: '3w' | 'mini' | 'scv' | 'icv'
  quantity: number
  dailyDistanceKm: number
  operatingCity: string
  startDate: string

  // Company
  companyName: string
  contactName: string
  contactPhone: string
  contactEmail: string
  gstin?: string
  industry: string

  // Additional
  currentFleetSize?: number
  powerAvailability?: 'grid' | 'solar' | 'both'
  chargingFacility?: boolean
  message?: string
}

// ─── ESG Report (BRSR format) ────────────────────────────────────────────

export interface ESGReport {
  reportingPeriod: string     // e.g. "FY 2025–26"
  companyName: string
  totalFleetEV: number
  totalDistanceKm: number
  co2AvoidedTonnes: number
  dieselSavedLitres: number
  costSavingRs: number
  scope1Emissions: number     // kg CO2e
  scope2Emissions: number
  pmAvoidedGrams: number
  treesEquivalent: number
  brsr: {
    principleE: string
    principleS: string
    principleG: string
  }
}
