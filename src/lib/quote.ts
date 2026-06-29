import type { QuoteInput, QuoteBreakdown, VariableCost, FixedCost, GlobalSettings } from '@/types/dispatch'

// ─────────────────────────────────────────────────────────────────────────────
// Quote Calculation Engine
// Mirrors the live quote logic from the HTML prototype exactly.
// Called both client-side (live preview) and server-side (on booking submit).
// ─────────────────────────────────────────────────────────────────────────────

const TRIPS_PER_MONTH = 10   // assumed trips/month for fixed cost amortisation

export function calculateQuote(
  input:    QuoteInput,
  varCost:  VariableCost,
  fixCost:  FixedCost,
  settings: GlobalSettings,
): QuoteBreakdown {
  const { distance_km, trip_type, margin_pct } = input
  const km = Math.max(distance_km, 0)

  // 1. Fuel cost — diesel price / mileage × distance
  const fuel_cost = (settings.diesel_rs_l / varCost.mileage_km_per_l) * km

  // 2. Tyre + maintenance per km
  const tyre_cost = varCost.tyre_rs_per_km * km

  // 3. Driver bata — intracity vs intercity
  const driver_bata =
    trip_type === 'INTRACITY' ? settings.driver_bata : settings.driver_bata_ic

  // 4. Loading / unloading flat charge
  const loading = settings.loading_charge

  // 5. Fixed cost per trip (amortised from monthly total)
  const fixed_per_mo =
    fixCost.driver_per_mo +
    fixCost.helper_per_mo +
    fixCost.maint_per_mo +
    fixCost.emi_per_mo +
    fixCost.other_per_mo +
    fixCost.insurance_yr / 12 +
    fixCost.permit_tax_yr / 12
  const fixed_per_trip = fixed_per_mo / TRIPS_PER_MONTH

  // 6. Subtotal before toll + margin
  const pre_toll = fuel_cost + tyre_cost + driver_bata + loading + fixed_per_trip

  // 7. Toll estimate — % of pre_toll
  const toll_estimate = (pre_toll * settings.toll_estimate) / 100

  // 8. Subtotal
  const subtotal = pre_toll + toll_estimate

  // 9. Margin
  const margin_amount = (subtotal * margin_pct) / 100

  // 10. Total
  const total = subtotal + margin_amount

  // 11. ₹/km
  const rs_per_km = km > 0 ? total / km : 0

  return {
    fuel_cost:      round(fuel_cost),
    tyre_cost:      round(tyre_cost),
    driver_bata:    round(driver_bata),
    loading:        round(loading),
    toll_estimate:  round(toll_estimate),
    fixed_per_trip: round(fixed_per_trip),
    subtotal:       round(subtotal),
    margin_amount:  round(margin_amount),
    total:          round(total),
    rs_per_km:      round(rs_per_km),
  }
}

function round(n: number, dp = 2): number {
  return Math.round(n * 10 ** dp) / 10 ** dp
}

/** Format ₹ for display */
export function formatRs(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    style:    'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)
}
