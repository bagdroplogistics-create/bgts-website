'use client'
import { useState } from 'react'
import { useBgtsDb, loadDB } from '@/lib/useBgtsDb'
import type { BgtsCompany, BgtsBranch } from '@/lib/useBgtsDb'

const C = { navy: '#0a1f38', amber: '#e8a33d', green: '#1e8a5f', red: '#c14343', slate300: '#c7d0dc', slate500: '#6b7a8f' }
const card: React.CSSProperties = { background: '#fff', border: '1px solid #eef1f5', borderRadius: 10, padding: '18px 20px', marginBottom: 16, boxShadow: '0 1px 3px rgba(15,43,77,.05)' }
const inp: React.CSSProperties = { width: '100%', padding: '7px 10px', border: '1px solid #c7d0dc', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }
const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: C.slate500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.3px' }
const btn = (bg = C.navy, col = '#fff'): React.CSSProperties => ({ display: 'inline-flex', alignItems: 'center', gap: 4, background: bg, color: col, border: 'none', borderRadius: 7, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' })
const btnSm = (bg = C.red): React.CSSProperties => ({ background: bg, color: '#fff', border: 'none', borderRadius: 5, padding: '4px 9px', fontSize: 11, fontWeight: 600, cursor: 'pointer' })

function CompanySettings() {
  const { db, save } = useBgtsDb()
  const [f, setF] = useState<BgtsCompany>({ ...db.company })
  const [saved, setSaved] = useState(false)
  const saveIt = () => { const d={...db,company:f}; save(d); setSaved(true); setTimeout(()=>setSaved(false),2000) }
  const fi = (k: keyof BgtsCompany, label: string) => (
    <div><label style={lbl}>{label}</label><input style={inp} value={f[k]||''} onChange={e=>setF(p=>({...p,[k]:e.target.value}))} /></div>
  )
  return (
    <div style={card}>
      <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 12 }}>Company Profile</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {fi('name','Company Name')}{fi('gstin','GSTIN')}
        {fi('pan','PAN')}{fi('phone','Phone')}
        {fi('email','Email')}{fi('lrPrefix','LR No Prefix')}
        <div style={{ gridColumn:'1/-1' }}>{fi('addr','Address')}</div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
        <button style={btn()} onClick={saveIt}>Save Company</button>
        {saved && <span style={{ color: C.green, fontSize: 13, fontWeight: 600 }}>✓ Saved</span>}
      </div>
    </div>
  )
}

function BranchSettings() {
  const { db, save } = useBgtsDb()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string|null>(null)
  const [f, setF] = useState<Partial<BgtsBranch>>({})

  const openNew = () => {
    setEditId(null)
    setF({ name:'', entityName:'', gstin:'', pan:'', phone:'', email:'', addr:'' })
    setShowForm(true)
  }
  const openEdit = (id: string) => {
    const b = db.branches.find(x=>x.id===id); if(!b) return
    setEditId(id); setF({...b}); setShowForm(true)
  }
  const saveB = () => {
    if (!f.name?.trim()) { alert('Branch name is required.'); return }
    const d = { ...db }
    const rec: BgtsBranch = { id: editId||('br_'+Date.now()), name:f.name||'', entityName:f.entityName||'', gstin:f.gstin||'', pan:f.pan||'', phone:f.phone||'', email:f.email||'', addr:f.addr||'' }
    if (editId) { const i=d.branches.findIndex(x=>x.id===editId); if(i>=0) d.branches[i]=rec } else d.branches.push(rec)
    save(d); setShowForm(false)
  }
  const del = (id: string) => { if(!confirm('Delete branch?')) return; const d={...db}; d.branches=d.branches.filter(b=>b.id!==id); save(d) }

  const fi = (k: keyof BgtsBranch, label: string) => (
    <div><label style={lbl}>{label}</label><input style={inp} value={f[k]||''} onChange={e=>setF(p=>({...p,[k]:e.target.value}))} /></div>
  )

  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: C.navy, flex: 1 }}>Branches</span>
        <button style={btn(C.amber, C.navy)} onClick={openNew}>+ Add Branch</button>
      </div>

      {showForm && (
        <div style={{ border: '2px solid ' + C.amber, borderRadius: 8, padding: 14, marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {fi('name','Branch Name *')}{fi('entityName','Entity / Legal Name')}
            {fi('gstin','GSTIN')}{fi('pan','PAN')}
            {fi('phone','Phone')}{fi('email','Email')}
            <div style={{ gridColumn:'1/-1' }}>{fi('addr','Address')}</div>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:12, justifyContent:'flex-end' }}>
            <button style={btn('transparent', C.navy)} onClick={()=>setShowForm(false)}>Cancel</button>
            <button style={btn()} onClick={saveB}>Save Branch</button>
          </div>
        </div>
      )}

      {db.branches.map(b => (
        <div key={b.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:'1px solid #eef1f5' }}>
          <div style={{ flex:1 }}>
            <b style={{ color:C.navy }}>{b.name}</b>
            {b.entityName && <span style={{ fontSize:12, color:C.slate500, marginLeft:8 }}>{b.entityName}</span>}
            <div style={{ fontSize:11, color:C.slate500 }}>{b.gstin||''}{b.gstin&&b.phone?' · ':''}{b.phone||''}</div>
          </div>
          <button style={btnSm(C.navy)} onClick={()=>openEdit(b.id)}>Edit</button>
          <button style={btnSm()} onClick={()=>del(b.id)}>✕</button>
        </div>
      ))}
    </div>
  )
}

function BackupRestore() {
  const { db, save } = useBgtsDb()
  const [msg, setMsg] = useState('')

  const exportDB = () => {
    const json = JSON.stringify(db, null, 2)
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([json],{type:'application/json'})); a.download = 'BGTS_DB_Backup_' + new Date().toISOString().slice(0,10) + '.json'; a.click()
    setMsg('Backup downloaded.')
  }

  const importDB = () => {
    const input = document.createElement('input'); input.type='file'; input.accept='.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]; if(!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string)
          if (!parsed.lrs || !parsed.invoices) { setMsg('⚠ Invalid backup file.'); return }
          if (!confirm('This will REPLACE all current data with the backup. Are you sure?')) return
          save(parsed); setMsg('✓ Restore complete.')
        } catch { setMsg('⚠ Failed to parse JSON.') }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const clearDB = () => {
    if (!confirm('⚠ This will DELETE all BGTS-OS data. This cannot be undone. Type "DELETE" to confirm.')) return
    const conf = prompt('Type DELETE to confirm:')
    if (conf !== 'DELETE') return
    localStorage.removeItem('bgts_os_db')
    setMsg('Database cleared. Reload the page.')
  }

  return (
    <div style={card}>
      <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 12 }}>Backup & Restore</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <button style={btn(C.green)} onClick={exportDB}>⬇ Export Full Backup (JSON)</button>
        <button style={btn(C.amber, C.navy)} onClick={importDB}>⬆ Restore from Backup</button>
        <button style={btn(C.red)} onClick={clearDB}>⚠ Clear Database</button>
      </div>
      {msg && <div style={{ fontSize: 13, color: msg.startsWith('✓')?C.green:C.red, fontWeight: 600 }}>{msg}</div>}
      <div style={{ fontSize: 12, color: C.slate500, marginTop: 8 }}>
        Database key: <code>bgts_os_db</code> (same as the HTML app — data is shared between both interfaces).<br/>
        LRs: {db.lrs.length} · Invoices: {db.invoices.length} · Payments: {db.payments.length} · Expenses: {db.acctExp.length} · Vehicles: {db.vehicles.length}
      </div>
    </div>
  )
}

type SubTab = 'company' | 'branches' | 'backup'
const TABS: { id: SubTab; label: string }[] = [
  { id: 'company',  label: 'Company Profile' },
  { id: 'branches', label: 'Branches'        },
  { id: 'backup',   label: 'Backup & Restore'},
]

export function SettingsModule() {
  const [sub, setSub] = useState<SubTab>('company')
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
      <div style={{ padding: '20px 28px' }}>
        {sub === 'company'  && <CompanySettings />}
        {sub === 'branches' && <BranchSettings />}
        {sub === 'backup'   && <BackupRestore />}
      </div>
    </div>
  )
}
