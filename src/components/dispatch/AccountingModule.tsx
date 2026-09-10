'use client'
import { useState } from 'react'
import { useBgtsDb, uid, todayISO, fmtDate, money, invPaid, invOutstanding } from '@/lib/useBgtsDb'
import type { BgtsInvoice, BgtsPayment, BgtsAcctExp, BgtsBankTxn } from '@/lib/useBgtsDb'

const C = {
  navy: '#0a1f38', amber: '#e8a33d', green: '#1e8a5f', red: '#c14343',
  slate50: '#f6f8fa', slate100: '#eef1f5', slate300: '#c7d0dc', slate500: '#6b7a8f', slate700: '#33455c',
}
const card: React.CSSProperties = { background: '#fff', border: '1px solid #eef1f5', borderRadius: 10, padding: '18px 20px', marginBottom: 16, boxShadow: '0 1px 3px rgba(15,43,77,.05)' }
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }
const th: React.CSSProperties = { background: C.navy, color: '#fff', textAlign: 'left', padding: '8px 10px', fontSize: 11, letterSpacing: '.4px', textTransform: 'uppercase', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid #eef1f5', verticalAlign: 'top' }
const inp: React.CSSProperties = { width: '100%', padding: '7px 10px', border: '1px solid #c7d0dc', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }
const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: C.slate500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.3px' }
const btnSm = (bg = C.navy, col = '#fff'): React.CSSProperties => ({ display: 'inline-flex', alignItems: 'center', gap: 4, background: bg, color: col, border: 'none', borderRadius: 5, padding: '4px 9px', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const })
const btn: React.CSSProperties = { ...btnSm(), padding: '7px 14px', fontSize: 12.5, borderRadius: 7 }
const badge = (c: string, bg: string): React.CSSProperties => ({ background: bg, color: c, fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 4, display: 'inline-block' })

type SubTab = 'overview' | 'invoices' | 'payments' | 'expenses' | 'banking' | 'customers' | 'backup'

const EXP_HEADS = [
  'Fuel Expense','Toll & FASTag','Driver Salaries & Bhatta','Vehicle Repairs & Maintenance',
  'Tyres & Spares','Vehicle Insurance & Permits','Loading & Unloading Charges',
  'Hired Vehicle / Subcontractor','Freight Expense (Rail/Air)','Other Expenses',
]
const PAY_METHODS = ['Bank — Current A/c','Bank — Savings A/c','Cash','UPI','Cheque','NEFT/RTGS','DD']

// ── Overview ──────────────────────────────────────────────────────────────────

function Overview() {
  const { db } = useBgtsDb()
  const invoices = db.invoices || []
  const payments = db.payments || []
  const expenses = db.acctExp || []
  const totalBilled   = invoices.reduce((s, i) => s + i.amount, 0)
  const totalReceived = payments.reduce((s, p) => s + p.amount, 0)
  const totalOutstanding = invoices.reduce((s, i) => s + invOutstanding(i, payments), 0)
  const totalExpense  = expenses.reduce((s, e) => s + e.amount, 0)
  const profit = totalReceived - totalExpense
  const overdue = invoices.filter(i => !i.cancelled && invOutstanding(i, payments) > 0 && i.dueDate && i.dueDate < todayISO())

  const byHead: Record<string, number> = {}
  expenses.forEach(e => { byHead[e.account] = (byHead[e.account] || 0) + e.amount })
  const topExps = Object.entries(byHead).sort((a,b) => b[1]-a[1]).slice(0,5)

  const kpi = (label: string, value: string, sub?: string, color = C.navy) => (
    <div style={{ ...card, flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.slate500, textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.slate500, marginTop: 2 }}>{sub}</div>}
    </div>
  )

  return (
    <div style={{ padding: '20px 28px' }}>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 8 }}>
        {kpi('Total Billed', money(totalBilled), `${invoices.length} invoices`)}
        {kpi('Received', money(totalReceived), `${payments.length} payments`, C.green)}
        {kpi('Outstanding', money(totalOutstanding), `${invoices.filter(i=>invOutstanding(i,payments)>0).length} pending`, totalOutstanding > 0 ? C.red : C.green)}
        {kpi('Expenses', money(totalExpense), `${expenses.length} entries`, C.red)}
        {kpi('Net (Recv − Exp)', money(profit), undefined, profit >= 0 ? C.green : C.red)}
      </div>

      {overdue.length > 0 && (
        <div style={{ ...card, background: '#fff5f5', border: '1px solid #f5c0c0', borderLeft: '4px solid ' + C.red }}>
          <div style={{ fontWeight: 700, color: C.red, marginBottom: 8 }}>⚠ Overdue Invoices ({overdue.length})</div>
          <table style={tbl}><thead><tr><th style={th}>Invoice No</th><th style={th}>Party</th><th style={th}>Due Date</th><th style={th}>Outstanding</th></tr></thead>
            <tbody>{overdue.slice(0,8).map(i => (
              <tr key={i.id}><td style={td}>{i.invNo}</td><td style={td}>{i.party}</td><td style={td}>{fmtDate(i.dueDate)}</td>
                <td style={{ ...td, fontWeight: 700, color: C.red }}>{money(invOutstanding(i, payments))}</td></tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {topExps.length > 0 && (
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 10 }}>Top Expense Heads</div>
          {topExps.map(([head, amt]) => {
            const pct = totalExpense > 0 ? Math.round(amt / totalExpense * 100) : 0
            return (
              <div key={head} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                  <span>{head}</span><span style={{ fontWeight: 700 }}>{money(amt)} ({pct}%)</span>
                </div>
                <div style={{ height: 6, background: C.slate100, borderRadius: 3 }}>
                  <div style={{ height: '100%', width: pct + '%', background: C.amber, borderRadius: 3 }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Invoices ──────────────────────────────────────────────────────────────────

function InvoicesTab() {
  const { db, save } = useBgtsDb()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string|null>(null)
  const [payInvId, setPayInvId] = useState<string|null>(null)
  const [q, setQ] = useState('')

  const invoices = db.invoices || []
  const payments = db.payments || []

  const filtered = invoices.filter(i => {
    if (!q) return true
    const hay = (i.invNo + ' ' + i.party + ' ' + i.lrNos).toLowerCase()
    return hay.includes(q.toLowerCase())
  }).sort((a,b) => a.date < b.date ? 1 : -1)

  // Inline new-invoice form
  const [f, setF] = useState<Partial<BgtsInvoice>>({})
  const openNew = () => {
    setEditId(null)
    setF({ date: todayISO(), dueDate: '', invNo: 'INV/' + new Date().getFullYear() + '/' + String(db.seq.inv || 1).padStart(4,'0'), party: '', lrNos: '', amount: 0, gst: 0, total: 0, branchId: db.branches[0]?.id || '', cancelled: false, notes: '' })
    setShowForm(true)
  }
  const openEdit = (id: string) => {
    const inv = invoices.find(i => i.id === id); if (!inv) return
    setEditId(id); setF({ ...inv }); setShowForm(true)
  }
  const saveInv = () => {
    if (!f.invNo?.trim() || !f.party?.trim()) { alert('Invoice No and Party are required.'); return }
    const total = (Number(f.amount)||0) + (Number(f.gst)||0)
    const rec: BgtsInvoice = { id: editId || uid('inv'), invNo: f.invNo||'', party: f.party||'', date: f.date||todayISO(), dueDate: f.dueDate||'', lrNos: f.lrNos||'', amount: Number(f.amount)||0, gst: Number(f.gst)||0, total, branchId: f.branchId||'', cancelled: false, notes: f.notes||'' }
    const d = { ...db }
    if (editId) { const idx = d.invoices.findIndex(i=>i.id===editId); if(idx>=0) d.invoices[idx]=rec }
    else { d.invoices.push(rec); d.seq.inv = (d.seq.inv||1) + 1 }
    save(d); setShowForm(false)
  }
  const cancelInv = (id: string) => {
    if (!confirm('Mark this invoice as cancelled?')) return
    const d = { ...db }; const i = d.invoices.find(x=>x.id===id); if(i) i.cancelled=true; save(d)
  }

  // Pay against invoice
  const [payAmt, setPayAmt] = useState('')
  const [payDate, setPayDate] = useState(todayISO())
  const [payMethod, setPayMethod] = useState('Bank — Current A/c')
  const [payRef, setPayRef] = useState('')
  const recordPay = () => {
    const inv = invoices.find(i=>i.id===payInvId); if(!inv) return
    if (!payAmt || Number(payAmt) <= 0) { alert('Enter a valid amount.'); return }
    const d = { ...db }
    d.payments.push({ id: uid('pay'), invoiceId: inv.id, party: inv.party, date: payDate, amount: Number(payAmt), method: payMethod, ref: payRef, branchId: inv.branchId, notes: '' })
    save(d); setPayInvId(null); setPayAmt(''); setPayRef('')
  }

  const fi = (k: keyof BgtsInvoice, label: string, type='text') => (
    <div><label style={lbl}>{label}</label><input style={inp} type={type} value={String((f[k] as string|number) ?? '')} onChange={e => {
      const v = type==='number' ? Number(e.target.value) : e.target.value
      setF(prev => ({ ...prev, [k]: v, total: k==='amount'||k==='gst' ? (k==='amount'?Number(e.target.value):Number(prev.amount||0)) + (k==='gst'?Number(e.target.value):Number(prev.gst||0)) : prev.total }))
    }} /></div>
  )

  return (
    <div style={{ padding: '20px 28px' }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input style={{ ...inp, maxWidth: 260 }} placeholder="Search invoice / party / LR…" value={q} onChange={e=>setQ(e.target.value)} />
        <span style={{ fontSize: 11.5, color: C.slate500 }}>{filtered.length} records</span>
        <span style={{ flex: 1 }} />
        <button style={{ ...btn, background: C.amber, color: C.navy }} onClick={openNew}>+ New Invoice</button>
      </div>

      {showForm && (
        <div style={{ ...card, border: '2px solid ' + C.amber, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 12 }}>{editId ? 'Edit Invoice' : 'New Invoice'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {fi('invNo','Invoice No')}{fi('party','Party / Customer')}
            {fi('date','Date','date')}{fi('dueDate','Due Date','date')}
            {fi('lrNos','LR Nos (comma separated)')}
            <div style={{ gridColumn: '1/-1', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {fi('amount','Amount (₹)','number')}{fi('gst','GST (₹)','number')}
              <div><label style={lbl}>Total</label><div style={{ padding: '8px 0', fontWeight: 800, fontSize: 15, color: C.navy }}>{money((Number(f.amount)||0)+(Number(f.gst)||0))}</div></div>
            </div>
            <div>
              <label style={lbl}>Branch</label>
              <select style={inp} value={f.branchId||''} onChange={e=>setF(p=>({...p,branchId:e.target.value}))}>
                {db.branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Notes</label><input style={inp} value={f.notes||''} onChange={e=>setF(p=>({...p,notes:e.target.value}))} /></div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
            <button style={{ ...btn, background: 'transparent', color: C.navy, border: '1px solid #c7d0dc' }} onClick={()=>setShowForm(false)}>Cancel</button>
            <button style={btn} onClick={saveInv}>Save Invoice</button>
          </div>
        </div>
      )}

      {/* Pay modal */}
      {payInvId && (() => {
        const inv = invoices.find(i=>i.id===payInvId)!
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 10, padding: 24, minWidth: 360, boxShadow: '0 16px 60px rgba(0,0,0,.25)' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.navy, marginBottom: 14 }}>Record Payment — {inv.invNo}</div>
              <div style={{ fontSize: 13, marginBottom: 14, color: C.slate700 }}>Outstanding: <b style={{ color: C.red }}>{money(invOutstanding(inv, payments))}</b></div>
              <div style={{ display: 'grid', gap: 10 }}>
                <div><label style={lbl}>Amount (₹)</label><input style={inp} type="number" value={payAmt} onChange={e=>setPayAmt(e.target.value)} /></div>
                <div><label style={lbl}>Date</label><input style={inp} type="date" value={payDate} onChange={e=>setPayDate(e.target.value)} /></div>
                <div><label style={lbl}>Method</label>
                  <select style={inp} value={payMethod} onChange={e=>setPayMethod(e.target.value)}>
                    {PAY_METHODS.map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Reference / UTR</label><input style={inp} value={payRef} onChange={e=>setPayRef(e.target.value)} /></div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
                <button style={{ ...btn, background: 'transparent', color: C.navy, border: '1px solid #c7d0dc' }} onClick={()=>setPayInvId(null)}>Cancel</button>
                <button style={{ ...btn, background: C.green }} onClick={recordPay}>Save Payment</button>
              </div>
            </div>
          </div>
        )
      })()}

      <div style={{ overflowX: 'auto' }}>
        <table style={tbl}>
          <thead><tr>
            <th style={th}>Invoice No</th><th style={th}>Party</th><th style={th}>Date</th><th style={th}>Due</th>
            <th style={th}>LR Nos</th><th style={th}>Amount</th><th style={th}>GST</th><th style={th}>Total</th>
            <th style={th}>Paid</th><th style={th}>Outstanding</th><th style={th}>Status</th><th style={th}>Actions</th>
          </tr></thead>
          <tbody>{filtered.map(inv => {
            const paid = invPaid(inv, payments)
            const out  = invOutstanding(inv, payments)
            const status = inv.cancelled ? 'CANCELLED' : out <= 0 ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID'
            const statusBadge = status === 'PAID' ? badge(C.green,'#e7f3ea') : status === 'PARTIAL' ? badge('#7a5ea8','#f3eefb') : status === 'CANCELLED' ? badge('#666','#eee') : badge(C.red,'#fdeaea')
            return (
              <tr key={inv.id}>
                <td style={td}><b>{inv.invNo}</b></td>
                <td style={td}>{inv.party}</td>
                <td style={td}>{fmtDate(inv.date)}</td>
                <td style={{ ...td, color: (!inv.cancelled && out > 0 && inv.dueDate < todayISO()) ? C.red : undefined }}>{fmtDate(inv.dueDate)}</td>
                <td style={{ ...td, fontSize: 11, maxWidth: 120 }}>{inv.lrNos}</td>
                <td style={td}>{money(inv.amount)}</td>
                <td style={td}>{money(inv.gst)}</td>
                <td style={td}><b>{money(inv.total)}</b></td>
                <td style={{ ...td, color: C.green }}>{money(paid)}</td>
                <td style={{ ...td, fontWeight: 700, color: out > 0 ? C.red : C.green }}>{money(out)}</td>
                <td style={td}><span style={statusBadge}>{status}</span></td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>
                  {!inv.cancelled && out > 0 && <><button style={btnSm(C.green)} onClick={()=>{ setPayInvId(inv.id); setPayAmt(String(out)); setPayDate(todayISO()); setPayMethod('Bank — Current A/c'); setPayRef('') }}>+ Pay</button>{' '}</>}
                  <button style={btnSm()} onClick={()=>openEdit(inv.id)}>Edit</button>{' '}
                  {!inv.cancelled && <button style={btnSm(C.red)} onClick={()=>cancelInv(inv.id)}>Cancel</button>}
                </td>
              </tr>
            )
          })}</tbody>
        </table>
      </div>

      <div style={{ ...card, marginTop: 12, display: 'flex', gap: 24, flexWrap: 'wrap', padding: '12px 16px' }}>
        {[
          { l: 'Total Billed', v: money(invoices.reduce((s,i)=>s+i.total,0)) },
          { l: 'Received', v: money(invoices.reduce((s,i)=>s+invPaid(i,payments),0)) },
          { l: 'Outstanding', v: money(invoices.reduce((s,i)=>s+invOutstanding(i,payments),0)) },
        ].map(({l,v})=>(
          <div key={l}><div style={{ fontSize: 10, fontWeight: 700, color: C.slate500, textTransform: 'uppercase' }}>{l}</div><div style={{ fontSize: 17, fontWeight: 800, color: C.navy }}>{v}</div></div>
        ))}
      </div>
    </div>
  )
}

// ── Payments ──────────────────────────────────────────────────────────────────

function PaymentsTab() {
  const { db, save } = useBgtsDb()
  const [q, setQ] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [f, setF] = useState<Partial<BgtsPayment>>({})
  const payments = db.payments || []
  const filtered = payments.filter(p => !q || (p.party + ' ' + (p.ref||'') + ' ' + (p.invoiceId||'')).toLowerCase().includes(q.toLowerCase())).sort((a,b)=>a.date<b.date?1:-1)

  const openNew = () => {
    setF({ date: todayISO(), party: '', amount: 0, method: 'Bank — Current A/c', ref: '', invoiceId: '', branchId: db.branches[0]?.id||'', notes: '' })
    setShowForm(true)
  }
  const savePay = () => {
    if (!f.party?.trim()) { alert('Party is required.'); return }
    const d = { ...db }
    d.payments.push({ id: uid('pay'), invoiceId: f.invoiceId||'', party: f.party||'', date: f.date||todayISO(), amount: Number(f.amount)||0, method: f.method||'Bank — Current A/c', ref: f.ref||'', branchId: f.branchId||'', notes: f.notes||'' })
    save(d); setShowForm(false)
  }
  const delPay = (id: string) => { if(!confirm('Delete this payment?')) return; const d={...db}; d.payments=d.payments.filter(p=>p.id!==id); save(d) }

  return (
    <div style={{ padding: '20px 28px' }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
        <input style={{ ...inp, maxWidth: 260 }} placeholder="Search party / ref…" value={q} onChange={e=>setQ(e.target.value)} />
        <span style={{ flex: 1 }} />
        <button style={{ ...btn, background: C.amber, color: C.navy }} onClick={openNew}>+ Record Payment</button>
      </div>

      {showForm && (
        <div style={{ ...card, border: '2px solid ' + C.green, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 12 }}>Record Payment (standalone)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={lbl}>Party</label><input style={inp} value={f.party||''} onChange={e=>setF(p=>({...p,party:e.target.value}))} /></div>
            <div><label style={lbl}>Invoice No (optional)</label>
              <select style={inp} value={f.invoiceId||''} onChange={e=>setF(p=>({...p,invoiceId:e.target.value}))}>
                <option value="">— no invoice —</option>
                {db.invoices.map(i=><option key={i.id} value={i.id}>{i.invNo} — {i.party}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Date</label><input style={inp} type="date" value={f.date||''} onChange={e=>setF(p=>({...p,date:e.target.value}))} /></div>
            <div><label style={lbl}>Amount (₹)</label><input style={inp} type="number" value={f.amount||''} onChange={e=>setF(p=>({...p,amount:Number(e.target.value)}))} /></div>
            <div><label style={lbl}>Method</label>
              <select style={inp} value={f.method||'Bank — Current A/c'} onChange={e=>setF(p=>({...p,method:e.target.value}))}>
                {PAY_METHODS.map(m=><option key={m}>{m}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Reference / UTR</label><input style={inp} value={f.ref||''} onChange={e=>setF(p=>({...p,ref:e.target.value}))} /></div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
            <button style={{ ...btn, background: 'transparent', color: C.navy, border: '1px solid #c7d0dc' }} onClick={()=>setShowForm(false)}>Cancel</button>
            <button style={{ ...btn, background: C.green }} onClick={savePay}>Save</button>
          </div>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={tbl}>
          <thead><tr>
            <th style={th}>Date</th><th style={th}>Party</th><th style={th}>Invoice</th>
            <th style={th}>Amount</th><th style={th}>Method</th><th style={th}>Reference</th><th style={th}>Actions</th>
          </tr></thead>
          <tbody>{filtered.map(p => {
            const inv = db.invoices.find(i=>i.id===p.invoiceId)
            return (
              <tr key={p.id}>
                <td style={td}>{fmtDate(p.date)}</td>
                <td style={td}>{p.party}</td>
                <td style={td}>{inv ? inv.invNo : p.invoiceId ? '?' : '—'}</td>
                <td style={{ ...td, fontWeight: 700, color: C.green }}>{money(p.amount)}</td>
                <td style={td}>{p.method}</td>
                <td style={td}>{p.ref||'—'}</td>
                <td style={td}><button style={btnSm(C.red)} onClick={()=>delPay(p.id)}>✕</button></td>
              </tr>
            )
          })}</tbody>
        </table>
      </div>
      <div style={{ ...card, marginTop: 12, padding: '12px 16px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.slate500, textTransform: 'uppercase' }}>Total Received</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.green }}>{money(filtered.reduce((s,p)=>s+p.amount,0))}</div>
      </div>
    </div>
  )
}

// ── Expenses ──────────────────────────────────────────────────────────────────

function ExpensesTab() {
  const { db, save } = useBgtsDb()
  const [showForm, setShowForm] = useState(false)
  const [q, setQ] = useState('')
  const [headFilter, setHeadFilter] = useState('')
  const [f, setF] = useState<Partial<BgtsAcctExp>>({})

  const expenses = db.acctExp || []
  const filtered = expenses.filter(e => {
    if (headFilter && e.account !== headFilter) return false
    if (q) { const hay = (e.account+' '+(e.vendor||'')+' '+(e.ref||'')+' '+(e.notes||'')).toLowerCase(); if(!hay.includes(q.toLowerCase())) return false }
    return true
  }).sort((a,b)=>a.date<b.date?1:-1)

  const openNew = () => {
    setF({ date: todayISO(), account: EXP_HEADS[0], amount: 0, paidThrough: 'Bank — Current A/c', vendor: '', ref: '', notes: '', branchId: db.branches[0]?.id||'' })
    setShowForm(true)
  }
  const saveExp = () => {
    if (!f.account?.trim() || !f.amount || Number(f.amount) <= 0) { alert('Account and amount are required.'); return }
    const d = { ...db }
    d.acctExp.push({ id: uid('ax'), lrId: '', branchId: f.branchId||'', date: f.date||todayISO(), account: f.account||'', amount: Number(f.amount)||0, paidThrough: f.paidThrough||'Bank — Current A/c', vendor: f.vendor||'', ref: f.ref||'', notes: f.notes||'', src: 'manual' })
    save(d); setShowForm(false)
  }
  const delExp = (id: string) => {
    const e = expenses.find(x=>x.id===id)
    if (e?.src === 'lr' || e?.src === 'hire') { if(!confirm('This expense was auto-posted from an LR. Delete it anyway?')) return } else if(!confirm('Delete this expense?')) return
    const d = { ...db }; d.acctExp = d.acctExp.filter(x=>x.id!==id); save(d)
  }

  return (
    <div style={{ padding: '20px 28px' }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input style={{ ...inp, maxWidth: 220 }} placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)} />
        <select style={{ ...inp, maxWidth: 220 }} value={headFilter} onChange={e=>setHeadFilter(e.target.value)}>
          <option value="">All Heads</option>
          {EXP_HEADS.map(h=><option key={h}>{h}</option>)}
        </select>
        <span style={{ fontSize: 11.5, color: C.slate500 }}>{filtered.length} entries</span>
        <span style={{ flex: 1 }} />
        <button style={{ ...btn, background: C.amber, color: C.navy }} onClick={openNew}>+ Add Expense</button>
      </div>

      {showForm && (
        <div style={{ ...card, border: '2px solid ' + C.amber, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 12 }}>New Expense</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={lbl}>Account Head</label>
              <select style={inp} value={f.account||EXP_HEADS[0]} onChange={e=>setF(p=>({...p,account:e.target.value}))}>
                {EXP_HEADS.map(h=><option key={h}>{h}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Amount (₹)</label><input style={inp} type="number" value={f.amount||''} onChange={e=>setF(p=>({...p,amount:Number(e.target.value)}))} /></div>
            <div><label style={lbl}>Date</label><input style={inp} type="date" value={f.date||''} onChange={e=>setF(p=>({...p,date:e.target.value}))} /></div>
            <div><label style={lbl}>Paid Through</label>
              <select style={inp} value={f.paidThrough||'Bank — Current A/c'} onChange={e=>setF(p=>({...p,paidThrough:e.target.value}))}>
                {PAY_METHODS.map(m=><option key={m}>{m}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Vendor</label><input style={inp} value={f.vendor||''} onChange={e=>setF(p=>({...p,vendor:e.target.value}))} /></div>
            <div><label style={lbl}>Reference</label><input style={inp} value={f.ref||''} onChange={e=>setF(p=>({...p,ref:e.target.value}))} /></div>
            <div style={{ gridColumn:'1/-1' }}><label style={lbl}>Notes</label><input style={inp} value={f.notes||''} onChange={e=>setF(p=>({...p,notes:e.target.value}))} /></div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
            <button style={{ ...btn, background: 'transparent', color: C.navy, border: '1px solid #c7d0dc' }} onClick={()=>setShowForm(false)}>Cancel</button>
            <button style={btn} onClick={saveExp}>Save</button>
          </div>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={tbl}>
          <thead><tr>
            <th style={th}>Date</th><th style={th}>Account Head</th><th style={th}>Amount</th>
            <th style={th}>Paid Through</th><th style={th}>Vendor</th><th style={th}>Reference</th><th style={th}>LR</th><th style={th}>Source</th><th style={th}>Notes</th><th style={th}></th>
          </tr></thead>
          <tbody>{filtered.map(e => {
            const lr = e.lrId ? db.lrs.find(l=>l.id===e.lrId) : null
            return (
              <tr key={e.id}>
                <td style={td}>{fmtDate(e.date)}</td>
                <td style={td}>{e.account}</td>
                <td style={{ ...td, fontWeight: 700, color: C.red }}>{money(e.amount)}</td>
                <td style={td}>{e.paidThrough}</td>
                <td style={td}>{e.vendor||'—'}</td>
                <td style={td}>{e.ref||'—'}</td>
                <td style={td}>{lr ? lr.lrNo : '—'}</td>
                <td style={td}><span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: e.src==='manual'?'#eef1f5':e.src==='hire'?'#f3eefb':'#e8f3ff', color: e.src==='manual'?C.slate500:e.src==='hire'?'#7a5ea8':C.navy }}>{e.src||'manual'}</span></td>
                <td style={td}>{e.notes||'—'}</td>
                <td style={td}><button style={btnSm(C.red)} onClick={()=>delExp(e.id)}>✕</button></td>
              </tr>
            )
          })}</tbody>
        </table>
      </div>
      <div style={{ ...card, marginTop: 12, padding: '12px 16px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.slate500, textTransform: 'uppercase' }}>Total Expenses (filtered)</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.red }}>{money(filtered.reduce((s,e)=>s+e.amount,0))}</div>
      </div>
    </div>
  )
}

// ── Banking ───────────────────────────────────────────────────────────────────

function BankingTab() {
  const { db, save } = useBgtsDb()
  const [showForm, setShowForm] = useState(false)
  const [f, setF] = useState<Partial<BgtsBankTxn>>({})
  const txns = (db.bankTxns || []).sort((a,b)=>a.date<b.date?1:-1)

  const openNew = () => {
    setF({ date: todayISO(), account: 'Bank — Current A/c', type: 'credit', amount: 0, description: '', ref: '', balance: 0 })
    setShowForm(true)
  }
  const saveTxn = () => {
    if (!f.description?.trim() || !f.amount || Number(f.amount)<=0) { alert('Description and amount required.'); return }
    const d = { ...db }
    if (!d.bankTxns) d.bankTxns = []
    d.bankTxns.push({ id: uid('bk'), date: f.date||todayISO(), account: f.account||'Bank — Current A/c', type: f.type||'credit', amount: Number(f.amount)||0, description: f.description||'', ref: f.ref||'', balance: Number(f.balance)||0 })
    save(d); setShowForm(false)
  }
  const del = (id: string) => { if(!confirm('Delete?')) return; const d={...db}; d.bankTxns=(d.bankTxns||[]).filter(t=>t.id!==id); save(d) }

  return (
    <div style={{ padding: '20px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button style={{ ...btn, background: C.amber, color: C.navy }} onClick={openNew}>+ Add Bank Entry</button>
      </div>

      {showForm && (
        <div style={{ ...card, border: '2px solid ' + C.amber, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 12 }}>New Bank Entry</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={lbl}>Date</label><input style={inp} type="date" value={f.date||''} onChange={e=>setF(p=>({...p,date:e.target.value}))} /></div>
            <div><label style={lbl}>Account</label>
              <select style={inp} value={f.account||'Bank — Current A/c'} onChange={e=>setF(p=>({...p,account:e.target.value}))}>
                <option>Bank — Current A/c</option><option>Bank — Savings A/c</option><option>Cash</option>
              </select>
            </div>
            <div><label style={lbl}>Type</label>
              <select style={inp} value={f.type||'credit'} onChange={e=>setF(p=>({...p,type:e.target.value as 'credit'|'debit'}))}>
                <option value="credit">Credit (Money In)</option><option value="debit">Debit (Money Out)</option>
              </select>
            </div>
            <div><label style={lbl}>Amount (₹)</label><input style={inp} type="number" value={f.amount||''} onChange={e=>setF(p=>({...p,amount:Number(e.target.value)}))} /></div>
            <div style={{ gridColumn:'1/-1' }}><label style={lbl}>Description</label><input style={inp} value={f.description||''} onChange={e=>setF(p=>({...p,description:e.target.value}))} /></div>
            <div><label style={lbl}>Reference</label><input style={inp} value={f.ref||''} onChange={e=>setF(p=>({...p,ref:e.target.value}))} /></div>
            <div><label style={lbl}>Balance After (₹)</label><input style={inp} type="number" value={f.balance||''} onChange={e=>setF(p=>({...p,balance:Number(e.target.value)}))} /></div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
            <button style={{ ...btn, background: 'transparent', color: C.navy, border: '1px solid #c7d0dc' }} onClick={()=>setShowForm(false)}>Cancel</button>
            <button style={btn} onClick={saveTxn}>Save</button>
          </div>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={tbl}>
          <thead><tr>
            <th style={th}>Date</th><th style={th}>Account</th><th style={th}>Type</th>
            <th style={th}>Amount</th><th style={th}>Description</th><th style={th}>Reference</th><th style={th}>Balance</th><th style={th}></th>
          </tr></thead>
          <tbody>{txns.map(t => (
            <tr key={t.id}>
              <td style={td}>{fmtDate(t.date)}</td>
              <td style={td}>{t.account}</td>
              <td style={td}><span style={badge(t.type==='credit'?C.green:C.red, t.type==='credit'?'#e7f3ea':'#fdeaea')}>{t.type.toUpperCase()}</span></td>
              <td style={{ ...td, fontWeight: 700, color: t.type==='credit'?C.green:C.red }}>{money(t.amount)}</td>
              <td style={td}>{t.description}</td>
              <td style={td}>{t.ref||'—'}</td>
              <td style={td}>{t.balance ? money(t.balance) : '—'}</td>
              <td style={td}><button style={btnSm(C.red)} onClick={()=>del(t.id)}>✕</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}

// ── Customers ─────────────────────────────────────────────────────────────────

function CustomersTab() {
  const { db } = useBgtsDb()
  const invoices = db.invoices || []
  const payments = db.payments || []
  const parties = [...new Set(invoices.map(i=>i.party))]
  const rows = parties.map(p => {
    const pinv = invoices.filter(i=>i.party===p)
    const total = pinv.reduce((s,i)=>s+i.total,0)
    const paid  = pinv.reduce((s,i)=>s+invPaid(i,payments),0)
    const out   = pinv.reduce((s,i)=>s+invOutstanding(i,payments),0)
    return { p, count: pinv.length, total, paid, out }
  }).sort((a,b)=>b.out-a.out)

  return (
    <div style={{ padding: '20px 28px' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={tbl}>
          <thead><tr>
            <th style={th}>Party / Customer</th><th style={th}>Invoices</th><th style={th}>Total Billed</th><th style={th}>Received</th><th style={th}>Outstanding</th><th style={th}>Status</th>
          </tr></thead>
          <tbody>{rows.map(r => (
            <tr key={r.p}>
              <td style={td}><b>{r.p}</b></td>
              <td style={td}>{r.count}</td>
              <td style={td}>{money(r.total)}</td>
              <td style={{ ...td, color: C.green }}>{money(r.paid)}</td>
              <td style={{ ...td, fontWeight: 700, color: r.out > 0 ? C.red : C.green }}>{money(r.out)}</td>
              <td style={td}><span style={badge(r.out<=0?C.green:C.red, r.out<=0?'#e7f3ea':'#fdeaea')}>{r.out<=0?'CLEAR':'OUTSTANDING'}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}

// ── Backup ────────────────────────────────────────────────────────────────────

function BackupTab() {
  const { db } = useBgtsDb()
  const lrs = db.lrs || []
  const invoices = db.invoices || []

  return (
    <div style={{ padding: '20px 28px' }}>
      <div style={card}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 8 }}>Invoice + LR Archive</div>
        <p style={{ fontSize: 13, color: C.slate700, marginBottom: 12 }}>All {invoices.length} invoices and {lrs.length} LRs are stored in the local database. Use the export buttons below to download a CSV.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ ...btn, background: C.green }}
            onClick={() => {
              const rows = invoices.map(i => [i.invNo, i.party, i.date, i.dueDate, i.lrNos, i.amount, i.gst, i.total, i.cancelled?'Yes':'No', i.notes].join(','))
              const csv = 'InvNo,Party,Date,DueDate,LRNos,Amount,GST,Total,Cancelled,Notes\n' + rows.join('\n')
              const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download = 'BGTS_Invoices.csv'; a.click()
            }}>
            ⬇ Export Invoices CSV
          </button>
          <button style={{ ...btn, background: C.navy }}
            onClick={() => {
              const rows = lrs.map(l => [l.lrNo, l.date, l.truckNo, l.fromPlace, l.toPlace, l.consignor?.name, l.consignee?.name, l.gross, l.payTerms, l.pod?'Yes':'No'].join(','))
              const csv = 'LRNo,Date,TruckNo,From,To,Consignor,Consignee,Gross,PayTerms,POD\n' + rows.join('\n')
              const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download = 'BGTS_LRs.csv'; a.click()
            }}>
            ⬇ Export LRs CSV
          </button>
        </div>
      </div>

      <div style={card}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 10 }}>Invoice Archive (All)</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={tbl}>
            <thead><tr><th style={th}>Inv No</th><th style={th}>Party</th><th style={th}>Date</th><th style={th}>LR Nos</th><th style={th}>Amount</th><th style={th}>GST</th><th style={th}>Total</th><th style={th}>Status</th></tr></thead>
            <tbody>{invoices.sort((a,b)=>a.date<b.date?1:-1).map(i => (
              <tr key={i.id}>
                <td style={td}>{i.invNo}</td><td style={td}>{i.party}</td><td style={td}>{fmtDate(i.date)}</td>
                <td style={{ ...td, fontSize: 11 }}>{i.lrNos}</td><td style={td}>{money(i.amount)}</td>
                <td style={td}>{money(i.gst)}</td><td style={td}><b>{money(i.total)}</b></td>
                <td style={td}><span style={badge(i.cancelled?'#666':C.navy,i.cancelled?'#eee':'#e8edf7')}>{i.cancelled?'CANCELLED':'ACTIVE'}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Shell ─────────────────────────────────────────────────────────────────────

const TABS: { id: SubTab; label: string }[] = [
  { id: 'overview',   label: 'Overview'   },
  { id: 'invoices',   label: 'Invoices'   },
  { id: 'payments',   label: 'Payments'   },
  { id: 'expenses',   label: 'Expenses'   },
  { id: 'banking',    label: 'Banking'    },
  { id: 'customers',  label: 'Customers'  },
  { id: 'backup',     label: 'Archive'    },
]

export function AccountingModule() {
  const [sub, setSub] = useState<SubTab>('overview')
  return (
    <div>
      <div style={{ background: '#f6f8fa', borderBottom: '1px solid #eef1f5', padding: '0 28px', display: 'flex', gap: 0, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setSub(t.id)}
            style={{ padding: '11px 16px', fontSize: 13, fontWeight: sub===t.id?700:400, color: sub===t.id?C.navy:C.slate500, background: 'transparent', border: 'none', borderBottom: `3px solid ${sub===t.id?C.amber:'transparent'}`, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {t.label}
          </button>
        ))}
      </div>
      {sub === 'overview'  && <Overview />}
      {sub === 'invoices'  && <InvoicesTab />}
      {sub === 'payments'  && <PaymentsTab />}
      {sub === 'expenses'  && <ExpensesTab />}
      {sub === 'banking'   && <BankingTab />}
      {sub === 'customers' && <CustomersTab />}
      {sub === 'backup'    && <BackupTab />}
    </div>
  )
}
