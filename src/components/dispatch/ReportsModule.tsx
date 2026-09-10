'use client'
import { useState } from 'react'
import { useBgtsDb, fmtDate, money, invPaid, invOutstanding } from '@/lib/useBgtsDb'

const C = { navy: '#0a1f38', amber: '#e8a33d', green: '#1e8a5f', red: '#c14343', slate50: '#f6f8fa', slate300: '#c7d0dc', slate500: '#6b7a8f' }
const card: React.CSSProperties = { background: '#fff', border: '1px solid #eef1f5', borderRadius: 10, padding: '18px 20px', marginBottom: 16, boxShadow: '0 1px 3px rgba(15,43,77,.05)' }
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }
const th: React.CSSProperties = { background: C.navy, color: '#fff', textAlign: 'left', padding: '8px 10px', fontSize: 11, letterSpacing: '.4px', textTransform: 'uppercase', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid #eef1f5' }
const inp: React.CSSProperties = { padding: '7px 10px', border: '1px solid #c7d0dc', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' }
const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: C.slate500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.3px' }
const btnSm = (bg = C.green): React.CSSProperties => ({ background: bg, color: '#fff', border: 'none', borderRadius: 5, padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer' })

type ReportType = 'summary' | 'receivables' | 'lrwise' | 'vehiclepl' | 'expensehead' | 'podstatus'

const REPORTS: { id: ReportType; label: string; desc: string }[] = [
  { id: 'summary',     label: 'Business Summary',        desc: 'Revenue, expenses, and P&L overview' },
  { id: 'receivables', label: 'Receivables Ageing',      desc: 'Outstanding invoices grouped by age' },
  { id: 'lrwise',      label: 'LR-wise Revenue',         desc: 'Revenue per LR with charges breakdown' },
  { id: 'vehiclepl',   label: 'Vehicle P&L',             desc: 'Profit/loss per vehicle in the fleet' },
  { id: 'expensehead', label: 'Expenses by Head',        desc: 'Expense totals grouped by account head' },
  { id: 'podstatus',   label: 'POD Status Report',       desc: 'Delivery status for all LRs' },
]

export function ReportsModule() {
  const { db } = useBgtsDb()
  const [active, setActive] = useState<ReportType>('summary')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const lrs = db.lrs.filter(l => {
    if (fromDate && l.date < fromDate) return false
    if (toDate && l.date > toDate) return false
    return true
  })
  const invs = db.invoices.filter(i => {
    if (fromDate && i.date < fromDate) return false
    if (toDate && i.date > toDate) return false
    return true
  })
  const exps = db.acctExp.filter(e => {
    if (fromDate && e.date < fromDate) return false
    if (toDate && e.date > toDate) return false
    return true
  })
  const pays = db.payments

  const downloadCSV = (headers: string[], rows: string[][], filename: string) => {
    const csv = [headers.join(','), ...rows.map(r=>r.join(','))].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download = filename + '.csv'; a.click()
  }

  const renderSummary = () => {
    const revenue = lrs.reduce((s, l) => s + l.gross, 0)
    const invoiced = invs.reduce((s, i) => s + i.total, 0)
    const received = invs.reduce((s, i) => s + invPaid(i, pays), 0)
    const outstanding = invs.reduce((s, i) => s + invOutstanding(i, pays), 0)
    const expenses = exps.reduce((s, e) => s + e.amount, 0)
    const netPL = received - expenses
    return (
      <div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          {[
            { l:'Total LRs', v: String(lrs.length) },
            { l:'LR Revenue (Gross)', v: money(revenue) },
            { l:'Total Invoiced', v: money(invoiced) },
            { l:'Cash Received', v: money(received), c: C.green },
            { l:'Outstanding', v: money(outstanding), c: outstanding>0?C.red:C.green },
            { l:'Total Expenses', v: money(expenses), c: C.red },
            { l:'Net P&L', v: money(netPL), c: netPL>=0?C.green:C.red },
          ].map(({l,v,c})=>(
            <div key={l} style={{ ...card, flex:'1 1 120px', margin: 0, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.slate500, textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: c||C.navy }}>{v}</div>
            </div>
          ))}
        </div>
        <button style={btnSm()} onClick={()=>downloadCSV(['Metric','Value'],[['Total LRs',String(lrs.length)],['LR Revenue',String(lrs.reduce((s,l)=>s+l.gross,0))],['Invoiced',String(invoiced)],['Received',String(received)],['Outstanding',String(outstanding)],['Expenses',String(expenses)],['Net P&L',String(netPL)]],'BGTS_Summary')}>⬇ Export CSV</button>
      </div>
    )
  }

  const renderReceivables = () => {
    const today = new Date()
    const bucket = (dueDate: string) => {
      if (!dueDate) return 'Not Set'
      const d = (today.getTime() - new Date(dueDate).getTime()) / 86400000
      if (d < 0) return 'Not Yet Due'
      if (d <= 30) return '0–30 days'
      if (d <= 60) return '31–60 days'
      if (d <= 90) return '61–90 days'
      return '90+ days'
    }
    const pending = db.invoices.filter(i => !i.cancelled && invOutstanding(i, pays) > 0)
    const groups: Record<string, { count: number; total: number }> = {}
    pending.forEach(i => { const b = bucket(i.dueDate); if (!groups[b]) groups[b]={count:0,total:0}; groups[b].count++; groups[b].total+=invOutstanding(i,pays) })
    const ORDER = ['Not Yet Due','0–30 days','31–60 days','61–90 days','90+ days','Not Set']
    return (
      <div>
        <table style={tbl}>
          <thead><tr><th style={th}>Ageing Bucket</th><th style={th}>Count</th><th style={th}>Outstanding Amount</th></tr></thead>
          <tbody>{ORDER.filter(k=>groups[k]).map(k=>(
            <tr key={k}><td style={td}>{k}</td><td style={td}>{groups[k].count}</td>
              <td style={{ ...td, fontWeight: 700, color: k==='Not Yet Due'?C.navy:k.includes('90')?C.red:C.amber }}>{money(groups[k].total)}</td>
            </tr>
          ))}</tbody>
        </table>
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.navy, marginBottom: 8 }}>Pending Invoices Detail</div>
          <table style={tbl}>
            <thead><tr><th style={th}>Invoice No</th><th style={th}>Party</th><th style={th}>Date</th><th style={th}>Due</th><th style={th}>Outstanding</th></tr></thead>
            <tbody>{pending.sort((a,b)=>a.dueDate<b.dueDate?-1:1).map(i=>(
              <tr key={i.id}><td style={td}>{i.invNo}</td><td style={td}>{i.party}</td><td style={td}>{fmtDate(i.date)}</td>
                <td style={td}>{fmtDate(i.dueDate)}</td><td style={{ ...td, fontWeight:700, color:C.red }}>{money(invOutstanding(i,pays))}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderLRWise = () => (
    <div style={{ overflowX: 'auto' }}>
      <button style={btnSm()} onClick={()=>downloadCSV(['LR No','Date','Truck','From','To','Consignor','Consignee','Freight','Surcharge','Other Charges','GST','Gross','POD'],lrs.map(l=>[l.lrNo,l.date,l.truckNo,l.fromPlace,l.toPlace,l.consignor?.name||'',l.consignee?.name||'',String(l.charges?.freight||0),String(l.charges?.surcharge||0),String(l.subTotal-Number(l.charges?.freight||0)-Number(l.charges?.surcharge||0)),String(l.igstAmt+l.cgstAmt+l.sgstAmt),String(l.gross),l.pod?'Yes':'No']),'BGTS_LRwise')}>⬇ Export CSV</button>
      <table style={{ ...tbl, marginTop: 10 }}>
        <thead><tr><th style={th}>LR No</th><th style={th}>Date</th><th style={th}>Truck</th><th style={th}>Route</th><th style={th}>Consignor</th><th style={th}>Gross</th><th style={th}>Pay Terms</th><th style={th}>POD</th></tr></thead>
        <tbody>{lrs.sort((a,b)=>a.date<b.date?1:-1).map(l=>(
          <tr key={l.id}><td style={td}><b>{l.lrNo}</b></td><td style={td}>{fmtDate(l.date)}</td><td style={td}>{l.truckNo}</td>
            <td style={td}>{l.fromPlace}→{l.toPlace}</td><td style={td}>{l.consignor?.name||'—'}</td>
            <td style={{ ...td, fontWeight:700 }}>{money(l.gross)}</td><td style={td}>{l.payTerms}</td>
            <td style={td}><span style={{ background:l.pod?'#e7f3ea':'#fdeaea', color:l.pod?C.green:C.red, fontSize:10, fontWeight:800, padding:'2px 6px', borderRadius:4 }}>{l.pod?'✓ POD':'Pending'}</span></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )

  const renderVehiclePL = () => {
    const rows = db.vehicles.map(v => {
      const vlrs = lrs.filter(l => l.vehicleId===v.id || l.truckNo.replace(/\s/g,'').toUpperCase()===v.regNo.replace(/\s/g,'').toUpperCase())
      const vexp = exps.filter(e => vlrs.some(l=>l.id===e.lrId))
      const rev = vlrs.reduce((s,l)=>s+l.gross,0)
      const exp = vexp.reduce((s,e)=>s+e.amount,0)
      return { reg: v.regNo, type: v.type||'', trips: vlrs.length, rev, exp, pl: rev-exp }
    }).filter(r=>r.trips>0).sort((a,b)=>b.pl-a.pl)
    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={tbl}>
          <thead><tr><th style={th}>Vehicle</th><th style={th}>Type</th><th style={th}>Trips</th><th style={th}>Revenue</th><th style={th}>Expenses</th><th style={th}>P&L</th></tr></thead>
          <tbody>{rows.map(r=>(
            <tr key={r.reg}><td style={td}><b>{r.reg}</b></td><td style={td}>{r.type||'—'}</td><td style={td}>{r.trips}</td>
              <td style={td}>{money(r.rev)}</td><td style={{ ...td, color:C.red }}>{money(r.exp)}</td>
              <td style={{ ...td, fontWeight:700, color:r.pl>=0?C.green:C.red }}>{money(r.pl)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    )
  }

  const renderExpenseHead = () => {
    const byHead: Record<string, number> = {}
    exps.forEach(e => { byHead[e.account]=(byHead[e.account]||0)+e.amount })
    const total = Object.values(byHead).reduce((s,v)=>s+v,0)
    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={tbl}>
          <thead><tr><th style={th}>Account Head</th><th style={th}>Total</th><th style={th}>% of Total</th></tr></thead>
          <tbody>{Object.entries(byHead).sort((a,b)=>b[1]-a[1]).map(([head,amt])=>(
            <tr key={head}><td style={td}>{head}</td><td style={{ ...td, fontWeight:700, color:C.red }}>{money(amt)}</td>
              <td style={td}>{total>0?Math.round(amt/total*100)+'%':'—'}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    )
  }

  const renderPOD = () => {
    const pending = lrs.filter(l=>!l.pod)
    const received = lrs.filter(l=>l.pod)
    return (
      <div>
        <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
          <div style={{ ...card, flex:1, padding:'12px 16px', margin:0 }}><div style={{ fontSize:10, fontWeight:700, color:C.slate500, textTransform:'uppercase' }}>POD Received</div><div style={{ fontSize:24, fontWeight:800, color:C.green }}>{received.length}</div></div>
          <div style={{ ...card, flex:1, padding:'12px 16px', margin:0 }}><div style={{ fontSize:10, fontWeight:700, color:C.slate500, textTransform:'uppercase' }}>POD Pending</div><div style={{ fontSize:24, fontWeight:800, color:C.red }}>{pending.length}</div></div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={tbl}>
            <thead><tr><th style={th}>LR No</th><th style={th}>Date</th><th style={th}>Truck</th><th style={th}>Route</th><th style={th}>Consignee</th><th style={th}>Gross</th><th style={th}>POD</th></tr></thead>
            <tbody>{lrs.sort((a,b)=>a.pod===b.pod?0:a.pod?1:-1).map(l=>(
              <tr key={l.id}><td style={td}><b>{l.lrNo}</b></td><td style={td}>{fmtDate(l.date)}</td><td style={td}>{l.truckNo}</td>
                <td style={td}>{l.fromPlace}→{l.toPlace}</td><td style={td}>{l.consignee?.name||'—'}</td>
                <td style={td}>{money(l.gross)}</td>
                <td style={td}><span style={{ background:l.pod?'#e7f3ea':'#fdeaea', color:l.pod?C.green:C.red, fontSize:10, fontWeight:800, padding:'2px 6px', borderRadius:4 }}>{l.pod?'✓ POD':'Pending'}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px 28px' }}>
      {/* Date filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-end', background: C.slate50, border: '1px solid #eef1f5', borderRadius: 8, padding: '12px 14px' }}>
        <div><label style={lbl}>From Date</label><input type="date" style={inp} value={fromDate} onChange={e=>setFromDate(e.target.value)} /></div>
        <div><label style={lbl}>To Date</label><input type="date" style={inp} value={toDate} onChange={e=>setToDate(e.target.value)} /></div>
        <button style={{ ...btnSm(C.slate500), padding: '7px 12px' }} onClick={()=>{ setFromDate(''); setToDate('') }}>Clear Filter</button>
      </div>

      {/* Report selector */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        {REPORTS.map(r => (
          <div key={r.id} onClick={()=>setActive(r.id)}
            style={{ ...card, flex:'1 1 160px', margin: 0, cursor:'pointer', border: active===r.id?'2px solid '+C.amber:'1px solid #eef1f5', background: active===r.id?'#fff8ee':'#fff', padding:'12px 14px' }}>
            <div style={{ fontWeight:700, fontSize:13, color:C.navy, marginBottom:3 }}>{r.label}</div>
            <div style={{ fontSize:11, color:C.slate500 }}>{r.desc}</div>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={{ fontWeight:700, fontSize:14, color:C.navy, marginBottom:12 }}>
          {REPORTS.find(r=>r.id===active)?.label}
          {(fromDate||toDate) && <span style={{ fontSize:11, color:C.slate500, marginLeft:10 }}>{fromDate||'—'} → {toDate||'—'}</span>}
        </div>
        {active === 'summary'     && renderSummary()}
        {active === 'receivables' && renderReceivables()}
        {active === 'lrwise'      && renderLRWise()}
        {active === 'vehiclepl'   && renderVehiclePL()}
        {active === 'expensehead' && renderExpenseHead()}
        {active === 'podstatus'   && renderPOD()}
      </div>
    </div>
  )
}
