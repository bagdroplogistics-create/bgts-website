// ─── BGTS Freight Calculator ─────────────────────────────────────────────
// Ported from: ui_kits/booking/index.html
// Source of truth: BGTS Design System booking/index.html rate table

import type { QuoteResult } from '@/types'

// ─── Rate table (₹/km baseline) ──────────────────────────────────────────
export const RATES: Record<string, number> = {
  'full-truck-load': 68,
  'part-truck-load': 22,
  'express-parcel':  95,
  'heavy-odc':       120,
  'multimodal':      45,
  'contract-logistics': 0,  // custom pricing
}

// ─── Ancillary fees ──────────────────────────────────────────────────────
const INSURANCE_RATE   = 0.002    // 0.2% of declared cargo value
const EWAY_BILL_FLAT   = 80       // ₹ flat
const GST_RATE         = 0.12     // 12%
const VEHICLE_CAPACITY = 35       // tonnes per vehicle (FTL default)
const MIN_CHARGE_RS    = 800      // minimum booking charge ₹

// ─── Distance lookup table (km) ──────────────────────────────────────────
// Top 30 BGTS corridors — extend as needed
const DISTANCE_MAP: Record<string, number> = {
  'AMD-VDR': 100,
  'AMD-SUR': 265,
  'AMD-BOM': 524,
  'AMD-PUN': 650,
  'AMD-RJK': 215,
  'VDR-SUR': 170,
  'VDR-BOM': 420,
  'VDR-PUN': 540,
  'VDR-NAG': 580,
  'VDR-NAS': 350,
  'SUR-BOM': 288,
  'SUR-PUN': 398,
  'SUR-RJK': 230,
  'BOM-PUN': 148,
  'BOM-NAS': 170,
  'BOM-AUR': 335,
  'PUN-AUR': 235,
  'ANK-SUR': 80,
  'ANK-VDR': 60,
  'BRC-VDR': 75,
  'VAP-SUR': 55,
  'HAL-VDR': 50,
  'HAL-AMD': 95,
}

export function getDistance(originCode: string, destinationCode: string): number {
  const key1 = `${originCode}-${destinationCode}`
  const key2 = `${destinationCode}-${originCode}`
  return DISTANCE_MAP[key1] ?? DISTANCE_MAP[key2] ?? 0
}

// ─── City code map ────────────────────────────────────────────────────────
export const CITY_CODES: Record<string, string> = {
  'Ahmedabad':  'AMD',
  'Vadodara':   'VDR',
  'Surat':      'SUR',
  'Mumbai':     'BOM',
  'Pune':       'PUN',
  'Rajkot':     'RJK',
  'Ankleshwar': 'ANK',
  'Bharuch':    'BRC',
  'Vapi':       'VAP',
  'Halol':      'HAL',
  'Nashik':     'NAS',
  'Nagpur':     'NAG',
  'Aurangabad': 'AUR',
}

export const CITIES = Object.keys(CITY_CODES)

// ─── Main calculator ──────────────────────────────────────────────────────

export interface CalcInput {
  originCity: string
  destinationCity: string
  serviceType: string
  weightKg: number
  declaredValueRs?: number
  requireEwayBill?: boolean
  requireInsurance?: boolean
  manualDistanceKm?: number  // override if corridor not in map
}

export function calculateFreightQuote(input: CalcInput): QuoteResult | null {
  const {
    originCity,
    destinationCity,
    serviceType,
    weightKg,
    declaredValueRs = 0,
    requireEwayBill = true,
    requireInsurance = false,
    manualDistanceKm,
  } = input

  const originCode = CITY_CODES[originCity]
  const destCode   = CITY_CODES[destinationCity]

  let distanceKm = manualDistanceKm ?? 0
  if (!distanceKm && originCode && destCode) {
    distanceKm = getDistance(originCode, destCode)
  }

  // Can't quote without distance
  if (distanceKm === 0) return null

  const ratePerKm = RATES[serviceType] ?? 68
  const vehicles  = Math.ceil(weightKg / 1000 / VEHICLE_CAPACITY) || 1

  const baseFreightRs = Math.max(
    ratePerKm * distanceKm * vehicles,
    MIN_CHARGE_RS
  )

  const insuranceRs = requireInsurance && declaredValueRs
    ? Math.round(declaredValueRs * INSURANCE_RATE)
    : 0

  const ewayBillRs  = requireEwayBill ? EWAY_BILL_FLAT : 0

  const preTax      = baseFreightRs + insuranceRs + ewayBillRs
  const gstRs       = Math.round(preTax * GST_RATE)
  const totalRs     = preTax + gstRs

  // Estimate transit based on service type and distance
  const transitDays = estimateTransit(serviceType, distanceKm)

  return {
    baseFreightRs:   Math.round(baseFreightRs),
    insuranceRs,
    ewayBillRs,
    gstRs,
    totalRs:         Math.round(totalRs),
    estimatedTransitDays: transitDays,
    breakdown: {
      ratePerKm,
      distanceKm,
      vehicles,
      weightKg,
    },
  }
}

function estimateTransit(serviceType: string, distanceKm: number): string {
  if (serviceType === 'express-parcel') {
    return distanceKm < 300 ? '1 business day' : '2 business days'
  }
  if (serviceType === 'full-truck-load') {
    if (distanceKm < 200) return '1 business day'
    if (distanceKm < 500) return '1–2 business days'
    return '2–3 business days'
  }
  if (serviceType === 'part-truck-load') {
    if (distanceKm < 200) return '2 business days'
    if (distanceKm < 500) return '3–4 business days'
    return '4–6 business days'
  }
  if (distanceKm < 300) return '2–3 business days'
  return '3–5 business days'
}
