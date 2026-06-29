'use client'
import { useState, useEffect } from 'react'
import type { ScheduleRow } from '@/types/dispatch'

interface Props {
  onBookCell: (vehicleId: string, date: string) => void
  onViewBooking: (bookingId: string) => void
}

const CELL_STYLE: Record<string, string> = {
  OPEN:   'bg-green-50 hover:bg-green-100 border-green-200 cursor-pointer text-green-700',
  BOOKED: 'bg-amber-50 hover:bg-amber-100 border-amber-200 cursor-pointer text-amber-800',
  HOLD:   'bg-red-50 border-red-200 text-red-500 cursor-not-allowed opacity-60',
}

export function VehicleSchedule({ onBookCell, onViewBooking }: Props) {
  const [days,    setDays]    = useState<7 | 14 | 30>(7)
  const [rows,    setRows]    = useState<ScheduleRow[]>([])
  const [dates,   setDates]   = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    setLoading(true); setError(null)
    fetch(`/api/dispatch/schedule?days=${days}`)
      .then(async r => {
        const text = await r.text()
        if (!text) throw new Error('No response from schedule API — check Supabase env vars.')
        let json
        try { json = JSON.parse(text) } catch { throw new Error('Invalid JSON from schedule API.') }
        if (json.error) throw new Error(json.error)
        setRows(json.data?.rows ?? [])
        setDates(json.data?.dates ?? [])
      })
      .catch(e => setError(String(e.message ?? e)))
      .finally(() => setLoading(false))
  }, [days])

  const fmtDate = (d: string) => {
    const dt = new Date(d)
    return { day: dt.toLocaleDateString('en-IN',{weekday:'short'}), date: dt.getDate() }
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Vehicle Schedule</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Owned fleet × upcoming dates.&nbsp;
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-green-200 inline-block"/> Open — tap to book&nbsp;
              <span className="w-3 h-3 rounded-sm bg-amber-200 inline-block"/> Booked — tap to see who&nbsp;
              <span className="w-3 h-3 rounded-sm bg-red-200 inline-block"/> Hold — not bookable
            </span>
          </p>
        </div>
        <div className="flex gap-1">
          {([7,14,30] as const).map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                days === d ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {d} days
            </button>
          ))}
        </div>
      </div>

      {error && <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg mb-4">{error}</div>}

      {loading ? (
        <div className="h-48 flex items-center justify-center text-gray-400">Loading schedule…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2.5 text-left font-semibold text-gray-700 border-b border-r border-gray-200 min-w-[110px]">
                  Vehicle
                </th>
                {dates.map(d => {
                  const { day, date } = fmtDate(d)
                  return (
                    <th key={d} className={`px-2 py-2.5 text-center font-semibold border-b border-r border-gray-200 min-w-[72px] ${
                      d === today ? 'bg-orange-50 text-orange-700' : 'text-gray-600'
                    }`}>
                      <div>{day}</div>
                      <div className="text-base font-bold">{date}</div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={dates.length + 1} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No vehicles found. Add vehicles in the Vehicle Master tab first.
                  </td>
                </tr>
              ) : rows.map(row => (
                <tr key={row.vehicle.id} className="border-b border-gray-100">
                  <td className="px-3 py-2 border-r border-gray-200 bg-white">
                    <div className="font-mono font-bold text-gray-900">{row.vehicle.reg_no}</div>
                    <div className="text-gray-400 text-[10px]">{row.vehicle.make_model}</div>
                  </td>
                  {row.cells.map(cell => (
                    <td key={cell.date}
                      className={`px-2 py-2 border-r border-gray-200 text-center ${CELL_STYLE[cell.status]}`}
                      onClick={() => {
                        if (cell.status === 'OPEN')   onBookCell(row.vehicle.id, cell.date)
                        if (cell.status === 'BOOKED' && cell.booking_id) onViewBooking(cell.booking_id)
                      }}
                      title={
                        cell.status === 'OPEN'   ? 'Click to book' :
                        cell.status === 'BOOKED' ? `Booked: ${cell.client_name}` : 'On hold'
                      }
                    >
                      {cell.status === 'BOOKED' && (
                        <div className="truncate max-w-[64px] mx-auto font-medium text-[10px]">
                          {cell.client_name}
                        </div>
                      )}
                      {cell.status === 'HOLD' && <span className="text-red-400 font-semibold text-xs">Hold</span>}
                      {cell.status === 'OPEN'  && <span className="text-green-600 font-semibold text-xs">Open</span>}
                    </td>
                  ))}
              
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
