import { NextRequest, NextResponse } from 'next/server'
import { getBgtsAdminClient } from '@/lib/supabase-bgts'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const sb = getBgtsAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (sb as any)
      .from('trip_expenses')
      .insert({
        bill_no:          body.bill_no          || null,
        trip_no:          body.trip_no          || null,
        booking_id:       body.booking_id       || null,
        mvd_booking_id:   body.mvd_booking_id   || null,
        vehicle_id:       body.vehicle_id       || null,
        vehicle_no:       body.vehicle_no,
        trip_date:        body.trip_date        || null,
        leg1_date:        body.leg1_date        || null,
        leg1_from:        body.leg1_from        || null,
        leg1_to:          body.leg1_to          || null,
        leg1_lr_no:       body.leg1_lr_no       || null,
        leg1_qty:         body.leg1_qty         || null,
        leg2_date:        body.leg2_date        || null,
        leg2_from:        body.leg2_from        || null,
        leg2_to:          body.leg2_to          || null,
        leg2_lr_no:       body.leg2_lr_no       || null,
        leg2_qty:         body.leg2_qty         || null,
        opening_kms:      body.opening_kms      ?? null,
        closing_kms:      body.closing_kms      ?? null,
        total_kms:        body.total_kms        ?? null,
        diesel_amt:       body.diesel_amt       ?? 0,
        diesel_notes:     body.diesel_notes     || null,
        driver_allowance: body.driver_allowance ?? 0,
        toll_1:           body.toll_1           ?? 0,
        toll_2:           body.toll_2           ?? 0,
        toll_3:           body.toll_3           ?? 0,
        toll_4:           body.toll_4           ?? 0,
        toll_5:           body.toll_5           ?? 0,
        toll_total:       body.toll_total       ?? 0,
        rto_expense:      body.rto_expense      ?? 0,
        road_entry:       body.road_entry       ?? 0,
        repairs_amt:      body.repairs_amt      ?? 0,
        repairs_notes:    body.repairs_notes    || null,
        misc_exp:         body.misc_exp         ?? 0,
        loading_exp:      body.loading_exp      ?? 0,
        unloading_exp:    body.unloading_exp    ?? 0,
        petrol:           body.petrol           ?? 0,
        extra_1_label:    body.extra_1_label    || null,
        extra_1_amt:      body.extra_1_amt      ?? 0,
        extra_2_label:    body.extra_2_label    || null,
        extra_2_amt:      body.extra_2_amt      ?? 0,
        total_expense:    body.total_expense    ?? 0,
        advance_cash:     body.advance_cash     ?? 0,
        advance_bank:     body.advance_bank     ?? 0,
        bal_cash:         body.bal_cash         ?? 0,  // advance_cash - non_diesel_exp
        bal_bank:         body.bal_bank         ?? 0,  // advance_bank - diesel_amt
        notes:            body.notes            || null,
        status:           'SUBMITTED',
      })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ data: null, error: String(e) }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const bookingId = req.nextUrl.searchParams.get('booking_id')
    const next      = req.nextUrl.searchParams.get('next')
    const sb = getBgtsAdminClient()

    // ── ?next=true  →  return next sequential bill_no and lr_no ─────────────
    if (next === 'true') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (sb as any)
        .from('trip_expenses')
        .select('bill_no, leg1_lr_no, leg2_lr_no')
        .range(0, 999)

      const rows = (data ?? []) as { bill_no: string | null; leg1_lr_no: string | null; leg2_lr_no: string | null }[]

      // Find max numeric bill_no
      let maxBill = 0
      for (const r of rows) {
        const n = parseInt(r.bill_no ?? '', 10)
        if (!isNaN(n) && n > maxBill) maxBill = n
      }

      // Find max 4-digit LR no across both legs (ignore typos like 65556)
      let maxLr = 0
      for (const r of rows) {
        for (const v of [r.leg1_lr_no, r.leg2_lr_no]) {
          const n = parseInt(v ?? '', 10)
          if (!isNaN(n) && n >= 1000 && n <= 9999 && n > maxLr) maxLr = n
        }
      }

      return NextResponse.json({
        next_bill_no:   maxBill > 0 ? String(maxBill + 1) : '',
        next_leg1_lr_no: maxLr  > 0 ? String(maxLr  + 1) : '',
        next_leg2_lr_no: maxLr  > 0 ? String(maxLr  + 2) : '',
      })
    }

    // ── Normal list ──────────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q = (sb as any)
      .from('trip_expenses')
      .select('*')
      .order('created_at', { ascending: false })
      .range(0, 199)
    if (bookingId) q = q.eq('booking_id', bookingId)
    const { data, error } = await q
    if (error) throw error
    return NextResponse.json({ data: data ?? [], error: null })
  } catch (e) {
    return NextResponse.json({ data: null, error: String(e) }, { status: 500 })
  }
}
