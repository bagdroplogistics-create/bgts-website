-- ═══════════════════════════════════════════════════════════════════════════
-- BGTS Dispatch & Booking Platform — Supabase SQL Schema
-- Run this in: BGTS Supabase Project → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── ENUM types ────────────────────────────────────────────────────────────────
CREATE TYPE vehicle_class AS ENUM (
  'LCV', 'MCV', 'HCV', 'TRAILER', 'TANKER', 'OTHER'
);

CREATE TYPE vehicle_ownership AS ENUM ('OWNED', 'HIRED');

CREATE TYPE vehicle_status AS ENUM (
  'AVAILABLE', 'ON_TRIP', 'MAINTENANCE', 'COMPLIANCE_HOLD'
);

CREATE TYPE trip_type AS ENUM ('INTRACITY', 'INTERCITY');

CREATE TYPE booking_stage AS ENUM (
  'BOOKED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'INVOICED', 'CANCELLED'
);

CREATE TYPE booking_source AS ENUM ('ADMIN', 'CUSTOMER');

-- ── VEHICLES ──────────────────────────────────────────────────────────────────
CREATE TABLE vehicles (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reg_no       TEXT NOT NULL UNIQUE,
  class        vehicle_class NOT NULL DEFAULT 'LCV',
  make_model   TEXT NOT NULL,
  ownership    vehicle_ownership NOT NULL DEFAULT 'OWNED',
  payload_kg   INTEGER NOT NULL DEFAULT 0,
  length_ft    NUMERIC(6,2),
  width_ft     NUMERIC(6,2),
  height_ft    NUMERIC(6,2),
  status_now   vehicle_status NOT NULL DEFAULT 'AVAILABLE',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── BOOKINGS ──────────────────────────────────────────────────────────────────
CREATE TABLE bookings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_date     DATE NOT NULL,
  client_name   TEXT NOT NULL,
  company_name  TEXT,
  phone         TEXT NOT NULL,
  email         TEXT,
  from_loc      TEXT NOT NULL,
  to_loc        TEXT NOT NULL,
  distance_km   NUMERIC(8,2) NOT NULL DEFAULT 0,
  material      TEXT NOT NULL DEFAULT 'General Cargo',
  pcs_boxes     INTEGER,
  weight_kg     NUMERIC(10,2),
  vehicle_id    UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  trip_type     trip_type NOT NULL DEFAULT 'INTERCITY',
  margin_pct    NUMERIC(5,2) NOT NULL DEFAULT 20,
  rate_total    NUMERIC(10,2),
  stage         booking_stage NOT NULL DEFAULT 'BOOKED',
  source        booking_source NOT NULL DEFAULT 'ADMIN',
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent double-booking: same vehicle, same date
CREATE UNIQUE INDEX idx_bookings_vehicle_date
  ON bookings (vehicle_id, trip_date)
  WHERE stage NOT IN ('CANCELLED');

-- Fast lookups
CREATE INDEX idx_bookings_trip_date   ON bookings (trip_date);
CREATE INDEX idx_bookings_stage       ON bookings (stage);
CREATE INDEX idx_bookings_vehicle_id  ON bookings (vehicle_id);

-- ── FIXED COSTS ───────────────────────────────────────────────────────────────
CREATE TABLE fixed_costs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id      UUID NOT NULL UNIQUE REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_per_mo   NUMERIC(10,2) NOT NULL DEFAULT 0,
  helper_per_mo   NUMERIC(10,2) NOT NULL DEFAULT 0,
  insurance_yr    NUMERIC(10,2) NOT NULL DEFAULT 0,
  permit_tax_yr   NUMERIC(10,2) NOT NULL DEFAULT 0,
  emi_per_mo      NUMERIC(10,2) NOT NULL DEFAULT 0,
  maint_per_mo    NUMERIC(10,2) NOT NULL DEFAULT 0,
  other_per_mo    NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- Computed view: total_per_mo + ₹/km (assumes 3000 km/month)
CREATE VIEW fixed_costs_computed AS
SELECT
  fc.*,
  (
    fc.driver_per_mo + fc.helper_per_mo + fc.maint_per_mo +
    fc.emi_per_mo + fc.other_per_mo +
    (fc.insurance_yr / 12) + (fc.permit_tax_yr / 12)
  ) AS total_per_mo,
  ROUND(
    (
      fc.driver_per_mo + fc.helper_per_mo + fc.maint_per_mo +
      fc.emi_per_mo + fc.other_per_mo +
      (fc.insurance_yr / 12) + (fc.permit_tax_yr / 12)
    ) / 3000, 2
  ) AS rs_per_km
FROM fixed_costs fc;

-- ── VARIABLE COSTS ────────────────────────────────────────────────────────────
CREATE TABLE variable_costs (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id         UUID NOT NULL UNIQUE REFERENCES vehicles(id) ON DELETE CASCADE,
  mileage_km_per_l   NUMERIC(6,2) NOT NULL DEFAULT 8,
  fuel_rs_per_km     NUMERIC(8,4) NOT NULL DEFAULT 0,
  tyre_rs_per_km     NUMERIC(8,4) NOT NULL DEFAULT 0,
  intracity_rs_km    NUMERIC(8,2) NOT NULL DEFAULT 0,
  intercity_rs_km    NUMERIC(8,2) NOT NULL DEFAULT 0
);

-- ── GLOBAL SETTINGS ───────────────────────────────────────────────────────────
CREATE TABLE global_settings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diesel_rs_l      NUMERIC(6,2) NOT NULL DEFAULT 93.00,
  avg_mileage      NUMERIC(6,2) NOT NULL DEFAULT 8,
  driver_bata      NUMERIC(8,2) NOT NULL DEFAULT 300,
  driver_bata_ic   NUMERIC(8,2) NOT NULL DEFAULT 500,
  loading_charge   NUMERIC(8,2) NOT NULL DEFAULT 500,
  toll_estimate    NUMERIC(5,2) NOT NULL DEFAULT 5,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed one row (only one global settings row ever exists)
INSERT INTO global_settings (diesel_rs_l, avg_mileage, driver_bata, driver_bata_ic, loading_charge, toll_estimate)
VALUES (93.00, 8, 300, 500, 500, 5);

-- ── AUTO-UPDATE updated_at ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_global_settings_updated_at
  BEFORE UPDATE ON global_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────────
-- All tables locked down by default.
-- Only service role key (server-side) can read/write.
-- Public customer booking endpoint uses service role via API route.

ALTER TABLE vehicles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_costs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE variable_costs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;

-- Admin-only policy (service role bypasses RLS automatically — no policy needed)
-- Customer booking: allow INSERT from anon for source=CUSTOMER only
CREATE POLICY "customer_can_insert_booking"
  ON bookings FOR INSERT
  TO anon
  WITH CHECK (source = 'CUSTOMER');

-- ═══════════════════════════════════════════════════════════════════════════
-- Schema complete. Tables: vehicles, bookings, fixed_costs,
-- variable_costs, global_settings. View: fixed_costs_computed
-- ═══════════════════════════════════════════════════════════════════════════
