'use client'
import { useState, useRef, useEffect } from 'react'
import { useBgtsDb, uid, todayISO, fmtDate, money, hireBalance } from '@/lib/useBgtsDb'
import type { BgtsLR, BgtsGood, BgtsLRExpense, BgtsParty, BgtsLRCharges } from '@/lib/useBgtsDb'

const C = {
  navy: '#0a1f38', amber: '#e8a33d', green: '#1e8a5f', red: '#c14343',
  slate50: '#f6f8fa', slate100: '#eef1f5', slate300: '#c7d0dc', slate500: '#6b7a8f', slate700: '#33455c',
  border: '1px solid #eef1f5',
}
const cardStyle: React.CSSProperties = { background: '#fff', border: '1px solid #eef1f5', borderRadius: 10, padding: '18px 20px', marginBottom: 18, boxShadow: '0 1px 3px rgba(15,43,77,.05)' }
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }
const th: React.CSSProperties = { background: C.navy, color: '#fff', textAlign: 'left', padding: '8px 10px', fontSize: 11, letterSpacing: '.4px', textTransform: 'uppercase', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid #eef1f5', verticalAlign: 'top' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '7px 10px', border: `1px solid ${C.slate300}`, borderRadius: 6, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: C.slate500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.3px' }
const hintStyle: React.CSSProperties = { fontSize: 11, color: C.slate500, marginTop: 3 }
const btnSm = (color = C.navy): React.CSSProperties => ({ display: 'inline-flex', alignItems: 'center', gap: 4, background: color, color: '#fff', border: 'none', borderRadius: 5, padding: '4px 9px', fontSize: 11, fontWeight: 600, cursor: 'pointer' })
const btnGhost: React.CSSProperties = { ...btnSm(), background: 'transparent', color: C.navy, border: `1px solid ${C.slate300}` }
const btn: React.CSSProperties = { ...btnSm(), padding: '8px 14px', fontSize: 12.5, borderRadius: 7 }

const LR_CHG: [keyof BgtsLRCharges, string][] = [
  ['freight','Freight'],['surcharge','Surcharge'],['localCartage','Local Cartage'],
  ['lastMile','Last Mile'],['fov','F.O.V.'],['loading','Loading'],
  ['unloading','Unloading'],['handling','Handling'],['gc','G.C.'],
  ['other','Other'],['ewayCh','E-Way Charge'],['aoc','AOC'],
]

const emptyParty = (): BgtsParty => ({ name: '', city: '', contact: '', pan: '', gst: '' })
const emptyCharges = (): BgtsLRCharges => ({ abovePct: '', aboveCh: 0, belowPct: '', belowCh: 0, rate: '', rateCh: 0, freight: 0, surcharge: 0, localCartage: 0, lastMile: 0, fov: 0, loading: 0, unloading: 0, handling: 0, gc: 0, other: 0, ewayCh: 0, aoc: 0 })

// ── LR Form ───────────────────────────────────────────────────────────────────

function LRForm({ editId, onDone }: { editId: string | null; onDone: () => void }) {
  const { db, save } = useBgtsDb()
  const existing = editId ? db.lrs.find(l => l.id === editId) : null
  const mainBranch = db.branches[0]

  const [f, setF] = useState<Partial<BgtsLR>>(() => existing ? { ...existing } : {
    lrType: 'ORIGINAL', ownership: 'Owned', truckNo: '', lrNo: (db.company.lrPrefix || 'BGTS/26-27/') + String(db.seq.lr).padStart(4, '0'),
    date: todayISO(), bookingBranch: mainBranch?.name || '', branchId: mainBranch?.id || '',
    fromPlace: '', toPlace: '', toBranch: '', invoiceNo: '', invAmount: '', invoiceDate: '',
    ewayBillNo: '', ewayBillDate: '', ewayExDate: '', poDate: '', packing: '', lorryType: '',
    privateMark: '', lrMode: 'Door Delivery', deliveryAddress: '',
    billingParty: 'Consignor', gstPaidBy: 'Consignee', gstSlab: 'Exempt (RCM)',
    insurance: '', payTerms: 'TO BE BILLED', agent: '', billedAt: '',
    consignor: emptyParty(), consignee: emptyParty(), billingTo: emptyParty(),
    goods: [{ desc: '', pkgType: '', pcs: '', aw: '', cw: '', l: '', w: '', h: '' }],
    aWeight: '', cWeight: '', expenses: [], remark: '', employee: '', driverNo: '',
    charges: emptyCharges(), igstPct: 0, cgstPct: 0, sgstPct: 0,
    subTotal: 0, igstAmt: 0, cgstAmt: 0, sgstAmt: 0, gross: 0, pod: false,
    hire: { vendorId: '', amount: 0, advance: 0, payments: [] },
    vehicleId: '', tripExpenses: [],
  })

  const [goods, setGoods] = useState<BgtsGood[]>(existing?.goods?.length ? existing.goods : [{ desc: '', pkgType: '', pcs: '', aw: '', cw: '', l: '', w: '', h: '' }])
  const [lrExps, setLrExps] = useState<BgtsLRExpense[]>(existing?.expenses || [])

  function recalc(ch: BgtsLRCharges, ig: number, cg: number, sg: number) {
    const sub = (ch.aboveCh || 0) + (ch.belowCh || 0) + LR_CHG.reduce((s, [k]) => s + (Number(ch[k]) || 0), 0)
    const igAmt = Math.round(sub * ig / 100 * 100) / 100
    const cgAmt = Math.round(sub * cg / 100 * 100) / 100
    const sgAmt = Math.round(sub * sg / 100 * 100) / 100
    const gross = Math.round((sub + igAmt + cgAmt + sgAmt) * 100) / 100
    return { subTotal: sub, igstAmt: igAmt, cgstAmt: cgAmt, sgstAmt: sgAmt, gross }
  }

  const setField = (k: keyof BgtsLR, v: unknown) => setF(prev => {
    const updated = { ...prev, [k]: v }
    if (k === 'charges' || k === 'igstPct' || k === 'cgstPct' || k === 'sgstPct') {
      const ch = (k === 'charges' ? v : updated.charges) as BgtsLRCharges
      const ig = k === 'igstPct' ? Number(v) : (updated.igstPct || 0)
      const cg = k === 'cgstPct' ? Number(v) : (updated.cgstPct || 0)
      const sg = k === 'sgstPct' ? Number(v) : (updated.sgstPct || 0)
      Object.assign(updated, recalc(ch, ig, cg, sg))
    }
    return updated
  })

  const setParty = (which: 'consignor' | 'consignee' | 'billingTo', k: keyof BgtsParty, v: string) =>
    setF(prev => ({ ...prev, [which]: { ...(prev[which] as BgtsParty), [k]: v } }))

  const setCharge = (k: keyof BgtsLRCharges, v: string) => {
    const ch = { ...((f.charges || emptyCharges()) as BgtsLRCharges), [k]: k.endsWith('Pct') || k === 'rate' ? v : (Number(v) || 0) }
    setField('charges', ch)
  }

  const handleSave = (andPrint = false) => {
    const req: [string, string][] = [['truckNo','Truck No'],['lrNo','LR No'],['date','Date'],['fromPlace','From Place'],['toPlace','To Place']]
    for (const [k, label] of req) { if (!String((f as Record<string,unknown>)[k] || '').trim()) { alert(`${label} is required.`); return } }
    if (!f.consignor?.name?.trim()) { alert('Consignor Name is required.'); return }
    if (!f.consignee?.name?.trim()) { alert('Consignee Name is required.'); return }
    if (f.ownership === 'Hired' && !f.hire?.vendorId) { alert('Select the Hire Vendor for a Hired-vehicle LR.'); return }
    const lrNo = (f.lrNo || '').trim()
    const dup = db.lrs.some(l => l.lrNo === lrNo && l.id !== editId)
    if (dup) { alert(`LR No ${lrNo} already exists.`); return }

    const ch = f.charges || emptyCharges()
    const { subTotal, igstAmt, cgstAmt, sgstAmt, gross } = recalc(ch as BgtsLRCharges, f.igstPct || 0, f.cgstPct || 0, f.sgstPct || 0)
    const brId = db.branches.find(b => b.name === f.bookingBranch)?.id || db.branches[0]?.id || ''

    const rec: BgtsLR = {
      id: editId || uid('lr'), bookingId: existing?.bookingId || '',
      lrType: f.lrType || 'ORIGINAL', truckNo: f.truckNo || '', lrNo, date: f.date || todayISO(),
      bookingBranch: f.bookingBranch || '', branchId: brId,
      fromPlace: f.fromPlace || '', toPlace: f.toPlace || '', toBranch: f.toBranch || '',
      invoiceNo: f.invoiceNo || '', invAmount: f.invAmount || '', invoiceDate: f.invoiceDate || '',
      ewayBillNo: f.ewayBillNo || '', ewayBillDate: f.ewayBillDate || '', ewayExDate: f.ewayExDate || '', poDate: f.poDate || '',
      packing: f.packing || '', lorryType: f.lorryType || '', privateMark: f.privateMark || '',
      lrMode: f.lrMode || 'Door Delivery', deliveryAddress: f.deliveryAddress || '',
      billingParty: f.billingParty || 'Consignor', gstPaidBy: f.gstPaidBy || 'Consignee', gstSlab: f.gstSlab || 'Exempt (RCM)',
      insurance: f.insurance || '', payTerms: f.payTerms || 'TO BE BILLED', agent: f.agent || '', billedAt: f.billedAt || '',
      consignor: f.consignor || emptyParty(), consignee: f.consignee || emptyParty(), billingTo: f.billingTo || emptyParty(),
      goods: goods.filter(g => g.desc?.trim()),
      aWeight: String(goods.reduce((s, g) => s + (Number(g.aw) || 0), 0) || ''),
      cWeight: String(goods.reduce((s, g) => s + (Number(g.cw) || 0), 0) || ''),
      expenses: lrExps.filter(e => e.amount > 0),
      remark: f.remark || '', employee: f.employee || '', driverNo: f.driverNo || '',
      charges: ch as BgtsLRCharges, igstPct: f.igstPct || 0, cgstPct: f.cgstPct || 0, sgstPct: f.sgstPct || 0,
      subTotal, igstAmt, cgstAmt, sgstAmt, gross,
      pod: existing?.pod || false, ownership: f.ownership || 'Owned',
      hire: f.ownership === 'Hired' ? { vendorId: f.hire?.vendorId || '', amount: Number(f.hire?.amount) || 0, advance: Number(f.hire?.advance) || 0, payments: existing?.hire?.payments || [] } : { vendorId: '', amount: 0, advance: 0, payments: [] },
      vehicleId: f.ownership !== 'Hired' ? (db.vehicles.find(v => v.regNo.replace(/\s/g,'').toUpperCase() === (f.truckNo||'').replace(/\s/g,'').toUpperCase())?.id || '') : '',
      tripExpenses: existing?.tripExpenses || [],
    }

    const d = { ...db }
    if (editId) {
      const idx = d.lrs.findIndex(l => l.id === editId)
      if (idx >= 0) d.lrs[idx] = rec
    } else {
      d.lrs.push(rec)
      if (lrNo === (d.company.lrPrefix || 'BGTS/26-27/') + String(d.seq.lr).padStart(4,'0')) d.seq.lr++
    }
    // post LR expenses to accounting
    d.acctExp = d.acctExp.filter(e => !(e.src === 'lr' && e.lrId === rec.id))
    rec.expenses.forEach(e => {
      d.acctExp.push({ id: uid('ax'), lrId: rec.id, branchId: rec.branchId, date: rec.date, account: e.account, amount: e.amount, paidThrough: 'Petty Cash', vendor: '', ref: 'LR ' + rec.lrNo, notes: e.remarks || 'LR expense', src: 'lr' })
    })
    // sync hire advance
    const advId = 'hadv_' + rec.id
    d.acctExp = d.acctExp.filter(e => e.id !== advId)
    if (rec.ownership === 'Hired' && rec.hire.advance > 0) {
      const vname = d.vendors.find(v => v.id === rec.hire.vendorId)?.name || ''
      d.acctExp.push({ id: advId, lrId: rec.id, branchId: rec.branchId, date: rec.date, account: 'Hired Vehicle / Subcontractor', amount: rec.hire.advance, paidThrough: 'Bank — Current A/c', vendor: vname, ref: 'LR ' + rec.lrNo + ' — hire advance', notes: 'Hire advance', src: 'hire' })
    }
    save(d)
    if (andPrint) { setTimeout(() => printLRDoc(rec, d), 100) }
    onDone()
  }

  const inp = (k: keyof BgtsLR, label: string, type = 'text', opts?: string[], hint?: string) => (
    <div>
      <label style={labelStyle}>{label}</label>
      {opts ? (
        <select style={inputStyle} value={String((f[k] as string) || '')} onChange={e => setField(k, e.target.value)}>
          {opts.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input style={inputStyle} type={type} value={String((f[k] as string | number) ?? '')} onChange={e => setField(k, type === 'number' ? Number(e.target.value) : e.target.value)} />
      )}
      {hint && <div style={hintStyle}>{hint}</div>}
    </div>
  )

  const partyBlock = (which: 'consignor' | 'consignee' | 'billingTo', title: string) => {
    const p = (f[which] || emptyParty()) as BgtsParty
    const pi = (k: keyof BgtsParty, lbl: string) => (
      <div><label style={labelStyle}>{lbl}</label><input style={inputStyle} value={p[k]} onChange={e => setParty(which, k, e.target.value)} /></div>
    )
    return (
      <div style={{ ...cardStyle, borderLeft: '3px solid ' + (which === 'consignor' ? '#1d4d84' : which === 'consignee' ? '#cf8c28' : '#1e8a5f') }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: C.navy, marginBottom: 10 }}>{title}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {pi('name','Name')}{pi('city','City')}{pi('contact','Contact')}{pi('pan','PAN')}{pi('gst','GSTIN')}
        </div>
      </div>
    )
  }

  const goodsRow = (g: BgtsGood, i: number) => {
    const upd = (k: keyof BgtsGood, v: string) => setGoods(prev => { const n = [...prev]; n[i] = { ...n[i], [k]: v }; return n })
    const si: React.CSSProperties = { ...inputStyle, padding: '5px 6px', fontSize: 12 }
    return (
      <tr key={i}>
        <td style={td}><input style={si} value={g.desc} onChange={e => upd('desc', e.target.value)} placeholder="Description" /></td>
        <td style={td}><input style={si} value={g.pkgType} onChange={e => upd('pkgType', e.target.value)} /></td>
        <td style={td}><input style={{ ...si, width: 60 }} value={g.pcs} onChange={e => upd('pcs', e.target.value)} /></td>
        <td style={td}><input style={{ ...si, width: 70 }} type="number" value={g.aw} onChange={e => upd('aw', e.target.value)} /></td>
        <td style={td}><input style={{ ...si, width: 70 }} type="number" value={g.cw} onChange={e => upd('cw', e.target.value)} /></td>
        <td style={td}><input style={{ ...si, width: 55 }} value={g.l} onChange={e => upd('l', e.target.value)} /></td>
        <td style={td}><input style={{ ...si, width: 55 }} value={g.w} onChange={e => upd('w', e.target.value)} /></td>
        <td style={td}><input style={{ ...si, width: 55 }} value={g.h} onChange={e => upd('h', e.target.value)} /></td>
        <td style={td}><button style={btnSm(C.red)} onClick={() => setGoods(prev => prev.filter((_, j) => j !== i))}>✕</button></td>
      </tr>
    )
  }

  const expRow = (e: BgtsLRExpense, i: number) => {
    const upd = (k: keyof BgtsLRExpense, v: string) => setLrExps(prev => { const n = [...prev]; (n[i] as unknown as Record<string,unknown>)[k] = k === 'amount' ? Number(v) : v; return n })
    const si: React.CSSProperties = { ...inputStyle, padding: '5px 6px', fontSize: 12 }
    const EXP_HEADS = ['Fuel Expense','Toll & FASTag','Driver Salaries & Bhatta','Vehicle Repairs & Maintenance','Tyres & Spares','Vehicle Insurance & Permits','Loading & Unloading Charges','Hired Vehicle / Subcontractor','Freight Expense (Rail/Air)','Other Expenses']
    return (
      <tr key={i}>
        <td style={td}><select style={si} value={e.account} onChange={ev => upd('account', ev.target.value)}>{EXP_HEADS.map(h => <option key={h}>{h}</option>)}</select></td>
        <td style={td}><input style={{ ...si, width: 100 }} type="number" value={e.amount || ''} onChange={ev => upd('amount', ev.target.value)} /></td>
        <td style={td}><input style={si} value={e.remarks} onChange={ev => upd('remarks', ev.target.value)} /></td>
        <td style={td}><button style={btnSm(C.red)} onClick={() => setLrExps(prev => prev.filter((_, j) => j !== i))}>✕</button></td>
      </tr>
    )
  }

  const sub = (f.subTotal || 0)
  const ch = (f.charges || emptyCharges()) as BgtsLRCharges

  return (
    <div style={{ padding: '20px 28px' }}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: C.navy, flex: 1 }}>{editId ? `Edit LR — ${existing?.lrNo}` : 'ADD NEW LR'}</span>
          <button style={btnGhost} onClick={onDone}>← Back to Register</button>
        </div>
      </div>

      {/* Basic fields */}
      <div style={cardStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {inp('lrType','LR Type',undefined,['ORIGINAL','DUMMY'])}
          <div>
            <label style={labelStyle}>Vehicle Ownership *</label>
            <select style={inputStyle} value={f.ownership || 'Owned'} onChange={e => setField('ownership', e.target.value)}>
              <option>Owned</option><option>Hired</option>
            </select>
            <div style={hintStyle}>Owned → trip expenses tracked. Hired → hire balance tracked below.</div>
          </div>
          <div>
            <label style={labelStyle}>Truck No *</label>
            <input style={inputStyle} list="vehlist" value={f.truckNo || ''} onChange={e => setField('truckNo', e.target.value)} />
            <datalist id="vehlist">{db.vehicles.map(v => <option key={v.id} value={v.regNo} />)}</datalist>
          </div>
          <div>
            <label style={labelStyle}>LR No *</label>
            <input style={inputStyle} value={f.lrNo || ''} onChange={e => setField('lrNo', e.target.value)} />
          </div>
          {inp('date','Date *','date')}
          <div>
            <label style={labelStyle}>Booking Branch</label>
            <select style={inputStyle} value={f.bookingBranch || ''} onChange={e => setField('bookingBranch', e.target.value)}>
              {db.branches.map(b => <option key={b.id}>{b.name}</option>)}
            </select>
          </div>
          {inp('fromPlace','From Place *')}
          {inp('toPlace','To Place *')}
          {inp('toBranch','To Branch')}
        </div>
      </div>

      {/* Hire Section */}
      {f.ownership === 'Hired' && (
        <div style={{ ...cardStyle, borderLeft: '4px solid ' + C.red }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 10 }}>Hire Details (internal — never prints on LR)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Hire Vendor *</label>
              <select style={inputStyle} value={f.hire?.vendorId || ''} onChange={e => setField('hire', { ...f.hire, vendorId: e.target.value })}>
                <option value="">— select vendor —</option>
                {db.vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
              <div style={hintStyle}>Add vendors under Masters → Vendors</div>
            </div>
            <div>
              <label style={labelStyle}>Lorry Hire (₹)</label>
              <input style={inputStyle} type="number" value={f.hire?.amount || ''} onChange={e => setField('hire', { ...f.hire, amount: Number(e.target.value) })} />
            </div>
            <div>
              <label style={labelStyle}>Advance Paid (₹)</label>
              <input style={inputStyle} type="number" value={f.hire?.advance || ''} onChange={e => setField('hire', { ...f.hire, advance: Number(e.target.value) })} />
            </div>
          </div>
        </div>
      )}

      {/* Invoice & E-Way */}
      <div style={cardStyle}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 12 }}>Invoice & E-Way Bill</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {inp('invoiceNo','Invoice No')}{inp('invAmount','Invoice Amount (₹)','number')}
          {inp('invoiceDate','Invoice Date','date')}{inp('ewayBillNo','E-Way Bill No')}
          {inp('ewayBillDate','E-Way Bill Date','date')}{inp('ewayExDate','E-Way Expiry Date','date')}
          {inp('poDate','P.O. Date','date')}
        </div>
      </div>

      {/* Shipment */}
      <div style={cardStyle}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 12 }}>Shipment Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {inp('packing','Method of Packing')}
          {inp('lorryType','Lorry Type')}
          {inp('privateMark','Private Mark')}
          {inp('lrMode','LR Mode',undefined,['Door Delivery','Godown Delivery','Direct Delivery'])}
          {inp('billingParty','Billing Party',undefined,['Consignor','Consignee','Third Party'])}
          {inp('gstPaidBy','GST Paid By',undefined,['Consignor','Consignee','Transporter'])}
          {inp('gstSlab','GST Slab',undefined,['Exempt (RCM)','0%','5%','12%','18%'])}
          {inp('insurance','Insurance')}
          {inp('payTerms','Payment Terms',undefined,['PAID','TO PAY','TO BE BILLED'])}
          {inp('agent','Agent')}
          {inp('billedAt','To Be Billed At')}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Delivery Address</label>
            <textarea style={{ ...inputStyle, minHeight: 60 }} value={f.deliveryAddress || ''} onChange={e => setField('deliveryAddress', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Parties */}
      {partyBlock('consignor','CONSIGNOR')}
      {partyBlock('consignee','CONSIGNEE')}
      {partyBlock('billingTo','BILLING TO')}

      {/* Goods */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: C.navy, flex: 1 }}>Goods Details</span>
          <button style={{ ...btnSm(), padding: '5px 10px' }} onClick={() => setGoods(prev => [...prev, { desc: '', pkgType: '', pcs: '', aw: '', cw: '', l: '', w: '', h: '' }])}>+ Row</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={tbl}>
            <thead><tr><th style={th}>Description</th><th style={th}>Pkgs Type</th><th style={th}>Pcs</th><th style={th}>Act. Wt</th><th style={th}>Chg. Wt</th><th style={th}>L</th><th style={th}>W</th><th style={th}>H</th><th style={th}></th></tr></thead>
            <tbody>{goods.map((g, i) => goodsRow(g, i))}</tbody>
          </table>
        </div>
      </div>

      {/* LR Expenses */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: C.navy, flex: 1 }}>LR Expenses</span>
          <button style={{ ...btnSm(), padding: '5px 10px' }} onClick={() => setLrExps(prev => [...prev, { account: 'Other Expenses', amount: 0, remarks: '' }])}>+ Row</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={tbl}>
            <thead><tr><th style={th}>Account Name</th><th style={th}>Amount</th><th style={th}>Remarks</th><th style={th}></th></tr></thead>
            <tbody>{lrExps.map((e, i) => expRow(e, i))}</tbody>
          </table>
        </div>
        <div style={{ ...hintStyle, marginTop: 6 }}>These post automatically into Accounting → Expenses when the LR is saved.</div>
      </div>

      {/* Remarks */}
      <div style={cardStyle}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 12 }}>Remarks & Staff</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Remark</label>
            <textarea style={{ ...inputStyle, minHeight: 60 }} value={f.remark || ''} onChange={e => setField('remark', e.target.value)} />
          </div>
          {inp('employee','Employee')}{inp('driverNo','Truck Driver No')}
        </div>
      </div>

      {/* Charges */}
      <div style={cardStyle}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 12 }}>Charges</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label style={labelStyle}>Above %</label><input style={inputStyle} type="number" value={ch.abovePct || ''} onChange={e => setCharge('abovePct', e.target.value)} /></div>
          <div><label style={labelStyle}>Above — Charge (₹)</label><input style={inputStyle} type="number" value={ch.aboveCh || ''} onChange={e => setCharge('aboveCh', e.target.value)} /></div>
          <div><label style={labelStyle}>Below %</label><input style={inputStyle} type="number" value={ch.belowPct || ''} onChange={e => setCharge('belowPct', e.target.value)} /></div>
          <div><label style={labelStyle}>Below — Charge (₹)</label><input style={inputStyle} type="number" value={ch.belowCh || ''} onChange={e => setCharge('belowCh', e.target.value)} /></div>
          {LR_CHG.map(([k, label]) => (
            <div key={k}><label style={labelStyle}>{label} (₹)</label><input style={inputStyle} type="number" value={(ch[k] as number) || ''} onChange={e => setCharge(k, e.target.value)} /></div>
          ))}
        </div>
        <div style={{ marginTop: 14, background: C.slate50, borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: C.navy }}><span>SUB TOTAL</span><span>{money(sub)}</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
            <div><label style={labelStyle}>IGST %</label><input style={inputStyle} type="number" value={f.igstPct || ''} onChange={e => setField('igstPct', Number(e.target.value))} /></div>
            <div><label style={labelStyle}>IGST Amount</label><div style={{ padding: '8px 0', fontWeight: 700 }}>{money(f.igstAmt || 0)}</div></div>
            <div><label style={labelStyle}>CGST %</label><input style={inputStyle} type="number" value={f.cgstPct || ''} onChange={e => setField('cgstPct', Number(e.target.value))} /></div>
            <div><label style={labelStyle}>CGST Amount</label><div style={{ padding: '8px 0', fontWeight: 700 }}>{money(f.cgstAmt || 0)}</div></div>
            <div><label style={labelStyle}>SGST %</label><input style={inputStyle} type="number" value={f.sgstPct || ''} onChange={e => setField('sgstPct', Number(e.target.value))} /></div>
            <div><label style={labelStyle}>SGST Amount</label><div style={{ padding: '8px 0', fontWeight: 700 }}>{money(f.sgstAmt || 0)}</div></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 800, color: C.navy, borderTop: `2px solid ${C.amber}`, marginTop: 10, paddingTop: 10 }}>
            <span>GROSS AMOUNT</span><span>{money(f.gross || 0)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button style={{ ...btn, ...btnGhost }} onClick={onDone}>Cancel</button>
          <button style={btn} onClick={() => handleSave(false)}>Save LR</button>
          <button style={{ ...btn, background: C.amber, color: C.navy }} onClick={() => handleSave(true)}>Save & Print</button>
        </div>
      </div>
    </div>
  )
}

// ── Print LR Doc ──────────────────────────────────────────────────────────────

import type { BgtsDB } from '@/lib/useBgtsDb'
function printLRDoc(l: BgtsLR, db: BgtsDB) {
  const br = db.branches.find(b => b.id === l.branchId) || db.branches[0]
  const co = { name: br?.entityName || db.company.name, addr: br?.addr || db.company.addr, gstin: br?.gstin || db.company.gstin, phone: br?.phone || db.company.phone }
  const esc = (s: unknown) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  const goodsRows = (l.goods || []).map((g, i) =>
    `<tr><td>${i+1}</td><td>${esc(g.desc)}</td><td>${esc(g.pkgType||'—')}</td><td>${esc(g.pcs||'—')}</td><td>${esc(g.aw||'—')}</td><td>${esc(g.cw||'—')}</td><td>${esc(g.l&&g.l?g.l+'×'+g.w+'×'+g.h:'—')}</td></tr>`
  ).join('') || '<tr><td colspan="7">—</td></tr>'
  const ch = l.charges || {} as BgtsLRCharges
  const chgRows = LR_CHG.filter(([k]) => Number((ch as unknown as Record<string,unknown>)[k])).map(([k,label]) =>
    `<tr><td>${label}</td><td style="text-align:right">₹${Number((ch as unknown as Record<string,unknown>)[k]).toLocaleString('en-IN')}</td></tr>`
  ).join('')
  const partyCell = (p?: BgtsParty) => `<b>${esc(p?.name||'—')}</b>${p?.city?'<br>'+esc(p.city):''}${p?.contact?'<br>Ph: '+esc(p.contact):''}${p?.gst?'<br>GST: '+esc(p.gst):''}`
  const html = `<!DOCTYPE html><html><head><style>
    body{font-family:'Segoe UI',Arial,sans-serif;color:#111;font-size:12px;}
    .lrhead{background:#0a1f38;color:#fff;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;}
    .lrhead h1{margin:0;font-size:18px;} .lrhead p{margin:2px 0 0;font-size:10px;color:#c7d0dc;}
    .lrnum{text-align:right;font-size:12px;} .lrnum b{color:#e8a33d;font-size:15px;}
    table{width:100%;border-collapse:collapse;} td,th{border:1px solid #94a3b8;padding:6px 8px;font-size:11.5px;text-align:left;vertical-align:top;}
    th{background:#eef1f5;font-size:10px;text-transform:uppercase;letter-spacing:.3px;}
    .sig{height:60px;} .terms{font-size:9px;color:#555;padding:8px 12px;border-top:1px solid #94a3b8;}
    @media print{@page{margin:12mm;}}
  </style></head><body>
    <div style="border:2px solid #0a1f38;padding:0;max-width:800px;margin:0 auto">
      <div class="lrhead"><div><h1>${esc(co.name)}</h1><p>${esc(co.addr)}${co.gstin?' · GSTIN: '+esc(co.gstin):''}${co.phone?' · Ph: '+esc(co.phone):''}</p><p>CONSIGNMENT NOTE / LORRY RECEIPT — AT OWNER'S RISK${l.lrType==='DUMMY'?' — DUMMY':''}</p></div>
        <div class="lrnum">LR No.<br><b>${esc(l.lrNo)}</b><br>Date: ${fmtDate(l.date)}<br>${esc(l.lrType)}</div></div>
      <table><tr><th>Truck No</th><th>From</th><th>To</th><th>Booking Branch</th><th>To Branch</th><th>Lorry Type</th></tr>
        <tr><td><b>${esc(l.truckNo)}</b></td><td>${esc(l.fromPlace)}</td><td>${esc(l.toPlace)}</td><td>${esc(l.bookingBranch||'—')}</td><td>${esc(l.toBranch||'—')}</td><td>${esc(l.lorryType||'—')}</td></tr></table>
      <table><tr><th style="width:33%">Consignor</th><th style="width:33%">Consignee</th><th>Billing To</th></tr>
        <tr><td>${partyCell(l.consignor)}</td><td>${partyCell(l.consignee)}</td><td>${l.billingTo?.name?partyCell(l.billingTo):esc(l.billingParty||'—')}</td></tr></table>
      <table><tr><th>Invoice No</th><th>Inv. Amount</th><th>Inv. Date</th><th>E-Way Bill No</th><th>E-Way Date</th><th>E-Way Expiry</th><th>P.O. Date</th></tr>
        <tr><td>${esc(l.invoiceNo||'—')}</td><td>${l.invAmount?'₹'+Number(l.invAmount).toLocaleString('en-IN'):'—'}</td><td>${fmtDate(l.invoiceDate)}</td><td>${esc(l.ewayBillNo||'—')}</td><td>${fmtDate(l.ewayBillDate)}</td><td>${fmtDate(l.ewayExDate)}</td><td>${fmtDate(l.poDate)}</td></tr></table>
      <table><tr><th>#</th><th>Description</th><th>Pkgs Type</th><th>Pcs</th><th>Actual Wt</th><th>Charged Wt</th><th>L×W×H</th></tr>
        ${goodsRows}<tr><td colspan="4" style="text-align:right"><b>TOTAL</b></td><td><b>${esc(l.aWeight||'—')}</b></td><td><b>${esc(l.cWeight||'—')}</b></td><td></td></tr></table>
      <table><tr><th>Packing</th><th>Private Mark</th><th>LR Mode</th><th>GST Paid By</th><th>GST Slab</th><th>Insurance</th><th>Payment</th><th>Agent</th></tr>
        <tr><td>${esc(l.packing||'—')}</td><td>${esc(l.privateMark||'—')}</td><td>${esc(l.lrMode||'—')}</td><td>${esc(l.gstPaidBy||'—')}</td><td>${esc(l.gstSlab||'—')}</td><td>${esc(l.insurance||'—')}</td><td><b>${esc(l.payTerms||'—')}</b></td><td>${esc(l.agent||'—')}</td></tr></table>
      <table><tr><th colspan="2">Freight & Charges</th></tr>
        ${chgRows}
        <tr><td style="text-align:right"><b>SUB TOTAL</b></td><td style="text-align:right"><b>₹${l.subTotal.toLocaleString('en-IN')}</b></td></tr>
        ${l.igstAmt?`<tr><td style="text-align:right">IGST ${l.igstPct}%</td><td style="text-align:right">₹${l.igstAmt.toLocaleString('en-IN')}</td></tr>`:''}
        ${l.cgstAmt?`<tr><td style="text-align:right">CGST ${l.cgstPct}%</td><td style="text-align:right">₹${l.cgstAmt.toLocaleString('en-IN')}</td></tr>`:''}
        ${l.sgstAmt?`<tr><td style="text-align:right">SGST ${l.sgstPct}%</td><td style="text-align:right">₹${l.sgstAmt.toLocaleString('en-IN')}</td></tr>`:''}
        <tr><td style="text-align:right;background:#eef1f5"><b>GROSS AMOUNT</b></td><td style="text-align:right;background:#eef1f5"><b>₹${l.gross.toLocaleString('en-IN')}</b></td></tr></table>
      ${l.remark?`<table><tr><th>Remarks</th></tr><tr><td>${esc(l.remark)}</td></tr></table>`:''}
      <table><tr><th>Employee</th><th>Truck Driver No</th><th style="width:33%">Receiver Signature & Stamp (POD)</th></tr>
        <tr><td>${esc(l.employee||'—')}</td><td>${esc(l.driverNo||'—')}</td><td class="sig"></td></tr></table>
      <div class="terms">Goods transported at owner's risk. Delivery subject to terms & conditions of carriage of ${esc(co.name)}. Consignment must be insured by the consignor. Subject to Vadodara jurisdiction.</div>
    </div>
    <script>window.onload=function(){window.print();}<\/script>
  </body></html>`
  const w = window.open('','_blank','width=900,height=700')
  if (w) { w.document.write(html); w.document.close() }
}

// ── LR List ───────────────────────────────────────────────────────────────────

type View = 'list' | 'form' | 'pod'

export function LRModule() {
  const { db, save } = useBgtsDb()
  const [view, setView] = useState<View>('list')
  const [editId, setEditId] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [company, setCompany] = useState('')
  const [sort, setSort] = useState<'desc'|'asc'>('desc')

  const filtered = db.lrs.filter(l => {
    if (fromDate && l.date < fromDate) return false
    if (toDate && l.date > toDate) return false
    if (company && (l.consignor?.name || '').toLowerCase() !== company.toLowerCase()) return false
    if (q) {
      const hay = (l.lrNo + ' ' + l.truckNo + ' ' + l.fromPlace + ' ' + l.toPlace + ' ' + (l.consignor?.name||'') + ' ' + (l.consignee?.name||'')).toLowerCase()
      if (!hay.includes(q.toLowerCase())) return false
    }
    return true
  }).sort((a, b) => {
    const cmp = a.date < b.date ? -1 : a.date > b.date ? 1 : 0
    return sort === 'asc' ? cmp : -cmp
  })

  const companies = [...new Set(db.lrs.map(l => l.consignor?.name).filter(Boolean))]

  const vendorName = (id: string) => db.vendors.find(v => v.id === id)?.name || '—'
  const delLR = (id: string) => {
    if (!confirm('Delete this LR?')) return
    const d = { ...db }
    d.lrs = d.lrs.filter(l => l.id !== id)
    d.acctExp = d.acctExp.filter(e => e.lrId !== id)
    save(d)
  }
  const togglePod = (id: string) => {
    const d = { ...db }
    const idx = d.lrs.findIndex(l => l.id === id)
    if (idx >= 0) { d.lrs[idx] = { ...d.lrs[idx], pod: !d.lrs[idx].pod } }
    save(d)
  }
  const addHirePay = (id: string) => {
    const l = db.lrs.find(x => x.id === id); if (!l) return
    const amt = prompt(`Pay hire balance for LR ${l.lrNo}\nBalance due: ₹${hireBalance(l).toLocaleString('en-IN')}\nEnter amount:`)
    if (!amt || isNaN(Number(amt)) || Number(amt) <= 0) return
    const ref = prompt('Reference (UTR/Cheque):') || ''
    const d = { ...db }
    const li = d.lrs.find(x => x.id === id); if (!li) return
    if (!li.hire.payments) li.hire.payments = []
    const payId = uid('hp')
    li.hire.payments.push({ id: payId, date: todayISO(), amount: Number(amt), ref })
    const vname = d.vendors.find(v => v.id === li.hire.vendorId)?.name || ''
    d.acctExp.push({ id: payId, lrId: id, branchId: li.branchId, date: todayISO(), account: 'Hired Vehicle / Subcontractor', amount: Number(amt), paidThrough: 'Bank — Current A/c', vendor: vname, ref: 'LR ' + li.lrNo + ' — hire balance', notes: 'Hire balance payment', src: 'hire' })
    save(d)
  }

  if (view === 'form') {
    return <LRForm editId={editId} onDone={() => { setView('list'); setEditId(null) }} />
  }

  return (
    <div style={{ padding: '20px 28px' }}>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', background: C.slate50, border: C.border, borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={labelStyle}>From Date</label>
          <input type="date" style={{ ...inputStyle, minWidth: 130 }} value={fromDate} onChange={e => setFromDate(e.target.value)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={labelStyle}>To Date</label>
          <input type="date" style={{ ...inputStyle, minWidth: 130 }} value={toDate} onChange={e => setToDate(e.target.value)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
          <label style={labelStyle}>Company</label>
          <select style={inputStyle} value={company} onChange={e => setCompany(e.target.value)}>
            <option value="">All Companies</option>
            {companies.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 180 }}>
          <label style={labelStyle}>Search</label>
          <input style={inputStyle} placeholder="LR No, Truck, Route, Party…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={labelStyle}>Sort</label>
          <select style={inputStyle} value={sort} onChange={e => setSort(e.target.value as 'asc'|'desc')}>
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
        <span style={{ fontSize: 11.5, color: C.slate500, marginLeft: 'auto', alignSelf: 'center' }}>{filtered.length} of {db.lrs.length} LRs</span>
      </div>

      {/* Header */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: C.navy, flex: 1 }}>LR / Consignment Notes Register</span>
          <button style={{ ...btn, background: C.amber, color: C.navy }} onClick={() => { setEditId(null); setView('form') }}>+ New LR</button>
        </div>
      </div>

      {!filtered.length ? (
        <div style={{ padding: 40, textAlign: 'center', color: C.slate500 }}>No LRs match the current filter. Use "+ New LR" to add the first one.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tbl}>
            <thead>
              <tr>
                <th style={th}>LR No</th>
                <th style={th}>Date</th>
                <th style={th}>Truck</th>
                <th style={th}>From → To</th>
                <th style={th}>Consignor</th>
                <th style={th}>Consignee</th>
                <th style={th}>Gross (₹)</th>
                <th style={th}>Ownership</th>
                <th style={th}>Hire Balance</th>
                <th style={th}>POD</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => {
                const hbal = l.ownership === 'Hired' ? hireBalance(l) : 0
                return (
                  <tr key={l.id}>
                    <td style={td}>
                      <b>{l.lrNo}</b><br />
                      <span style={{ fontSize: 10, color: C.slate500 }}>{l.lrType}</span>
                    </td>
                    <td style={td}>{fmtDate(l.date)}</td>
                    <td style={td}>{l.truckNo}</td>
                    <td style={td}>{l.fromPlace} → {l.toPlace}</td>
                    <td style={td}>{l.consignor?.name || '—'}</td>
                    <td style={td}>{l.consignee?.name || '—'}</td>
                    <td style={td}><b>{money(l.gross)}</b></td>
                    <td style={td}>
                      <span style={{ background: l.ownership === 'Hired' ? '#f3eefb' : '#e8edf7', color: l.ownership === 'Hired' ? '#7a5ea8' : '#1d4d84', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                        {l.ownership === 'Hired' ? 'HIRED' : 'OWNED'}
                      </span>
                      {l.ownership === 'Hired' && <div style={{ fontSize: 10, color: C.slate500, marginTop: 2 }}>{vendorName(l.hire?.vendorId || '')}</div>}
                    </td>
                    <td style={td}>
                      {l.ownership === 'Hired' ? (
                        hbal > 0
                          ? <><b style={{ color: C.red }}>{money(hbal)}</b><br /><button style={{ ...btnSm(C.green), marginTop: 4 }} onClick={() => addHirePay(l.id)}>+ Pay</button></>
                          : <span style={{ background: '#e7f3ea', color: C.green, fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>SETTLED</span>
                      ) : '—'}
                    </td>
                    <td style={td}>
                      <button style={{ ...btnSm(l.pod ? C.green : C.slate500), fontSize: 10 }} onClick={() => togglePod(l.id)}>
                        {l.pod ? '✓ POD' : '○ POD'}
                      </button>
                    </td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      <button style={btnGhost} onClick={() => { setEditId(l.id); setView('form') }}>Edit</button>{' '}
                      <button style={btnSm()} onClick={() => printLRDoc(l, db)}>Print</button>{' '}
                      <button style={btnSm(C.red)} onClick={() => delLR(l.id)}>✕</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary strip */}
      <div style={{ ...cardStyle, display: 'flex', gap: 28, flexWrap: 'wrap', marginTop: 12, padding: '12px 16px' }}>
        {[
          { l: 'Total LRs', v: String(filtered.length) },
          { l: 'Total Gross', v: money(filtered.reduce((s, l) => s + l.gross, 0)) },
          { l: 'POD Received', v: String(filtered.filter(l => l.pod).length) },
          { l: 'POD Pending', v: String(filtered.filter(l => !l.pod).length) },
          { l: 'Owned', v: String(filtered.filter(l => l.ownership !== 'Hired').length) },
          { l: 'Hired', v: String(filtered.filter(l => l.ownership === 'Hired').length) },
        ].map(({ l, v }) => (
          <div key={l}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.slate500, textTransform: 'uppercase', letterSpacing: '.3px' }}>{l}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
