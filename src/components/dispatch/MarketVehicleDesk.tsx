'use client'

import { useState, useEffect, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface MvdAgent {
  id: string
  company_name: string
  contact_person: string | null
  mobile: string
  city: string
  state: string | null
  fleet_type: string
  vehicle_types: string[]
  routes_covered: string[]
  grade: string
  reliability_score: number
  status: string
  is_self_registered: boolean
  notes: string | null
  created_at: string
}

interface SearchMeta {
  from_city: string
  to_city: string
  vehicle_type: string
  agent_type: string
  region: string
  total: number
}

// ── Constants ─────────────────────────────────────────────────────────────────
const VEHICLE_TYPES = [
  'Any / All Types',
  'LCV / Pickup',
  'Taurus (22–24 ft)',
  'Open Truck / Dala',
  'Container',
  'Trailer / Flatbed',
  'ODC / Heavy Lift / Low Bed',
  'Crane',
  'Tanker',
  'Packers & Movers',
]

const AGENT_TYPES = [
  { value: 'ALL',                  label: 'All Types' },
  { value: 'BROKER',               label: 'Broker' },
  { value: 'FLEET_OWNER',          label: 'Fleet Owner' },
  { value: 'FLEET_OWNER_BROKER',   label: 'Fleet Owner / Broker' },
]

const REGIONS = [
  'Gujarat', 'Maharashtra', 'North India', 'South India', 'East India',
  'Rajasthan', 'Madhya Pradesh', 'Uttar Pradesh', 'Goa', 'Chhattisgarh',
  'North East', 'J&K', 'PAN India',
]

const ROUTE_VEHICLE_OPTIONS = [
  'LCV / Pickup', 'Taurus (22–24 ft)', 'Open Truck / Dala', 'Container',
  'Trailer / Flatbed', 'ODC / Heavy Lift / Low Bed', 'Crane', 'Tanker', 'Packers & Movers',
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function gradeBadge(grade: string) {
  const colors: Record<string, string> = {
    A: 'bg-green-100 text-green-800',
    B: 'bg-blue-100 text-blue-800',
    C: 'bg-yellow-100 text-yellow-800',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${colors[grade] ?? 'bg-gray-100 text-gray-700'}`}>
      {grade}
    </span>
  )
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    NEW:      'bg-yellow-100 text-yellow-800',
    VERIFIED: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-red-100 text-red-800',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

function buildMessages(
  from_city: string,
  to_city: string,
  vehicle_type: string,
  material_type: string,
  pickup_date: string,
  agent: MvdAgent,
  language: string,
): { en: string; hi: string; gu: string } {
  const agentName  = agent.contact_person || agent.company_name
  const dateStr    = pickup_date || 'to be confirmed'
  const materialStr = material_type || 'general cargo'
  const fleetLabel = agent.fleet_type === 'FLEET_OWNER' ? 'Fleet Owner' : agent.fleet_type === 'BROKER' ? 'Broker' : 'Transporter'

  const en = `Dear ${agentName} (${fleetLabel}),\n\nWe have a transport requirement and would like your quote:\n\nRoute: ${from_city} → ${to_city}\nVehicle: ${vehicle_type}\nMaterial: ${materialStr}\nPickup Date: ${dateStr}\n\nKindly share your best rate for this movement at the earliest.\n\nThanks & Regards,\nBGTS Transport\n+91-XXXXXXXXXX`

  const hi = `प्रिय ${agentName} जी,\n\nहमें निम्न ट्रांसपोर्ट की आवश्यकता है। कृपया अपना सबसे अच्छा रेट बताएं:\n\nरूट: ${from_city} → ${to_city}\nवाहन: ${vehicle_type}\nमाल: ${materialStr}\nपिकअप तारीख: ${dateStr}\n\nधन्यवाद,\nBGTS Transport`

  const gu = `પ્રિય ${agentName} સાહેબ,\n\nઅમને નીચેની ટ્રાન્સપોર્ટ જરૂરી છે. કૃપા કરીને આપનો શ્રેષ્ઠ ભાવ જણાવો:\n\nરૂટ: ${from_city} → ${to_city}\nવાહન: ${vehicle_type}\nમાલ: ${materialStr}\nપિકઅપ તારીખ: ${dateStr}\n\nઆભાર,\nBGTS Transport`

  return { en, hi, gu }
}

// ── Sub-tab 00: Process Flow ──────────────────────────────────────────────────
function ProcessFlow() {
  const steps = [
    { n: '1', title: 'Inquiry received — Sales / BD', desc: 'From location, To location, vehicle type, material type (and ideally tonnage + pickup date) come in from Sales/BD as a fresh company inquiry.', tag: 'INPUT: route + vehicle + material' },
    { n: '2', title: 'Ops opens the Agent Console', desc: 'Operations enters the inquiry into the "Find Agent" search panel — From, To, Vehicle Type, Material.', tag: 'SCREEN: Find Agent (Ops)' },
    { n: '3', title: 'System resolves route → region', desc: '"To" city is matched against the Route Matrix (e.g. Chennai → South India). If the city isn\'t on the matrix, it falls back through the City Master\'s state/zone mapping.', tag: 'DATA: Route Matrix + City Master' },
    { n: '4', title: 'Database search — region + vehicle match', desc: 'Every agent whose Routes cover that region and whose Vehicle Types match the request is pulled from the Master Directory and ranked by Grade / Reliability Score.', tag: 'SOURCE: Master Directory' },
    { n: '5', title: 'Ranked agent list returned to Ops', desc: 'Company name, contact person, mobile number(s), city, Owned/Broker status, reliability grade — ready to call, with a tap-to-dial link.', tag: 'OUTPUT: contact list' },
    { n: '6', title: 'Inquiry message generated & sent', desc: 'Ops selects agents and the console drafts a ready inquiry message (route, vehicle, material, pickup window) per agent — same inquiry data, no retyping. Ops copies/sends it on WhatsApp or SMS.', tag: 'ACTION: generate + copy outreach message' },
    { n: '7', title: 'Quotes return → MVD Rate Sheet', desc: 'Agent responses are logged into the Rate Comparison Sheet (Owned Fleet vs Empanelled Vendor vs Market Agents, min. 3 quotes) for margin-gated allocation. That comparison/decision step stays the MVD analyst\'s job — outside this console.', tag: 'HANDOFF: MVD allocation decision → OPS dispatch' },
  ]
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 0' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>Inquiry → Allocation Flow</h2>
        <p style={{ color: '#666', fontSize: 14 }}>This is the path an inbound company inquiry takes through MVD — from Sales/BD raising it, to Operations finding and messaging the right agent, to the agent base growing on its own through self-registration.</p>
      </div>

      <div style={{ position: 'relative' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#c45c28', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15 }}>{s.n}</div>
              {i < steps.length - 1 && <div style={{ width: 2, flex: 1, background: '#e5e7eb', marginTop: 4, marginBottom: 0, minHeight: 20 }} />}
            </div>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 18px', marginBottom: i < steps.length - 1 ? 8 : 0, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a', marginBottom: 4 }}>{s.title}</div>
              <div style={{ color: '#555', fontSize: 13, marginBottom: 8 }}>{s.desc}</div>
              <span style={{ background: '#f3efe8', color: '#c45c28', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20 }}>{s.tag}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, background: '#f9f9f9', border: '1px dashed #c45c28', borderRadius: 10, padding: '16px 20px' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#c45c28', marginBottom: 6 }}>Parallel feed — Agent self-registration</div>
        <p style={{ color: '#555', fontSize: 13, margin: 0 }}>Independently of any single inquiry, agents register themselves through the Agent Portal — company, contact, mobile, city, vehicle types, routes covered. New registrations enter the same searchable pool immediately, tagged NEW until reviewed, growing the database without manual data entry.</p>
        <div style={{ marginTop: 8 }}>
          <span style={{ background: '#f3efe8', color: '#c45c28', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20 }}>SCREEN: Agent Portal → feeds back into Step 4</span>
        </div>
      </div>
    </div>
  )
}

// ── Sub-tab 01: Find Agent ────────────────────────────────────────────────────
function FindAgent() {
  const [form, setForm] = useState({
    from_city: '',
    to_city: '',
    vehicle_type: 'Any / All Types',
    agent_type: 'ALL',
    material_type: '',
    pickup_date: '',
    name_search: '',
    language: 'en',
  })
  const [loading, setLoading]   = useState(false)
  const [agents, setAgents]     = useState<MvdAgent[]>([])
  const [meta, setMeta]         = useState<SearchMeta | null>(null)
  const [searched, setSearched] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [messages, setMessages] = useState<{ agent: MvdAgent; en: string; hi: string; gu: string }[]>([])
  const [msgGenerated, setMsgGenerated] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [copyStates, setCopyStates] = useState<Record<string, boolean>>({})

  const handleSearch = async () => {
    setLoading(true)
    setSearched(false)
    setSelected(new Set())
    setMessages([])
    setMsgGenerated(false)
    try {
      const res = await fetch('/api/dispatch/mvd/agents/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_city:    form.from_city,
          to_city:      form.to_city,
          vehicle_type: form.vehicle_type === 'Any / All Types' ? 'ALL' : form.vehicle_type,
          agent_type:   form.agent_type,
          name_search:  form.name_search,
        }),
      })
      const json = await res.json()
      setAgents(json.data ?? [])
      setMeta(json.meta ?? null)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAll = () => {
    setSelected(new Set(agents.map(a => a.id)))
  }

  const generateMessages = async () => {
    const selectedAgents = agents.filter(a => selected.has(a.id))
    const msgs = selectedAgents.map(a => ({
      agent: a,
      ...buildMessages(form.from_city, form.to_city, form.vehicle_type, form.material_type, form.pickup_date, a, form.language),
    }))
    setMessages(msgs)
    setMsgGenerated(true)

    // Save inquiry to DB
    setSaving(true)
    try {
      const { en, hi, gu } = msgs[0] ?? { en: '', hi: '', gu: '' }
      await fetch('/api/dispatch/mvd/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_city:    form.from_city,
          to_city:      form.to_city,
          vehicle_type: form.vehicle_type,
          material_type: form.material_type || null,
          pickup_date:  form.pickup_date || null,
          agent_ids:    selectedAgents.map(a => a.id),
          message_en:   en,
          message_hi:   hi,
          message_gu:   gu,
        }),
      })
    } catch (e) {
      console.error('Failed to save inquiry:', e)
    } finally {
      setSaving(false)
    }
  }

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopyStates(prev => ({ ...prev, [key]: true }))
    setTimeout(() => setCopyStates(prev => ({ ...prev, [key]: false })), 1800)
  }

  const getLangText = (msg: { en: string; hi: string; gu: string }) => {
    if (form.language === 'en') return { texts: [{ label: 'English', text: msg.en }] }
    if (form.language === 'hi') return { texts: [{ label: 'Hindi', text: msg.hi }] }
    if (form.language === 'gu') return { texts: [{ label: 'Gujarati', text: msg.gu }] }
    return { texts: [{ label: 'English', text: msg.en }, { label: 'Hindi', text: msg.hi }, { label: 'Gujarati', text: msg.gu }] }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 0' }}>
      {/* Search panel */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 24px', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1a1a1a' }}>Find Agent — for an inbound inquiry</h3>
        <p style={{ color: '#888', fontSize: 12, marginTop: -12, marginBottom: 16 }}>Enter the route and vehicle type from the inquiry. Region matching is approximate — always confirm exact lane coverage with the agent before allocating.</p>

        {/* Name search */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Search by company / agent name (optional)</label>
          <input
            value={form.name_search}
            onChange={e => setForm(p => ({ ...p, name_search: e.target.value }))}
            placeholder="Type company name or contact person..."
            style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 14, boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>From (origin city)</label>
            <input
              value={form.from_city}
              onChange={e => setForm(p => ({ ...p, from_city: e.target.value }))}
              placeholder="e.g. Ahmedabad"
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>To (destination city)</label>
            <input
              value={form.to_city}
              onChange={e => setForm(p => ({ ...p, to_city: e.target.value }))}
              placeholder="e.g. Mumbai"
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Vehicle type required</label>
            <select
              value={form.vehicle_type}
              onChange={e => setForm(p => ({ ...p, vehicle_type: e.target.value }))}
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 14, background: '#fff', boxSizing: 'border-box' }}
            >
              {VEHICLE_TYPES.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Agent type</label>
            <select
              value={form.agent_type}
              onChange={e => setForm(p => ({ ...p, agent_type: e.target.value }))}
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 14, background: '#fff', boxSizing: 'border-box' }}
            >
              {AGENT_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Material type (for outreach message)</label>
            <input
              value={form.material_type}
              onChange={e => setForm(p => ({ ...p, material_type: e.target.value }))}
              placeholder="e.g. Industrial Materials, Pharma, FMCG..."
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Pickup date (optional)</label>
            <input
              type="date"
              value={form.pickup_date}
              onChange={e => setForm(p => ({ ...p, pickup_date: e.target.value }))}
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Message language</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { v: 'en', l: 'English' },
              { v: 'hi', l: 'Hindi (हिंदी)' },
              { v: 'gu', l: 'Gujarati (ગુજરાતી)' },
              { v: 'all', l: 'All three' },
            ].map(({ v, l }) => (
              <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                <input type="radio" name="lang" value={v} checked={form.language === v} onChange={() => setForm(p => ({ ...p, language: v }))} />
                {l}
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          style={{ background: loading ? '#999' : '#c45c28', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 28px', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Searching…' : 'Search Agents'}
        </button>
      </div>

      {/* Results */}
      {searched && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{agents.length} agent{agents.length !== 1 ? 's' : ''} found</span>
              {meta && <span style={{ color: '#888', fontSize: 12, marginLeft: 10 }}>Region resolved: <strong>{meta.region}</strong></span>}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {agents.length > 0 && (
                <button onClick={selectAll} style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>
                  Select all shown
                </button>
              )}
              <span style={{ fontSize: 12, color: '#666' }}><strong>{selected.size}</strong> agent(s) selected</span>
              {selected.size > 0 && (
                <button
                  onClick={generateMessages}
                  style={{ background: '#c45c28', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                >
                  Generate inquiry messages →
                </button>
              )}
            </div>
          </div>

          {agents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#888' }}>
              No agents found for this route/vehicle combination. Try broadening your search or adding more agents via the Agent Portal.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#555' }}></th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#555' }}>Company</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#555' }}>Contact</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#555' }}>Mobile</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#555' }}>City</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#555' }}>Type</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#555' }}>Grade</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#555' }}>Score</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#555' }}>Status</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#555' }}>Routes</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((a, idx) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #f0f0f0', background: selected.has(a.id) ? '#fef7f3' : idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '8px 10px' }}>
                        <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)} style={{ cursor: 'pointer' }} />
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>{a.company_name}</td>
                      <td style={{ padding: '8px 10px', color: '#555' }}>{a.contact_person || '—'}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <a href={`tel:${a.mobile}`} style={{ color: '#c45c28', fontWeight: 600, textDecoration: 'none' }}>{a.mobile}</a>
                      </td>
                      <td style={{ padding: '8px 10px', color: '#555' }}>{a.city}{a.state ? `, ${a.state}` : ''}</td>
                      <td style={{ padding: '8px 10px', color: '#555', fontSize: 12 }}>{a.fleet_type.replace('_', ' ')}</td>
                      <td style={{ padding: '8px 10px' }}>{gradeBadge(a.grade)}</td>
                      <td style={{ padding: '8px 10px', color: '#555' }}>{a.reliability_score}</td>
                      <td style={{ padding: '8px 10px' }}>{statusBadge(a.status)}</td>
                      <td style={{ padding: '8px 10px', color: '#555', fontSize: 11 }}>{(a.routes_covered ?? []).join(', ') || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Generated messages */}
      {msgGenerated && messages.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 24px' }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Inquiry Messages — Ready to Send</div>
          {saving && <div style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>Saving inquiry to database…</div>}
          {messages.map((m, i) => {
            const { texts } = getLangText(m)
            return (
              <div key={m.agent.id} style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: '14px 16px', marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: '#1a1a1a' }}>
                  #{i + 1} — {m.agent.company_name} · {m.agent.mobile}
                </div>
                {texts.map(({ label, text }) => (
                  <div key={label} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>{label}</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => copyText(`${m.agent.id}-${label}`, text)}
                          style={{ background: copyStates[`${m.agent.id}-${label}`] ? '#16a34a' : '#f3f4f6', color: copyStates[`${m.agent.id}-${label}`] ? '#fff' : '#374151', border: '1px solid #d1d5db', borderRadius: 5, padding: '3px 12px', fontSize: 11, cursor: 'pointer' }}
                        >
                          {copyStates[`${m.agent.id}-${label}`] ? '✓ Copied' : 'Copy'}
                        </button>
                        <a
                          href={`https://wa.me/${m.agent.mobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ background: '#25d366', color: '#fff', border: 'none', borderRadius: 5, padding: '3px 12px', fontSize: 11, textDecoration: 'none', display: 'inline-block' }}
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                    <pre style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, fontFamily: 'inherit' }}>{text}</pre>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Sub-tab 02: Agent Portal ──────────────────────────────────────────────────
function AgentPortal() {
  const [form, setForm] = useState({
    company_name: '',
    contact_person: '',
    mobile: '',
    city: '',
    state: '',
    fleet_type: 'BROKER',
    vehicle_types: [] as string[],
    routes_covered: [] as string[],
  })
  const [saving, setSaving]       = useState(false)
  const [saveMsg, setSaveMsg]     = useState('')
  const [saveErr, setSaveErr]     = useState('')

  const [lookupMobile, setLookupMobile] = useState('')
  const [lookupResult, setLookupResult] = useState<MvdAgent | null>(null)
  const [lookupErr, setLookupErr]       = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)

  const [recentAgents, setRecentAgents] = useState<MvdAgent[]>([])

  const loadRecent = useCallback(async () => {
    try {
      const res  = await fetch('/api/dispatch/mvd/agents?status=NEW')
      const json = await res.json()
      setRecentAgents((json.data ?? []).slice(0, 10))
    } catch { /* silent */ }
  }, [])

  useEffect(() => { loadRecent() }, [loadRecent])

  const toggleVehicle = (v: string) => {
    setForm(p => ({
      ...p,
      vehicle_types: p.vehicle_types.includes(v)
        ? p.vehicle_types.filter(x => x !== v)
        : [...p.vehicle_types, v],
    }))
  }

  const toggleRoute = (r: string) => {
    setForm(p => ({
      ...p,
      routes_covered: p.routes_covered.includes(r)
        ? p.routes_covered.filter(x => x !== r)
        : [...p.routes_covered, r],
    }))
  }

  const handleRegister = async () => {
    if (!form.company_name.trim() || !form.mobile.trim() || !form.city.trim()) {
      setSaveErr('Company name, mobile and city are required.')
      return
    }
    setSaving(true); setSaveErr(''); setSaveMsg('')
    try {
      const res  = await fetch('/api/dispatch/mvd/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setSaveMsg(json.isUpdate ? 'Listing updated successfully.' : 'Registration successful! You are now in the BGTS search pool.')
      if (!json.isUpdate) {
        setForm({ company_name: '', contact_person: '', mobile: '', city: '', state: '', fleet_type: 'BROKER', vehicle_types: [], routes_covered: [] })
      }
      loadRecent()
    } catch (e: unknown) {
      setSaveErr(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  const handleLookup = async () => {
    if (!lookupMobile.trim()) return
    setLookupLoading(true); setLookupErr(''); setLookupResult(null)
    try {
      const res  = await fetch(`/api/dispatch/mvd/agents/mobile/${encodeURIComponent(lookupMobile.trim())}`)
      const json = await res.json()
      if (json.error) { setLookupErr(json.error); return }
      setLookupResult(json.data)
    } catch (e: unknown) {
      setLookupErr(String(e))
    } finally {
      setLookupLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '20px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

        {/* Registration form */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 24px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: '#1a1a1a' }}>Register / Update your listing</h3>
          <p style={{ color: '#888', fontSize: 12, marginBottom: 16 }}>Self-service registration. Registering adds you to the BGTS search pool for matching inquiries on your route and vehicle type.</p>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Company / Transporter name *</label>
            <input value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))} placeholder="ABC Transport Co." style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Contact person</label>
            <input value={form.contact_person} onChange={e => setForm(p => ({ ...p, contact_person: e.target.value }))} placeholder="Ramesh Patel" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Mobile number (used as your ID) *</label>
            <input value={form.mobile} onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))} placeholder="9876543210" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>City / Base location *</label>
              <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Ahmedabad" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>State</label>
              <input value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} placeholder="Gujarat" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Fleet type</label>
            <div style={{ display: 'flex', gap: 16 }}>
              {[['FLEET_OWNER','Fleet Owner'],['BROKER','Broker'],['FLEET_OWNER_BROKER','Fleet Owner / Broker']].map(([v,l]) => (
                <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: 13 }}>
                  <input type="radio" name="fleet_type" value={v} checked={form.fleet_type === v} onChange={() => setForm(p => ({ ...p, fleet_type: v }))} />
                  {l}
                </label>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Vehicle types you can provide</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ROUTE_VEHICLE_OPTIONS.map(v => (
                <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 12, background: form.vehicle_types.includes(v) ? '#fef7f3' : '#f9fafb', border: `1px solid ${form.vehicle_types.includes(v) ? '#c45c28' : '#e5e7eb'}`, borderRadius: 5, padding: '3px 8px' }}>
                  <input type="checkbox" checked={form.vehicle_types.includes(v)} onChange={() => toggleVehicle(v)} style={{ margin: 0 }} />
                  {v}
                </label>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Routes you cover</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {REGIONS.map(r => (
                <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 12, background: form.routes_covered.includes(r) ? '#fef7f3' : '#f9fafb', border: `1px solid ${form.routes_covered.includes(r) ? '#c45c28' : '#e5e7eb'}`, borderRadius: 5, padding: '3px 8px' }}>
                  <input type="checkbox" checked={form.routes_covered.includes(r)} onChange={() => toggleRoute(r)} style={{ margin: 0 }} />
                  {r}
                </label>
              ))}
            </div>
          </div>

          {saveErr && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '8px 12px', fontSize: 13, color: '#b91c1c', marginBottom: 10 }}>{saveErr}</div>}
          {saveMsg && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '8px 12px', fontSize: 13, color: '#15803d', marginBottom: 10 }}>{saveMsg}</div>}

          <button
            onClick={handleRegister}
            disabled={saving}
            style={{ background: saving ? '#999' : '#c45c28', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving ? 'Saving…' : 'Register / Save listing'}
          </button>

          <p style={{ color: '#aaa', fontSize: 11, marginTop: 10 }}>This portal identifies agents by mobile number — it is not a secure login. Before production rollout, add OTP/mobile verification.</p>
        </div>

        {/* Right column: lookup + recent */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Lookup */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 24px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#1a1a1a' }}>Look up your listing</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={lookupMobile}
                onChange={e => setLookupMobile(e.target.value)}
                placeholder="Enter your registered mobile number"
                onKeyDown={e => e.key === 'Enter' && handleLookup()}
                style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 14 }}
              />
              <button
                onClick={handleLookup}
                disabled={lookupLoading}
                style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {lookupLoading ? '…' : 'Find my listing'}
              </button>
            </div>
            {lookupErr && <div style={{ marginTop: 10, color: '#b91c1c', fontSize: 13 }}>{lookupErr}</div>}
            {lookupResult && (
              <div style={{ marginTop: 12, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 14px', fontSize: 13 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{lookupResult.company_name}</div>
                <div style={{ color: '#555', marginTop: 4 }}>{lookupResult.contact_person} · {lookupResult.mobile}</div>
                <div style={{ color: '#555' }}>{lookupResult.city}{lookupResult.state ? `, ${lookupResult.state}` : ''}</div>
                <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>{lookupResult.fleet_type.replace(/_/g, ' ')}</span>
                  {gradeBadge(lookupResult.grade)}
                  {statusBadge(lookupResult.status)}
                </div>
                {lookupResult.vehicle_types?.length > 0 && (
                  <div style={{ marginTop: 6, color: '#666', fontSize: 12 }}><strong>Vehicles:</strong> {lookupResult.vehicle_types.join(', ')}</div>
                )}
                {lookupResult.routes_covered?.length > 0 && (
                  <div style={{ color: '#666', fontSize: 12 }}><strong>Routes:</strong> {lookupResult.routes_covered.join(', ')}</div>
                )}
                <div style={{ color: '#aaa', fontSize: 11, marginTop: 6 }}>Registered {new Date(lookupResult.created_at).toLocaleDateString('en-IN')}</div>
              </div>
            )}
          </div>

          {/* Recent */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Recently registered</h3>
              <button onClick={loadRecent} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 5, padding: '3px 10px', fontSize: 11, cursor: 'pointer', color: '#666' }}>Refresh</button>
            </div>
            {recentAgents.length === 0 ? (
              <div style={{ color: '#aaa', fontSize: 13 }}>No new registrations yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentAgents.map(a => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 7 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{a.company_name}</div>
                      <div style={{ color: '#888', fontSize: 11 }}>{a.city} · {a.mobile}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {gradeBadge(a.grade)}
                      <span style={{ fontSize: 11, color: '#aaa' }}>{new Date(a.created_at).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MarketVehicleDesk() {
  const [activeTab, setActiveTab] = useState<'flow' | 'find' | 'portal'>('flow')

  const tabs: { id: 'flow' | 'find' | 'portal'; label: string }[] = [
    { id: 'flow',   label: '00  Process Flow' },
    { id: 'find',   label: '01  Find Agent (Ops)' },
    { id: 'portal', label: '02  Agent Portal' },
  ]

  return (
    <div style={{ padding: '0 0 40px 0' }}>
      {/* Header */}
      <div style={{ background: '#1a1a1a', color: '#fff', borderRadius: 10, padding: '16px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>BGTS Market Vehicle Desk</div>
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>Agent Sourcing &amp; Allocation Console</div>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#ccc' }}>
          <span>agents loaded</span>
          <span>routes mapped</span>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', marginBottom: 20 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === t.id ? '2px solid #c45c28' : '2px solid transparent',
              marginBottom: -2,
              padding: '10px 20px',
              fontSize: 13,
              fontWeight: activeTab === t.id ? 700 : 500,
              color: activeTab === t.id ? '#c45c28' : '#666',
              cursor: 'pointer',
              transition: 'color 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'flow'   && <ProcessFlow />}
      {activeTab === 'find'   && <FindAgent />}
      {activeTab === 'portal' && <AgentPortal />}
    </div>
  )
}
