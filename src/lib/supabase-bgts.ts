import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type {
  Vehicle, Booking, FixedCost, VariableCost,
  GlobalSettings, ScheduleCell,
} from '@/types/dispatch'

// ─────────────────────────────────────────────────────────────────────────────
// Database shape — matches Supabase SQL schema exactly
// ─────────────────────────────────────────────────────────────────────────────
// Minimal Database shape — widened Insert/Update to avoid strict generic conflicts
export interface Database {
  public: {
    Tables: {
      vehicles: {
        Row:    Vehicle
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
      bookings: {
        Row:    Booking
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
      fixed_costs: {
        Row:    FixedCost
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
      variable_costs: {
        Row:    VariableCost
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
      global_settings: {
        Row:    GlobalSettings
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
      schedule_cells: {
        Row:    ScheduleCell
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
    }
    Views:     Record<string, never>
    Functions: Record<string, never>
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Clients
// ─────────────────────────────────────────────────────────────────────────────

let _client: ReturnType<typeof createClient> | null = null
let _adminClient: ReturnType<typeof createClient> | null = null

/** Browser / client-side — uses anon key, subject to RLS */
export function getBgtsClient() {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_BGTS_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_BGTS_SUPABASE_ANON_KEY!,
    )
  }
  return _client
}

/** Server-side only — uses service role, bypasses RLS */
export function getBgtsAdminClient() {
  if (!_adminClient) {
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_BGTS_SUPABASE_URL!,
      process.env.BGTS_SUPABASE_SERVICE_ROLE_KEY!,
    )
  }
  return _adminClient
}

// Convenience named exports
export const bgtsSupabase      = getBgtsClient
export const bgtsSupabaseAdmin = getBgtsAdminClient
