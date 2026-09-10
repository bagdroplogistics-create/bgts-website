'use client'
import { useState } from 'react'
import { useBgtsDb, uid, todayISO, fmtDate, daysTo } from '@/lib/useBgtsDb'
import type { BgtsRenewal } from '@/lib/useBgtsDb'

const C = { navy: '#0a1f38', amber: '#e8a33d', green: '#1e8a5f', red: '#c14343', slate50: '#f6f8fa', slate300: '#c7d0dc', slate500: '#6b7a8f' }
const card: React.CSSProperties = { background: '#fff', border: '1px solid #eef1f5', borderRadius: 10, padding: '18px 20px', marginBottom: 16, boxShadow: '0 1px 3px rgba(15,43,77,.05)' }
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }
const th: React.CSSProperties = { background: C.navy, color: '#fff', textAlign: 'left', padding: '8px 10px', fontSize: 11, letterSpacing: '.4px', textTransform: 'uppercase', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid #eef1f5', verticalAlign: 'top' }
const inp: React.CSSProperties = { width: '100%', padding: '7px 10px', border: '1px solid #c7d0dc', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }
const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: C.slate500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.3px' }
const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 4, background: C.navy, color: '#fff', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }
const btnSm = (bg = C.red): React.CSSProperties => ({ display: 'inline-flex', alignItems: 'center', gap: 4, background: bg, color: '#fff', border: 'none', borderRadius: 5, padding: '4px 9px', fontSize: 11, fontWeight: 600, cursor: 'pointer' })

const DOC_TYPES = ['Insurance','Fitness Certificate','PUC','Road Tax','National Permit','State Permit','Driver License','Fastag','Load Registr.','Other']

function statusBadge(days: number | null) {
  if (days === null) return null
  if (days < 0) return <span style={{ background: '#fdeaea', color: C.red, fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>EXPIRED {Math.abs(days)}d ago</span>
  if (days <= 15) return <span style={{ background: '#fff3e0', color: '#b45309', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>DUE IN {days}d</span>
  if (days <= 30) return <span style={{ background: '#fffde7', color: '#856404', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>IN {days}d</span>
  return <span style={{ background: '#e7f3ea', color: C.green, fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>OK — {days}d</span>
}

export function RenewalsModule() {
  const { db, save } = useBgtsDb()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string|null>(null)
  const [filter, setFilter] = useState<'all'|'urgent'|'expired'>('all')
  const [f, setF] = useState<Partial<BgtsRenewal>>({})

  const renewals = db.renewals || []
  const filtered = renewals.filter(r => {
    const d = r.expiryDate ? daysTo(r.expiryDate) : null
    if (filter === 'urgent') return d !== null && d >= 0 && d <= 30
    if (filter === 'expired') return d !== null && d < 0
    return true
  }).sort((a, b) => (a.expiryDate || '') < (b.expiryDate || '') ? -1 : 1)

  const openNew = () => {
    setEditId(null)
    setF({ vehicleRegNo: '', docType: DOC_TYPES[0], issueDate: '', expiryDate: '', amount: 0, insurer: '', notes: '', reminder: 30 })
    setShowForm(true)
  }
  const openEdit = (id: string) => {
    const r = renewals.find(x=>x.id===id); if(!r) return
    setEditId(id); setF({...r}); setShowForm(true)
  }
  const saveR = () => {
    if (!f.vehicleRegNo?.trim() || !f.docType?.trim() || !f.expiryDate) { alert('Vehicle, Doc Type, and Expiry are required.'); return }
    const d = { ...db }
    const rec: BgtsRenewal = { id: editId||uid('rn'), vehicleRegNo: f.vehicleRegNo||'', docType: f.docType||'', issueDate: f.issueDate||'', expiryDate: f.expiryDate||'', amount: Number(f.amount)||0, insurer: f.insurer||'', notes: f.notes||'', reminder: Number(f.reminder)||30 }
    if (editId) { const i = d.renewals.findIndex(x=>x.id===editId); if(i>=0) d.renewals[i]=rec } else d.renewals.push(rec)
    save(d); setShowForm(false)
  }
  const del = (id: string) => { if(!confirm('Delete?')) return; const d={...db}; d.renewals=d.renewals.filter(r=>r.id!==id); save(d) }

  const expired = renewals.filter(r => r.expiryDate && (daysTo(r.expiryDate) ?? 0) < 0).length
  const urgent  = renewals.filter(r => { const d = r.expiryDate ? daysTo(r.expiryDate) : null; return d!==null && d>=0 && d<=30 }).length

  return (
    <div style={{ padding: '20px 28px' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        {[['all','All',String(renewals.length)],['urgent','Urgent (≤30d)',String(urgent)],['expired','Expired',String(expired)]].map(([v,l,c])=>(
          <button key={v} onClick={()=>setFilter(v as 'all'|'urgent'|'expired')}
            style={{ padding: '8px 16px', borderRadius: 7, border: '2px solid ' + (filter===v?C.amber:'#c7d0dc'), background: filter===v?'#fff8ee':'#fff', fontWeight: filter===v?700:400, cursor: 'pointer', fontSize: 12.5 }}>
            {l} <span style={{ background: filter===v?C.amber:'#eef1f5', color: filter===v?C.navy:C.slate500, borderRadius: 10, padding: '1px 7px', fontSize: 11, marginLeft: 4 }}>{c}</span>
          </button>
        ))}
        <span style={{ flex: 1 }} />
        <button style={{ ...btn, background: C.amber, color: C.navy }} onClick={openNew}>+ Add Document</button>
      </div>

      {showForm && (
        <div style={{ ...card, border: '2px solid ' + C.amber, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 12 }}>{editId?'Edit Document':'New Document'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={lbl}>Vehicle Reg No</label>
              <input style={inp} list="vlist" value={f.vehicleRegNo||''} onChange={e=>setF(p=>({...p,vehicleRegNo:e.target.value}))} />
              <datalist id="vlist">{db.vehicles.map(v=><option key={v.id} value={v.regNo}/>)}</datalist>
            </div>
            <div><label style={lbl}>Document Type</label>
              <select style={inp} value={f.docType||DOC_TYPES[0]} onChange={e=>setF(p=>({...p,docType:e.target.value}))}>
                {DOC_TYPES.map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Issue Date</label><input style={inp} type="date" value={f.issueDate||''} onChange={e=>setF(p=>({...p,issueDate:e.target.value}))} /></div>
            <div><label style={lbl}>Expiry Date *</label><input style={inp} type="date" value={f.expiryDate||''} onChange={e=>setF(p=>({...p,expiryDate:e.target.value}))} /></div>
            <div><label style={lbl}>Premium / Amount (₹)</label><input style={inp} type="number" value={f.amount||''} onChange={e=>setF(p=>({...p,amount:Number(e.target.value)}))} /></div>
            <div><label style={lbl}>Insurer / Authority</label><input style={inp} value={f.insurer||''} onChange={e=>setF(p=>({...p,insurer:e.target.value}))} /></div>
            <div><label style={lbl}>Reminder (days before)</label><input style={inp} type="number" value={f.reminder||30} onChange={e=>setF(p=>({...p,reminder:Number(e.target.value)}))} /></div>
            <div><label style={lbl}>Notes</label><input style={inp} value={f.notes||''} onChange={e=>setF(p=>({...p,notes:e.target.value}))} /></div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
            <button style={{ ...btn, background: 'transparent', color: C.navy, border: '1px solid #c7d0dc' }} onClick={()=>setShowForm(false)}>Cancel</button>
            <button style={btn} onClick={saveR}>Save</button>
          </div>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={tbl}>
          <thead><tr>
            <th style={th}>Vehicle</th><th style={th}>Document</th><th style={th}>Issue Date</th>
            <th style={th}>Expiry</th><th style={th}>Status</th><th style={th}>Amount</th><th style={th}>Insurer</th><th style={th}>Notes</th><th style={th}></th>
          </tr></thead>
          <tbody>{filtered.map(r => {
            const d = r.expiryDate ? daysTo(r.expiryDate) : null
            return (
              <tr key={r.id}>
                <td style={td}><b>{r.vehicleRegNo}</b></td>
                <td style={td}>{r.docType}</td>
                <td style={td}>{fmtDate(r.issueDate)}</td>
                <td style={{ ...td, fontWeight: 700, color: d !== null && d < 0 ? C.red : d !== null && d <= 30 ? '#b45309' : undefined }}>{fmtDate(r.expiryDate)}</td>
                <td style={td}>{statusBadge(d)}</td>
                <td style={td}>{r.amount ? `₹${r.amount.toLocaleString('en-IN')}` : '—'}</td>
                <td style={td}>{r.insurer||'—'}</td>
                <td style={td}>{r.notes||'—'}</td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>
                  <button style={btnSm(C.navy)} onClick={()=>openEdit(r.id)}>Edit</button>{' '}
                  <button style={btnSm()} onClick={()=>del(r.id)}>✕</button>
                </td>
              </tr>
            )
          })}</tbody>
        </table>
      </div>
    </div>
  )
}
