import type { Booking, Vehicle } from '@/types/dispatch'
// KPI is now rendered inline in DispatchShell header — this component is kept for backwards compat
interface Props { bookings: Booking[]; vehicles: Vehicle[]; dieselPrice: number }
export function KPIBar(_props: Props) { return null }
