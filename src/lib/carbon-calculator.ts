// ─── EkoHaul Carbon Calculator ───────────────────────────────────────────
// Exact methodology from: ui_kits/ekohaul_esg/index.html
// ALL coefficients must match the source — do not adjust without DS update

import type { CarbonCalcInput, CarbonCalcResult } from '@/types/ekohaul'
import { ekoVehicles, ekoVehicleLabels } from '@/data/ekohaul-vehicles'

// ─── Emission factors ─────────────────────────────────────────────────────
const DIESEL_EF = 2.68   // kg CO2 per litre of diesel burned
const GRID_EF   = 0.71   // kg CO2 per kWh (Indian grid average)
const SOLAR_EF  = 0.04   // kg CO2 per kWh (solar)

// ─── Cost defaults ────────────────────────────────────────────────────────
const DEFAULT_DIESEL_PRICE_PER_LITRE = 95    // ₹
const DEFAULT_ELECTRICITY_RATE_PER_KWH = 8  // ₹

// ─── PM2.5 emission factor for diesel ────────────────────────────────────
const PM25_DIESEL_G_PER_KM = 0.4  // grams per km (BS6 diesel approx)

// ─── Tree absorption ─────────────────────────────────────────────────────
const CO2_PER_TREE_KG_PER_YEAR = 21  // kg CO2 absorbed per mature tree per year

export function calculateCarbon(input: CarbonCalcInput): CarbonCalcResult | null {
  const vehicle = ekoVehicles[input.vehicleType]
  if (!vehicle) return null

  const {
    quantity,
    dailyDistanceKm,
    powerSource,
    workingDaysPerMonth = 26,
    dieselPricePerLitre = DEFAULT_DIESEL_PRICE_PER_LITRE,
    electricityRatePerKwh = DEFAULT_ELECTRICITY_RATE_PER_KWH,
  } = input

  const monthlyDistanceKm = dailyDistanceKm * workingDaysPerMonth * quantity

  // ─── Diesel baseline ────────────────────────────────────────────────────
  // litres = distance / fuel economy (km/l equivalent)
  const dieselLitresPerMonth = monthlyDistanceKm / vehicle.dieselEquivKmpl
  const dieselCO2KgPerMonth  = dieselLitresPerMonth * DIESEL_EF
  const dieselCostRsPerMonth  = dieselLitresPerMonth * dieselPricePerLitre

  // ─── EV scenario ─────────────────────────────────────────────────────────
  const emissionFactor = powerSource === 'solar' ? SOLAR_EF : GRID_EF
  const evKwhPerMonth  = monthlyDistanceKm * vehicle.energyKwhPerKm
  const evCO2KgPerMonth = evKwhPerMonth * emissionFactor
  const evCostRsPerMonth = evKwhPerMonth * electricityRatePerKwh

  // ─── Savings ─────────────────────────────────────────────────────────────
  const co2AvoidedKgPerMonth  = dieselCO2KgPerMonth - evCO2KgPerMonth
  const co2ReductionPercent   = (co2AvoidedKgPerMonth / dieselCO2KgPerMonth) * 100
  const savingRsPerMonth      = dieselCostRsPerMonth - evCostRsPerMonth
  const savingRsPerYear       = savingRsPerMonth * 12
  const savingPercent         = (savingRsPerMonth / dieselCostRsPerMonth) * 100

  // ─── Trees equivalent ────────────────────────────────────────────────────
  // Annualise monthly CO2 avoided → divide by tree absorption rate
  const co2AvoidedKgPerYear = co2AvoidedKgPerMonth * 12
  const treesEquivalent     = Math.round(co2AvoidedKgPerYear / CO2_PER_TREE_KG_PER_YEAR)

  // ─── PM2.5 ───────────────────────────────────────────────────────────────
  const pm25AvoidedGPerMonth = monthlyDistanceKm * PM25_DIESEL_G_PER_KM

  return {
    dieselCO2KgPerMonth:   Math.round(dieselCO2KgPerMonth),
    evCO2KgPerMonth:       Math.round(evCO2KgPerMonth),
    co2AvoidedKgPerMonth:  Math.round(co2AvoidedKgPerMonth),
    co2ReductionPercent:   Math.round(co2ReductionPercent),
    treesEquivalent,
    dieselCostRsPerMonth:  Math.round(dieselCostRsPerMonth),
    evCostRsPerMonth:      Math.round(evCostRsPerMonth),
    savingRsPerMonth:      Math.round(savingRsPerMonth),
    savingRsPerYear:       Math.round(savingRsPerYear),
    savingPercent:         Math.round(savingPercent),
    pm25AvoidedGPerMonth:  Math.round(pm25AvoidedGPerMonth),
    vehicleLabel:          ekoVehicleLabels[input.vehicleType] ?? input.vehicleType,
    quantity,
    dailyDistanceKm,
    monthlyDistanceKm:     Math.round(monthlyDistanceKm),
  }
}
