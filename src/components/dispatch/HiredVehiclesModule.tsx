'use client'
import { useState } from 'react'
import { useBgtsDb, fmtDate, money, hireBalance } from '@/lib/useBgtsDb'

const C = { navy: '#0a1f38', amber: '#e8a33d', green: '#1e8a5f', red: '#c14343', slate50: '#f6f8fa', slate300: '#c7d0dc', slate500: '#6b7a8f' }
const card: React.CSSProperties = { background: '#fff', border: '1px solid #eef1f5', borderRadius: 10, padding: '18px 20px', marginBottom: 16, boxShadow: '0 1px 3px rgba(15,43,77,.05)' }
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }
const th: React.CSSProperties = { background: C.navy, color: '#fff', textAlign: 'left', padding: '8px 10px', fontSize: 11, letterSpacing: '.4px', textTransform: 'uppercase', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid #eef1f5', verticalAlign: 'top' }

type View = 'lrs' | 'vendors'

export function HiredVehiclesModule() {
  const { db } = useBgtsDb()
  const [view, setView] = useState<View>('lrs')
  const [vendorFilter, setVendorFilter] = useState('')

  const hiredLRs = db.lrs.filter(l => l.ownership === 'Hired')
  const filtered = hiredLRs.filter(l => !vendorFilter || l.hire?.vendorId === vendorFilter)
    .sort((a,b) => a.date < b.date ? 1 : -1)

  // Vendor summary
  const vendorSummary = db.vendors.map(v => {
    const vlrs = hiredLRs.filter(l => l.hire?.vendorId === v.id)
    const totalHire = vlrs.reduce((s, l) => s + (l.hire?.amount || 0), 0)
    const totalAdv  = vlrs.reduce((s, l) => s + (l.hire?.advance || 0), 0)
    const totalPaid = vlrs.reduce((s, l) => {
      const balance = hireBalance(l)
      return s + (l.hire?.amount || 0) - balance
    }, 0)
    const totalBal  = vlrs.reduce((s, l) => s + hireBalance(l), 0)
    return { v, count: vlrs.length, totalHire, totalAdv, totalPaid, totalBal }
  }).filter(x => x.count > 0).sort((a,b) => b.totalBal - a.totalBal)

  return (
    <div style={{ padding: '20px 28px' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'center' }}>
        {(['lrs','vendors'] as View[]).map(v => (
          <button key={v} onClick={()=>setView(v)}
            style={{ padding: '8px 16px', borderRadius: 7, border: '2px solid ' + (view===v?C.amber:'#c7d0dc'), background: view===v?'#fff8ee':'#fff', fontWeight: view===v?700:400, cursor: 'pointer', fontSize: 12.5 }}>
            {v === 'lrs' ? 'Hired LR List' : 'By Vendor'}
          </button>
        ))}
        {view === 'lrs' && (
          <select style={{ padding: '7px 10px', border: '1px solid #c7d0dc', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' }} value={vendorFilter} onChange={e=>setVendorFilter(e.target.value)}>
            <option value="">All Vendors</option>
            {db.vendors.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        )}
        <div style={{ ...card, flex: 1, margin: 0, padding: '10px 14px' }}>
          <span style={{ fontSize: 11, color: C.slate500, textTransform: 'uppercase', fontWeight: 700 }}>Total Balance Due — </span>
          <span style={{ fontSize: 17, fontWeight: 800, color: C.red }}>{money(hiredLRs.reduce((s,l)=>s+hireBalance(l),0))}</span>
        </div>
      </div>

      {view === 'lrs' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={tbl}>
            <thead><tr>
              <th style={th}>LR No</th><th style={th}>Date</th><th style={th}>Truck</th><th style={th}>Route</th>
              <th style={th}>Vendor</th><th style={th}>Hire Amount</th><th style={th}>Advance</th><th style={th}>Payments</th><th style={th}>Balance Due</th><th style={th}>POD</th>
            </tr></thead>
            <tbody>{filtered.map(l => {
              const vendor = db.vendors.find(v=>v.id===l.hire?.vendorId)
              const paysMade = (l.hire?.payments||[]).reduce((s,p)=>s+p.amount,0)
              const bal = hireBalance(l)
              return (
                <tr key={l.id}>
                  <td style={td}><b>{l.lrNo}</b></td>
                  <td style={td}>{fmtDate(l.date)}</td>
                  <td style={td}>{l.truckNo}</td>
                  <td style={td}>{l.fromPlace} → {l.toPlace}</td>
                  <td style={td}>{vendor?.name || '—'}<br/><span style={{ fontSize: 10, color: C.slate500 }}>{vendor?.phone||''}</span></td>
                  <td style={td}><b>{money(l.hire?.amount||0)}</b></td>
                  <td style={td}>{money(l.hire?.advance||0)}</td>
                  <td style={td}>{money(paysMade)}<br/><span style={{ fontSize: 10, color: C.slate500 }}>{(l.hire?.payments||[]).length} entries</span></td>
                  <td style={{ ...td, fontWeight: 700, color: bal > 0 ? C.red : C.green }}>{money(bal)}{bal <= 0 && <span style={{ fontSize: 10, display: 'block', color: C.green }}>SETTLED</span>}</td>
                  <td style={td}><span style={{ background: l.pod?'#e7f3ea':'#fdeaea', color: l.pod?C.green:C.red, fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>{l.pod?'✓ POD':'Pending'}</span></td>
                </tr>
              )
            })}</tbody>
          </table>
        </div>
      )}

      {view === 'vendors' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={tbl}>
            <thead><tr>
              <th style={th}>Vendor</th><th style={th}>Contact</th><th style={th}>LRs</th>
              <th style={th}>Total Hire</th><th style={th}>Total Advance</th><th style={th}>Total Paid</th><th style={th}>Balance Due</th>
            </tr></thead>
            <tbody>{vendorSummary.map(({v,count,totalHire,totalAdv,totalPaid,totalBal})=>(
              <tr key={v.id}>
                <td style={td}><b>{v.name}</b><br/><span style={{ fontSize: 10, color: C.slate500 }}>{v.pan||''}</span></td>
                <td style={td}>{v.phone||'—'}<br/><span style={{ fontSize: 10, color: C.slate500 }}>{v.city||''}</span></td>
                <td style={td}>{count}</td>
                <td style={td}><b>{money(totalHire)}</b></td>
                <td style={td}>{money(totalAdv)}</td>
                <td style={{ ...td, color: C.green }}>{money(totalPaid)}</td>
                <td style={{ ...td, fontWeight: 700, color: totalBal > 0 ? C.red : C.green }}>{money(totalBal)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}
