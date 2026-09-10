'use client'
import { useState } from 'react'
import { useBgtsDb, uid, todayISO, fmtDate, money } from '@/lib/useBgtsDb'
import type { BgtsContract } from '@/lib/useBgtsDb'

const C = { navy: '#0a1f38', amber: '#e8a33d', green: '#1e8a5f', red: '#c14343', slate300: '#c7d0dc', slate500: '#6b7a8f' }
const card: React.CSSProperties = { background: '#fff', border: '1px solid #eef1f5', borderRadius: 10, padding: '18px 20px', marginBottom: 16, boxShadow: '0 1px 3px rgba(15,43,77,.05)' }
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }
const th: React.CSSProperties = { background: C.navy, color: '#fff', textAlign: 'left', padding: '8px 10px', fontSize: 11, letterSpacing: '.4px', textTransform: 'uppercase', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid #eef1f5', verticalAlign: 'top' }
const inp: React.CSSProperties = { width: '100%', padding: '7px 10px', border: '1px solid #c7d0dc', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }
const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: C.slate500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.3px' }
const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 4, background: C.navy, color: '#fff', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }
const btnSm = (bg = C.red): React.CSSProperties => ({ display: 'inline-flex', background: bg, color: '#fff', border: 'none', borderRadius: 5, padding: '4px 9px', fontSize: 11, fontWeight: 600, cursor: 'pointer' })

export function ContractsModule() {
  const { db, save } = useBgtsDb()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string|null>(null)
  const [expanded, setExpanded] = useState<string|null>(null)
  const [f, setF] = useState<Partial<BgtsContract>>({})

  const contracts = db.contracts || []

  const openNew = () => {
    setEditId(null)
    setF({ party: '', validFrom: todayISO(), validTo: '', status: 'Active', notes: '', rates: [] })
    setShowForm(true)
  }
  const openEdit = (id: string) => {
    const c = contracts.find(x=>x.id===id); if(!c) return
    setEditId(id); setF({...c, rates:[...(c.rates||[]).map(r=>({...r}))]}); setShowForm(true)
  }
  const saveC = () => {
    if (!f.party?.trim() || !f.validFrom) { alert('Party and Valid From are required.'); return }
    const d = { ...db }
    const rec: BgtsContract = { id: editId||uid('ct'), party: f.party||'', validFrom: f.validFrom||'', validTo: f.validTo||'', status: f.status||'Active', notes: f.notes||'', rates: f.rates||[] }
    if (editId) { const i = d.contracts.findIndex(x=>x.id===editId); if(i>=0) d.contracts[i]=rec } else d.contracts.push(rec)
    save(d); setShowForm(false)
  }
  const del = (id: string) => { if(!confirm('Delete contract?')) return; const d={...db}; d.contracts=d.contracts.filter(c=>c.id!==id); save(d) }

  const addRateLine = () => setF(prev => ({ ...prev, rates: [...(prev.rates||[]), { from: '', to: '', vehicleType: '', rate: 0, unit: 'per trip' }] }))
  const updRate = (i: number, k: string, v: string|number) => setF(prev => { const r=[...(prev.rates||[])]; (r[i] as Record<string,unknown>)[k]=v; return {...prev,rates:r} })
  const delRate = (i: number) => setF(prev => ({ ...prev, rates: (prev.rates||[]).filter((_,j)=>j!==i) }))

  return (
    <div style={{ padding: '20px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button style={{ ...btn, background: C.amber, color: C.navy }} onClick={openNew}>+ New Contract</button>
      </div>

      {showForm && (
        <div style={{ ...card, border: '2px solid ' + C.amber, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 12 }}>{editId?'Edit Contract':'New Contract'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div><label style={lbl}>Party / Customer *</label><input style={inp} value={f.party||''} onChange={e=>setF(p=>({...p,party:e.target.value}))} /></div>
            <div><label style={lbl}>Status</label>
              <select style={inp} value={f.status||'Active'} onChange={e=>setF(p=>({...p,status:e.target.value as BgtsContract['status']}))}>
                <option>Active</option><option>Expired</option><option>Suspended</option>
              </select>
            </div>
            <div><label style={lbl}>Valid From</label><input style={inp} type="date" value={f.validFrom||''} onChange={e=>setF(p=>({...p,validFrom:e.target.value}))} /></div>
            <div><label style={lbl}>Valid To</label><input style={inp} type="date" value={f.validTo||''} onChange={e=>setF(p=>({...p,validTo:e.target.value}))} /></div>
            <div style={{ gridColumn:'1/-1' }}><label style={lbl}>Notes</label><textarea style={{ ...inp, minHeight: 50 }} value={f.notes||''} onChange={e=>setF(p=>({...p,notes:e.target.value}))} /></div>
          </div>

          <div style={{ fontWeight: 700, fontSize: 13, color: C.navy, marginBottom: 8 }}>Rate Lines</div>
          {(f.rates||[]).map((r,i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8, background: C.slate300 + '33', borderRadius: 6, padding: '8px 10px' }}>
              <div><label style={lbl}>From</label><input style={inp} value={r.from} onChange={e=>updRate(i,'from',e.target.value)} /></div>
              <div><label style={lbl}>To</label><input style={inp} value={r.to} onChange={e=>updRate(i,'to',e.target.value)} /></div>
              <div><label style={lbl}>Vehicle Type</label><input style={inp} value={r.vehicleType} onChange={e=>updRate(i,'vehicleType',e.target.value)} /></div>
              <div><label style={lbl}>Rate (₹)</label><input style={inp} type="number" value={r.rate||''} onChange={e=>updRate(i,'rate',Number(e.target.value))} /></div>
              <div><label style={lbl}>Unit</label>
                <select style={inp} value={r.unit||'per trip'} onChange={e=>updRate(i,'unit',e.target.value)}>
                  <option>per trip</option><option>per ton</option><option>per km</option><option>per day</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}><button style={btnSm()} onClick={()=>delRate(i)}>✕</button></div>
            </div>
          ))}
          <button style={{ ...btnSm(C.amber), color: C.navy, marginBottom: 12 }} onClick={addRateLine}>+ Add Rate Line</button>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button style={{ ...btn, background: 'transparent', color: C.navy, border: '1px solid #c7d0dc' }} onClick={()=>setShowForm(false)}>Cancel</button>
            <button style={btn} onClick={saveC}>Save Contract</button>
          </div>
        </div>
      )}

      {contracts.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: C.slate500 }}>No contracts yet. Add your first contract above.</div>
      ) : (
        <div>
          {contracts.sort((a,b)=>a.validFrom<b.validFrom?1:-1).map(c => {
            const isExp = expanded === c.id
            return (
              <div key={c.id} style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <b style={{ fontSize: 14, color: C.navy }}>{c.party}</b>
                    <span style={{ marginLeft: 10, background: c.status==='Active'?'#e7f3ea':c.status==='Expired'?'#fdeaea':'#fef3c7', color: c.status==='Active'?C.green:c.status==='Expired'?C.red:'#b45309', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 4 }}>{c.status}</span>
                    <div style={{ fontSize: 12, color: C.slate500, marginTop: 3 }}>Valid: {fmtDate(c.validFrom)} → {c.validTo ? fmtDate(c.validTo) : 'Open-ended'} · {c.rates?.length||0} rate lines</div>
                  </div>
                  <button style={btnSm(C.navy)} onClick={()=>setExpanded(isExp?null:c.id)}>{isExp?'Collapse':'View Rates'}</button>
                  <button style={btnSm(C.amber.replace('#','') === 'e8a33d' ? C.amber : '#666')} onClick={()=>openEdit(c.id)} >Edit</button>
                  <button style={btnSm()} onClick={()=>del(c.id)}>✕</button>
                </div>
                {c.notes && <div style={{ fontSize: 12, color: C.slate500, marginTop: 8, fontStyle: 'italic' }}>{c.notes}</div>}
                {isExp && c.rates && c.rates.length > 0 && (
                  <div style={{ marginTop: 12, overflowX: 'auto' }}>
                    <table style={tbl}>
                      <thead><tr><th style={th}>From</th><th style={th}>To</th><th style={th}>Vehicle Type</th><th style={th}>Rate</th><th style={th}>Unit</th></tr></thead>
                      <tbody>{c.rates.map((r,i)=>(
                        <tr key={i}><td style={td}>{r.from||'—'}</td><td style={td}>{r.to||'—'}</td><td style={td}>{r.vehicleType||'—'}</td>
                          <td style={{ ...td, fontWeight: 700 }}>{money(r.rate)}</td><td style={td}>{r.unit}</td></tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
