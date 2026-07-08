'use client'
import { useState, useEffect } from 'react'

interface Vehicle { id: string; reg_no: string; make_model: string }
interface Booking {
  id: string; trip_date: string; from_loc: string; to_loc: string
  client_name: string; company_name: string | null; vehicle_id: string
  vehicle?: { reg_no: string }
}

interface TripExpForm {
  bill_no:         string
  trip_no:         string
  booking_id:      string
  vehicle_id:      string
  vehicle_no:      string
  trip_date:       string
  // Leg 1 – outward
  leg1_date:       string
  leg1_from:       string
  leg1_to:         string
  leg1_lr_no:      string
  leg1_qty:        string
  // Leg 2 – return
  leg2_date:       string
  leg2_from:       string
  leg2_to:         string
  leg2_lr_no:      string
  leg2_qty:        string
  // Odometer
  opening_kms:     string
  closing_kms:     string
  // Expenses
  diesel_amt:      string
  diesel_notes:    string
  driver_allowance:string
  toll_1: string; toll_2: string; toll_3: string; toll_4: string; toll_5: string
  rto_expense:     string
  road_entry:      string
  repairs_amt:     string
  repairs_notes:   string
  misc_exp:        string
  loading_exp:     string
  unloading_exp:   string
  petrol:          string
  extra_1_label:   string; extra_1_amt: string
  extra_2_label:   string; extra_2_amt: string
  // Settlement
  advance_cash:    string
  advance_bank:    string
  notes:           string
}

const EMPTY: TripExpForm = {
  bill_no:'', trip_no:'', booking_id:'', vehicle_id:'', vehicle_no:'', trip_date:'',
  leg1_date:'', leg1_from:'', leg1_to:'', leg1_lr_no:'', leg1_qty:'',
  leg2_date:'', leg2_from:'', leg2_to:'', leg2_lr_no:'', leg2_qty:'',
  opening_kms:'', closing_kms:'',
  diesel_amt:'', diesel_notes:'', driver_allowance:'',
  toll_1:'', toll_2:'', toll_3:'', toll_4:'', toll_5:'',
  rto_expense:'', road_entry:'', repairs_amt:'', repairs_notes:'',
  misc_exp:'', loading_exp:'', unloading_exp:'', petrol:'',
  extra_1_label:'', extra_1_amt:'', extra_2_label:'', extra_2_amt:'',
  advance_cash:'', advance_bank:'', notes:'',
}

const n = (v: string) => parseFloat(v) || 0

const INP: React.CSSProperties = {
  width:'100%', border:'1px solid #d1ccbf', borderRadius:5,
  padding:'6px 9px', fontSize:'0.82rem', background:'#fff',
  boxSizing:'border-box',
}
const LBL: React.CSSProperties = {
  display:'block', fontSize:'0.68rem', fontWeight:700,
  textTransform:'uppercase', letterSpacing:'0.07em', color:'#888', marginBottom:3,
}
const SEC: React.CSSProperties = {
  fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase',
  letterSpacing:'0.1em', color:'#c45c28',
  borderBottom:'1px solid #e8e2d8', paddingBottom:3, marginBottom:10, marginTop:4,
}

export function TripExpenseForm() {
  const today = new Date().toISOString().slice(0, 10)
  const [form,     setForm]     = useState<TripExpForm>({ ...EMPTY, trip_date: today })
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [saving,   setSaving]   = useState(false)
  const [err,      setErr]      = useState<string|null>(null)
  const [success,  setSuccess]  = useState(false)

  useEffect(() => {
    fetch('/api/vehicles').then(r => r.json()).then(j => setVehicles(j.data ?? j ?? []))
    fetch('/api/bookings?limit=100').then(r => r.json()).then(j => setBookings(j.data ?? j ?? []))
  }, [])

  const set = (k: keyof TripExpForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }))

  // When a booking is selected — auto-fill vehicle + route
  const handleBookingSelect = (bookingId: string) => {
    const bk = bookings.find(b => b.id === bookingId)
    if (!bk) { setForm(p => ({ ...p, booking_id: '' })); return }
    const veh = vehicles.find(v => v.id === bk.vehicle_id)
    setForm(p => ({
      ...p,
      booking_id: bk.id,
      vehicle_id: bk.vehicle_id,
      vehicle_no: veh?.reg_no ?? '',
      trip_date:  bk.trip_date,
      leg1_date:  bk.trip_date,
      leg1_from:  bk.from_loc,
      leg1_to:    bk.to_loc,
      leg2_from:  bk.to_loc,
      leg2_to:    bk.from_loc,
    }))
  }

  // When vehicle dropdown changes manually
  const handleVehicleSelect = (vehicleId: string) => {
    const veh = vehicles.find(v => v.id === vehicleId)
    setForm(p => ({ ...p, vehicle_id: vehicleId, vehicle_no: veh?.reg_no ?? '' }))
  }

  // Derived totals
  const totalToll       = n(form.toll_1)+n(form.toll_2)+n(form.toll_3)+n(form.toll_4)+n(form.toll_5)
  const totalExp        = n(form.diesel_amt)+n(form.driver_allowance)+totalToll
    +n(form.rto_expense)+n(form.road_entry)+n(form.repairs_amt)
    +n(form.misc_exp)+n(form.loading_exp)+n(form.unloading_exp)
    +n(form.petrol)+n(form.extra_1_amt)+n(form.extra_2_amt)
  const totalKms        = n(form.closing_kms) - n(form.opening_kms)
  // Excel settlement formulas:
  // Bank advance covers diesel; cash advance covers everything else
  const nonDieselExp    = totalExp - n(form.diesel_amt)
  const balCash         = n(form.advance_cash) - nonDieselExp   // + driver returns cash / – company pays driver
  const balBank         = n(form.advance_bank) - n(form.diesel_amt) // + driver returns bank / – company pays

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.vehicle_no) { setErr('Vehicle number is required.'); return }
    setSaving(true); setErr(null)
    try {
      const res = await fetch('/api/dispatch/trip-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          opening_kms:      form.opening_kms ? Number(form.opening_kms) : null,
          closing_kms:      form.closing_kms ? Number(form.closing_kms) : null,
          total_kms:        totalKms > 0 ? totalKms : null,
          diesel_amt:       n(form.diesel_amt),
          driver_allowance: n(form.driver_allowance),
          toll_1: n(form.toll_1), toll_2: n(form.toll_2), toll_3: n(form.toll_3),
          toll_4: n(form.toll_4), toll_5: n(form.toll_5), toll_total: totalToll,
          rto_expense:  n(form.rto_expense),
          road_entry:   n(form.road_entry),
          repairs_amt:  n(form.repairs_amt),
          misc_exp:     n(form.misc_exp),
          loading_exp:  n(form.loading_exp),
          unloading_exp:n(form.unloading_exp),
          petrol:       n(form.petrol),
          extra_1_amt:  n(form.extra_1_amt),
          extra_2_amt:  n(form.extra_2_amt),
          total_expense: totalExp,
          advance_cash: n(form.advance_cash),
          advance_bank: n(form.advance_bank),
          bal_cash:     balCash,  // + = driver returns cash, - = company pays driver
          bal_bank:     balBank,  // + = driver returns bank, - = company pays more
          booking_id:   form.booking_id || null,
          vehicle_id:   form.vehicle_id || null,
        }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setSuccess(true)
      setTimeout(() => { setSuccess(false); setForm({ ...EMPTY, trip_date: today }) }, 1800)
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Failed to save')
    } finally { setSaving(false) }
  }

  const inp = (k: keyof TripExpForm, type='text', ph='') => (
    <input type={type} value={form[k]} onChange={set(k)} placeholder={ph} style={INP} />
  )

  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

        {/* ═══ FORM ══════════════════════════════════════════════════════════ */}
        <div style={{ background:'#faf7f4', border:'1px solid #ddd8d0', borderRadius:10, padding:'20px 24px' }}>
          <h2 style={{ fontWeight:700, fontSize:'1rem', color:'#111', margin:'0 0 2px' }}>
            Road Trip Expense — Bill Entry
          </h2>
          <p style={{ fontSize:'0.72rem', color:'#c45c28', margin:'0 0 16px' }}>
            BARODA GOODS TRANSPORT SERVICE PVT. LTD.
          </p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>

            {/* Link to existing booking (optional) */}
            <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:7, padding:'10px 14px' }}>
              <div style={{ fontSize:'0.68rem', fontWeight:700, color:'#1d4ed8', textTransform:'uppercase', marginBottom:6 }}>
                Link to Existing Booking (optional)
              </div>
              <select
                value={form.booking_id}
                onChange={e => handleBookingSelect(e.target.value)}
                style={{ ...INP, background:'#fff' }}
              >
                <option value="">— Select booking to auto-fill details —</option>
                {bookings.slice(0, 80).map(b => (
                  <option key={b.id} value={b.id}>
                    {b.trip_date} | {b.client_name}{b.company_name ? ` (${b.company_name})` : ''} | {b.from_loc} → {b.to_loc}
                  </option>
                ))}
              </select>
              {form.booking_id && (
                <div style={{ fontSize:'0.7rem', color:'#3b82f6', marginTop:4 }}>
                  ✓ Booking linked — vehicle, route and date auto-filled below
                </div>
              )}
            </div>

            {/* Bill header */}
            <div style={SEC}>Bill Details</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 180px', gap:10 }}>
              <div><label style={LBL}>Bill No</label>{inp('bill_no', 'text', 'e.g. 316')}</div>
              <div><label style={LBL}>Trip No</label>{inp('trip_no', 'text', '')}</div>
              <div><label style={LBL}>Date</label>{inp('trip_date', 'date')}</div>
              <div>
                <label style={LBL}>Vehicle No</label>
                {vehicles.length > 0 ? (
                  <select value={form.vehicle_id} onChange={e => handleVehicleSelect(e.target.value)} style={{ ...INP, background:'#fff' }}>
                    <option value="">— Select vehicle —</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.reg_no}</option>)}
                  </select>
                ) : (
                  <input value={form.vehicle_no} onChange={set('vehicle_no')} placeholder="GJ19 X 6890" style={INP} />
                )}
              </div>
            </div>

            {/* Leg 1 — Outward */}
            <div style={SEC}>Leg 1 — Outward Trip</div>
            <div style={{ display:'grid', gridTemplateColumns:'120px 1fr 1fr 1fr 1fr', gap:10 }}>
              <div><label style={LBL}>Date</label>{inp('leg1_date','date')}</div>
              <div><label style={LBL}>From</label>{inp('leg1_from','text','GACL')}</div>
              <div><label style={LBL}>To</label>{inp('leg1_to','text','Rajkot')}</div>
              <div><label style={LBL}>LR No</label>{inp('leg1_lr_no','text','6617')}</div>
              <div><label style={LBL}>Qty</label>{inp('leg1_qty','text','6 + 4')}</div>
            </div>

            {/* Leg 2 — Return */}
            <div style={SEC}>Leg 2 — Return Trip</div>
            <div style={{ display:'grid', gridTemplateColumns:'120px 1fr 1fr 1fr 1fr', gap:10 }}>
              <div><label style={LBL}>Date</label>{inp('leg2_date','date')}</div>
              <div><label style={LBL}>From</label>{inp('leg2_from','text','Rajkot')}</div>
              <div><label style={LBL}>To</label>{inp('leg2_to','text','GACL')}</div>
              <div><label style={LBL}>LR No</label>{inp('leg2_lr_no','text','6618')}</div>
              <div><label style={LBL}>Qty</label>{inp('leg2_qty','text','6 + 4')}</div>
            </div>

            {/* Odometer */}
            <div style={SEC}>Odometer</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
              <div><label style={LBL}>Opening Kms</label>{inp('opening_kms','number','e.g. 45000')}</div>
              <div><label style={LBL}>Closing Kms</label>{inp('closing_kms','number','e.g. 45800')}</div>
              <div>
                <label style={LBL}>Total Kms (auto)</label>
                <div style={{ ...INP, background:'#f5f5f5', color: totalKms > 0 ? '#111' : '#bbb', display:'flex', alignItems:'center' }}>
                  {totalKms > 0 ? `${totalKms} km` : '—'}
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div style={SEC}>Expense Details</div>

            {/* 1. Diesel */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div>
                <label style={LBL}>1. Diesel Amount (₹)</label>
                {inp('diesel_amt','number','0')}
              </div>
              <div>
                <label style={LBL}>Diesel Notes (litres breakdown)</label>
                {inp('diesel_notes','text','e.g. 120 - 99 - 97 - 53')}
              </div>
            </div>

            {/* 2. Driver */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div><label style={LBL}>2. Driver Allowance + Night (₹)</label>{inp('driver_allowance','number','0')}</div>
              <div style={{ display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
                <label style={LBL}>10. Petrol (₹)</label>{inp('petrol','number','0')}
              </div>
            </div>

            {/* 3. Toll — 5 slots */}
            <div>
              <label style={LBL}>3. Toll — up to 5 entries (₹)</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
                {(['toll_1','toll_2','toll_3','toll_4','toll_5'] as const).map((k,i) => (
                  <div key={k}>
                    <label style={{ ...LBL, color:'#aaa' }}>Toll {i+1}</label>
                    {inp(k,'number','0')}
                  </div>
                ))}
              </div>
              {totalToll > 0 && (
                <div style={{ fontSize:'0.72rem', color:'#555', marginTop:4 }}>
                  Toll total: <strong>₹{totalToll.toLocaleString('en-IN')}</strong>
                </div>
              )}
            </div>

            {/* 4–9 grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              <div><label style={LBL}>4. RTO Expense (₹)</label>{inp('rto_expense','number','0')}</div>
              <div><label style={LBL}>5. Road Entry (₹)</label>{inp('road_entry','number','0')}</div>
              <div><label style={LBL}>7. Misc Exp (₹)</label>{inp('misc_exp','number','0')}</div>
              <div><label style={LBL}>8. Loading Exp (₹)</label>{inp('loading_exp','number','0')}</div>
              <div><label style={LBL}>9. Unloading Exp (₹)</label>{inp('unloading_exp','number','0')}</div>
            </div>

            {/* 6. Repairs */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div><label style={LBL}>6. Repairs / Others (₹)</label>{inp('repairs_amt','number','0')}</div>
              <div><label style={LBL}>Repairs Notes</label>{inp('repairs_notes','text','e.g. Puncture')}</div>
            </div>

            {/* 11 & 12 — free rows */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 80px 1fr 80px', gap:8 }}>
              <div><label style={LBL}>11. Extra Item Label</label>{inp('extra_1_label','text','')}</div>
              <div><label style={LBL}>Amount</label>{inp('extra_1_amt','number','0')}</div>
              <div><label style={LBL}>12. Extra Item Label</label>{inp('extra_2_label','text','')}</div>
              <div><label style={LBL}>Amount</label>{inp('extra_2_amt','number','0')}</div>
            </div>

            {/* Settlement */}
            <div style={SEC}>Settlement / Advance</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div><label style={LBL}>Advance by Cash (₹)</label>{inp('advance_cash','number','0')}</div>
              <div><label style={LBL}>Advance by Bank (₹)</label>{inp('advance_bank','number','0')}</div>
            </div>

            {/* Notes */}
            <div>
              <label style={LBL}>Notes</label>
              <textarea value={form.notes} onChange={set('notes')} rows={2}
                placeholder="Internal notes…"
                style={{ ...INP, resize:'none' }} />
            </div>

            {err && (
              <div style={{ background:'#fff0f0', border:'1px solid #ffd0d0', borderRadius:6, padding:'8px 12px', color:'#c00', fontSize:'0.8rem' }}>
                {err}
              </div>
            )}
            {success && (
              <div style={{ background:'#f0fff4', border:'1px solid #b2dfbd', borderRadius:6, padding:'8px 12px', color:'#1a6e35', fontSize:'0.8rem', fontWeight:600 }}>
                Road trip expense saved successfully!
              </div>
            )}

            <button type="submit" disabled={saving} style={{
              width:'100%', padding:11, background: saving ? '#e0a060' : '#e07a20',
              color:'#fff', border:'none', borderRadius:8, fontWeight:700,
              fontSize:'0.9rem', cursor: saving ? 'not-allowed' : 'pointer', marginTop:4,
            }}>
              {saving ? 'Saving…' : 'Save Road Trip Expense Bill'}
            </button>
          </form>
        </div>

        {/* ═══ SETTLEMENT SUMMARY ════════════════════════════════════════════ */}
        <div style={{ background:'#faf7f4', border:'1px solid #ddd8d0', borderRadius:10, padding:'20px 22px', position:'sticky', top:16 }}>
          <h3 style={{ fontWeight:700, fontSize:'0.95rem', color:'#111', margin:'0 0 14px' }}>Bill Summary</h3>

          {form.vehicle_no && (
            <div style={{ background:'#fff4ee', border:'1px solid #f0d0b0', borderRadius:7, padding:'10px 14px', marginBottom:12 }}>
              <div style={{ fontSize:'0.66rem', color:'#c45c28', fontWeight:700, textTransform:'uppercase', marginBottom:2 }}>Vehicle</div>
              <div style={{ fontWeight:700, fontSize:'1rem', color:'#7a2e00' }}>{form.vehicle_no}</div>
              {(form.leg1_from && form.leg1_to) && (
                <div style={{ fontSize:'0.8rem', color:'#555', marginTop:2 }}>{form.leg1_from} → {form.leg1_to}</div>
              )}
              {totalKms > 0 && (
                <div style={{ fontSize:'0.75rem', color:'#888', marginTop:2 }}>Total: {totalKms} km</div>
              )}
            </div>
          )}

          {[
            { label:'Diesel', val: n(form.diesel_amt) },
            { label:'Driver Allowance', val: n(form.driver_allowance) },
            { label:'Toll (total)', val: totalToll },
            { label:'RTO Expense', val: n(form.rto_expense) },
            { label:'Road Entry', val: n(form.road_entry) },
            { label:'Repairs', val: n(form.repairs_amt) },
            { label:'Misc Exp', val: n(form.misc_exp) },
            { label:'Loading', val: n(form.loading_exp) },
            { label:'Unloading', val: n(form.unloading_exp) },
            { label:'Petrol', val: n(form.petrol) },
            ...(form.extra_1_label ? [{ label: form.extra_1_label, val: n(form.extra_1_amt) }] : []),
            ...(form.extra_2_label ? [{ label: form.extra_2_label, val: n(form.extra_2_amt) }] : []),
          ].filter(r => r.val > 0).map(r => (
            <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #ede8e0', fontSize:'0.82rem' }}>
              <span style={{ color:'#666' }}>{r.label}</span>
              <span style={{ fontWeight:600 }}>₹{r.val.toLocaleString('en-IN')}</span>
            </div>
          ))}

          <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:'0.9rem', fontWeight:700, borderTop:'2px solid #c45c28', marginTop:4 }}>
            <span>Total Expense</span>
            <span style={{ color:'#c45c28' }}>₹{totalExp.toLocaleString('en-IN')}</span>
          </div>

          <div style={{ marginTop:10, padding:'10px 0', borderTop:'1px solid #ede8e0' }}>
            <div style={{ fontSize:'0.64rem', fontWeight:700, textTransform:'uppercase', color:'#c45c28', letterSpacing:'0.08em', marginBottom:6 }}>Settlement</div>

            {/* Cash arm */}
            <div style={{ background:'#fffbf5', border:'1px solid #f0ddc0', borderRadius:6, padding:'8px 10px', marginBottom:6 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', marginBottom:3 }}>
                <span style={{ color:'#666' }}>Advance by Cash</span>
                <span>₹{n(form.advance_cash).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', marginBottom:3 }}>
                <span style={{ color:'#666' }}>Non-Diesel Exp</span>
                <span>₹{nonDieselExp.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.85rem', fontWeight:700, paddingTop:4, borderTop:'1px solid #ede8e0' }}>
                <span>Bal to {balCash >= 0 ? 'Receive (Cash)' : 'Pay (Cash)'}</span>
                <span style={{ color: balCash >= 0 ? '#15803d' : '#b91c1c' }}>
                  ₹{Math.abs(balCash).toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ fontSize:'0.62rem', color:'#aaa', marginTop:2 }}>
                {balCash >= 0 ? 'Driver returns cash to company' : 'Company pays driver in cash'}
              </div>
            </div>

            {/* Bank arm */}
            <div style={{ background:'#f0f7ff', border:'1px solid #bfdbfe', borderRadius:6, padding:'8px 10px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', marginBottom:3 }}>
                <span style={{ color:'#555' }}>Advance by Bank</span>
                <span>₹{n(form.advance_bank).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', marginBottom:3 }}>
                <span style={{ color:'#555' }}>Diesel Expense</span>
                <span>₹{n(form.diesel_amt).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.85rem', fontWeight:700, paddingTop:4, borderTop:'1px solid #dbeafe' }}>
                <span>Bal to {balBank >= 0 ? 'Receive (Bank)' : 'Pay (Bank)'}</span>
                <span style={{ color: balBank >= 0 ? '#15803d' : '#b91c1c' }}>
                  ₹{Math.abs(balBank).toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ fontSize:'0.62rem', color:'#aaa', marginTop:2 }}>
                {balBank >= 0 ? 'Driver returns via bank transfer' : 'Company pays via bank transfer'}
              </div>
            </div>
          </div>

          {form.booking_id && (
            <div style={{ marginTop:12, background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:6, padding:'8px 12px', fontSize:'0.72rem', color:'#1d4ed8' }}>
              🔗 Linked to booking — actual expense will appear on Dispatch Board for margin comparison
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
