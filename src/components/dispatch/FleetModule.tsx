'use client'
import { useState } from 'react'
import { useBgtsDb, fmtDate, money, daysTo } from '@/lib/useBgtsDb'

const C = { navy: '#0a1f38', amber: '#e8a33d', green: '#1e8a5f', red: '#c14343', slate50: '#f6f8fa', slate300: '#c7d0dc', slate500: '#6b7a8f' }
const card: React.CSSProperties = { background: '#fff', border: '1px solid #eef1f5', borderRadius: 10, padding: '18px 20px', marginBottom: 16, boxShadow: '0 1px 3px rgba(15,43,77,.05)' }
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }
const th: React.CSSProperties = { background: C.navy, color: '#fff', textAlign: 'left', padding: '8px 10px', fontSize: 11, letterSpacing: '.4px', textTransform: 'uppercase', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid #eef1f5', verticalAlign: 'top' }

export function FleetModule() {
  const { db } = useBgtsDb()
  const [selected, setSelected] = useState<string|null>(null)

  const ownedVehicles = db.vehicles.filter(v => !v.id.startsWith('hired_'))
  const lrs = db.lrs
  const expenses = db.acctExp

  const stats = ownedVehicles.map(v => {
    const vLRs  = lrs.filter(l => l.vehicleId === v.id || l.truckNo.replace(/\s/g,'').toUpperCase() === v.regNo.replace(/\s/g,'').toUpperCase())
    const vExps = expenses.filter(e => vLRs.some(l => l.id === e.lrId))
    const revenue = vLRs.reduce((s, l) => s + l.gross, 0)
    const expTotal = vExps.reduce((s, e) => s + e.amount, 0)
    const profit = revenue - expTotal
    const docs = db.renewals.filter(r => r.vehicleRegNo.replace(/\s/g,'').toUpperCase() === v.regNo.replace(/\s/g,'').toUpperCase())
    const urgentDoc = docs.find(d => { const dy = daysTo(d.expiryDate); return dy !== null && dy <= 30 })
    return { v, vLRs, vExps, revenue, expTotal, profit, docs, urgentDoc }
  })

  const sel = selected ? stats.find(s => s.v.id === selected) : null

  return (
    <div style={{ padding: '20px 28px' }}>
      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        {stats.map(({ v, revenue, expTotal, profit, urgentDoc }) => (
          <div key={v.id} onClick={() => setSelected(selected === v.id ? null : v.id)}
            style={{ ...card, flex: '1 1 200px', cursor: 'pointer', border: selected === v.id ? '2px solid ' + C.amber : '1px solid #eef1f5', background: selected === v.id ? '#fff8ee' : '#fff', marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: C.navy }}>{v.regNo}</div>
              {urgentDoc && <span style={{ background: '#fff3e0', color: '#b45309', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>⚠ DOC</span>}
            </div>
            <div style={{ fontSize: 11, color: C.slate500, marginBottom: 8 }}>{v.type || 'Truck'}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              <div><div style={{ fontSize: 10, color: C.slate500, textTransform: 'uppercase' }}>Revenue</div><div style={{ fontWeight: 700, fontSize: 13, color: C.navy }}>{money(revenue)}</div></div>
              <div><div style={{ fontSize: 10, color: C.slate500, textTransform: 'uppercase' }}>Expenses</div><div style={{ fontWeight: 700, fontSize: 13, color: C.red }}>{money(expTotal)}</div></div>
              <div style={{ gridColumn: '1/-1' }}><div style={{ fontSize: 10, color: C.slate500, textTransform: 'uppercase' }}>Net P&L</div><div style={{ fontWeight: 800, fontSize: 15, color: profit >= 0 ? C.green : C.red }}>{money(profit)}</div></div>
            </div>
          </div>
        ))}
      </div>

      {sel && (
        <>
          {/* LRs for selected vehicle */}
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 10 }}>{sel.v.regNo} — LR History ({sel.vLRs.length})</div>
            {sel.vLRs.length === 0 ? <div style={{ color: C.slate500, fontSize: 13 }}>No LRs recorded for this vehicle.</div> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={tbl}>
                  <thead><tr><th style={th}>LR No</th><th style={th}>Date</th><th style={th}>Route</th><th style={th}>Consignor</th><th style={th}>Gross</th><th style={th}>POD</th></tr></thead>
                  <tbody>{sel.vLRs.sort((a,b)=>a.date<b.date?1:-1).map(l=>(
                    <tr key={l.id}><td style={td}><b>{l.lrNo}</b></td><td style={td}>{fmtDate(l.date)}</td><td style={td}>{l.fromPlace}→{l.toPlace}</td>
                      <td style={td}>{l.consignor?.name||'—'}</td><td style={td}><b>{money(l.gross)}</b></td>
                      <td style={td}><span style={{ background: l.pod?'#e7f3ea':'#fdeaea', color: l.pod?C.green:C.red, fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>{l.pod?'✓':'Pending'}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>

          {/* Expenses for selected vehicle */}
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 10 }}>{sel.v.regNo} — Expense Log ({sel.vExps.length})</div>
            {sel.vExps.length === 0 ? <div style={{ color: C.slate500, fontSize: 13 }}>No expenses recorded for this vehicle.</div> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={tbl}>
                  <thead><tr><th style={th}>Date</th><th style={th}>Account</th><th style={th}>Amount</th><th style={th}>Paid Through</th><th style={th}>LR</th><th style={th}>Notes</th></tr></thead>
                  <tbody>{sel.vExps.sort((a,b)=>a.date<b.date?1:-1).map(e => {
                    const lr = db.lrs.find(l=>l.id===e.lrId)
                    return (
                      <tr key={e.id}><td style={td}>{fmtDate(e.date)}</td><td style={td}>{e.account}</td>
                        <td style={{ ...td, fontWeight: 700, color: C.red }}>{money(e.amount)}</td>
                        <td style={td}>{e.paidThrough}</td><td style={td}>{lr?.lrNo||'—'}</td><td style={td}>{e.notes||'—'}</td>
                      </tr>
                    )
                  })}</tbody>
                </table>
              </div>
            )}
          </div>

          {/* Documents */}
          {sel.docs.length > 0 && (
            <div style={card}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 10 }}>{sel.v.regNo} — Documents</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={tbl}>
                  <thead><tr><th style={th}>Document</th><th style={th}>Issue Date</th><th style={th}>Expiry</th><th style={th}>Status</th><th style={th}>Amount</th></tr></thead>
                  <tbody>{sel.docs.map(d => {
                    const days = d.expiryDate ? daysTo(d.expiryDate) : null
                    const col = days===null?undefined:days<0?C.red:days<=30?'#b45309':undefined
                    return (
                      <tr key={d.id}><td style={td}>{d.docType}</td><td style={td}>{fmtDate(d.issueDate)}</td>
                        <td style={{ ...td, color: col, fontWeight: col?700:undefined }}>{fmtDate(d.expiryDate)}</td>
                        <td style={td}><span style={{ background: days===null?'#eee':days<0?'#fdeaea':days<=30?'#fff3e0':'#e7f3ea', color: days===null?'#666':days<0?C.red:days<=30?'#b45309':C.green, fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                          {days===null?'—':days<0?`EXPIRED ${Math.abs(days)}d`:days<=30?`DUE ${days}d`:'OK'}
                        </span></td>
                        <td style={td}>{d.amount?`₹${d.amount.toLocaleString('en-IN')}`:'—'}</td>
                      </tr>
                    )
                  })}</tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
