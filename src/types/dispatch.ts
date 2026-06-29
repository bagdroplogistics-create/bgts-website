// ─────────────────────────────────────────────────────────────────────────────
// BGTS Dispatch Platform — TypeScript Types
// Source of truth: HTML prototype (bgts_dispatch_booking_platform.md)
// Database: Supabase (PostgreSQL)
// ─────────────────────────────────────────────────────────────────────────────

// ── Vehicle ──────────────────────────────────────────────────────────────────

export type VehicleClass =
  | 'LCV' | 'MCV'          // legacy (kept for DB compat)
  | 'MGV'                   // Medium Goods Vehicle
  | 'LGV'                   // Light Goods Vehicle
  | 'HCV'                   // Heavy Commercial Vehicle
  | 'MARKET'                // Market / vendor vehicle
  | 'TRAILER'
  | 'TANKER'
  | 'OTHER'

export type VehicleOwnership = 'OWNED' | 'MARKET_NETWORK'

export type VehicleStatus =
  | 'AVAILABLE'
  | 'ON_TRIP'
  | 'IDLE'
  | 'MAINTENANCE'
  | 'COMPLIANCE_HOLD'
  | 'CHECK_RENEWAL'
  | 'ON_DEMAND'

export interface Vehicle {
  id:           string
  reg_no:       string
  class:        VehicleClass
  make_model:   string
  ownership:    VehicleOwnership
  payload_kg:   number
  length_ft:    number | null
  width_ft:     number | null
  height_ft:    number | null
  status_now:   VehicleStatus
  created_at:   string
  updated_at:   string
}

// ── Fixed Costs (per vehicle, per month/year) ────────────────────────────────

export interface FixedCost {
  id:              string
  vehicle_id:      string
  driver_per_mo:   number
  helper_per_mo:   number
  insurance_yr:    number
  permit_tax_yr:   number
  emi_per_mo:      number
  maint_per_mo:    number
  other_per_mo:    number
  // computed fields (read-only, returned by view)
  total_per_mo?:   number
  rs_per_km?:      number
}

// ── Variable Costs (per vehicle, per km) ─────────────────────────────────────

export interface VariableCost {
  id:                string
  vehicle_id:        string
  mileage_km_per_l:  number
  fuel_rs_per_km:    number
  tyre_rs_per_km:    number
  intracity_rs_km:   number
  intercity_rs_km:   number
}

// ── Global Settings ───────────────────────────────────────────────────────────

export interface GlobalSettings {
  id:              string
  diesel_rs_l:     number
  avg_mileage:     number   // km/L assumed for fleet average
  driver_bata:     number   // ₹ per day per trip (intracity)
  driver_bata_ic:  number   // ₹ per day (intercity overnight)
  loading_charge:  number   // ₹ flat per trip
  toll_estimate:   number   // % of base rate added for tolls
  updated_at:      string
}

// ── Booking ───────────────────────────────────────────────────────────────────

export type MaterialType =
  | 'General Cargo'
  | 'Steel / Metal'
  | 'Cement / Building Material'
  | 'Chemicals'
  | 'FMCG / Packaged Goods'
  | 'Machinery / Equipment'
  | 'Agricultural Produce'
  | 'Other'

export type TripType = 'INTRACITY' | 'INTERCITY'

export type BookingStage =
  | 'BOOKED'       // Confirmed, vehicle assigned
  | 'DISPATCHED'   // Vehicle left depot
  | 'IN_TRANSIT'   // On the road
  | 'DELIVERED'    // Goods reached destination
  | 'INVOICED'     // Invoice raised
  | 'CANCELLED'    // Trip cancelled

export type BookingSource = 'ADMIN' | 'CUSTOMER'

export interface Booking {
  id:            string
  trip_date:     string          // ISO date string
  client_name:   string
  company_name:  string | null
  phone:         string
  email:         string | null
  from_loc:      string
  to_loc:        string
  distance_km:   number
  material:      MaterialType
  pcs_boxes:     number | null
  weight_kg:     number | null
  vehicle_id:    string
  trip_type:     TripType
  margin_pct:    number          // default 20
  rate_total:    number | null   // calculated rate ₹
  stage:         BookingStage
  source:        BookingSource
  notes:         string | null
  created_at:    string
  updated_at:    string
  // joined
  vehicle?:      Vehicle
}

// ── Quote (live calculation) ──────────────────────────────────────────────────

export interface QuoteInput {
  vehicle_id:   string
  distance_km:  number
  trip_type:    TripType
  weight_kg:    number
  margin_pct:   number
  material:     MaterialType
}

export interface QuoteBreakdown {
  fuel_cost:      number
  tyre_cost:      number
  driver_bata:    number
  loading:        number
  toll_estimate:  number
  fixed_per_trip: number
  subtotal:       number
  margin_amount:  number
  total:          number
  rs_per_km:      number
}

// ── Vehicle Schedule (grid cell) ─────────────────────────────────────────────

export type ScheduleCellStatus = 'OPEN' | 'BOOKED' | 'HOLD'

export interface ScheduleCell {
  vehicle_id:  string
  date:        string   // ISO date
  status:      ScheduleCellStatus
  booking_id:  string | null
  client_name: string | null
}

export interface ScheduleRow {
  vehicle:  Vehicle
  cells:    ScheduleCell[]
}

// ── WhatsApp message stages ───────────────────────────────────────────────────

export interface WhatsAppTemplate {
  stage:    BookingStage
  label:    string
  message:  (booking: Booking) => string
}

// ── API response wrappers ─────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data:    T
  error:   null
}

export interface ApiError {
  data:    null
  error:   string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError
