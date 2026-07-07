'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { MvdAutoBooking } from '@/types/dispatch'

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

interface OutreachRecord {
  id?: string
  agent_id: string
  agent_name: string
  agent_mobile: string
  method: string
  message_sent: string
  logged_at: string
  status: string
}

interface MvdBookingRecord {
  id: string
  trip_date: string
  client_name: string
  company_name: string | null
  from_loc: string
  to_loc: string
  vehicle_type: string
  material: string
  phone: string
  stage: string
  created_at: string
}

// ── Constants ─────────────────────────────────────────────────────────────────
const VEHICLE_TYPES = [
  'Any / All Types',
  'LCV / Pickup',
  'Taurus (22-24 ft)',
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
  'LCV / Pickup', 'Taurus (22-24 ft)', 'Open Truck / Dala', 'Container',
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

function fmtRef(id: string) {
  return `MVD-${id.slice(0, 8).toUpperCase()}`
}

const BGTS_FOOTER_EN = `Contact: 6357115711 / 6357225722 / 6357335733
Website: www.bgts.in
Email: info@bgts.in
Address: Near Natraj Cinema, Next to BATA Showroom, PratapGunj Naka, Vadodara - 390002, Gujarat.

— BGTS PVT LTD`

const BGTS_FOOTER_HI = `संपर्क: 6357115711 / 6357225722 / 6357335733
वेबसाइट: www.bgts.in
ईमेल: info@bgts.in
पता: नटराज सिनेमा के पास, बाटा शोरूम के बगल में, प्रतापगंज नाका, वडोदरा - 390002, गुजरात।

— BGTS PVT LTD`

const BGTS_FOOTER_GU = `સંપર્ક: 6357115711 / 6357225722 / 6357335733
વેબસાઇટ: www.bgts.in
ઈમેઇલ: info@bgts.in
સરનામું: નટરાજ સિનેમા પાસે, BATA શોરૂમ બાજુમાં, પ્રતાપગંજ નાકા, વડોદરા - 390002, ગુજરાત.

— BGTS PVT LTD`

function buildMessages(
  from_city: string,
  to_city: string,
  vehicle_type: string,
  material_type: string,
  pickup_date: string,
  agent: MvdAgent,
  language: string,
  bookingRef?: string,
): { en: string; hi: string; gu: string } {
  const agentName   = agent.contact_person || agent.company_name
  const dateStr     = pickup_date || 'to be confirmed'
  const materialStr = material_type || 'general cargo'
  const refLine     = bookingRef ? `\nBooking Ref: ${bookingRef}` : ''

  const en =
`Hello ${agentName}, this is a message from BGTS (Baroda Goods Transport Service Pvt. Ltd.).

We have a load requirement:${refLine}
Route: ${from_city} → ${to_city}.
Vehicle Required: ${vehicle_type}.
Material: ${materialStr}.
Pickup Date: ${dateStr}.

Kindly share your best rate and vehicle availability for this route at the earliest. Please reply to this number or call back.

${BGTS_FOOTER_EN}`

  const hi =
`नमस्ते ${agentName} जी, यह BGTS (बरोडा गुड्स ट्रांसपोर्ट सर्विस प्राइवेट लिमिटेड) की तरफ से संदेश है।

हमारे पास एक लोड है:${refLine}
रूट: ${from_city} → ${to_city}.
वाहन आवश्यक: ${vehicle_type}.
सामान: ${materialStr}.
पिकअप तारीख: ${dateStr}.

कृपया इस रूट के लिए अपनी सबसे अच्छी दर और वाहन की उपलब्धता जल्द से जल्द बताएं। इस नंबर पर रिप्लाई करें या कॉल बैक करें।

${BGTS_FOOTER_HI}`

  const gu =
`નમસ્તે ${agentName} સાહેબ, આ BGTS (બરોડા ગુડ્સ ટ્રાન્સપોર્ટ સર્વિસ પ્રાઇવેટ લિ.) તરફથી સંદેશ છે.

અમારી પાસે એક ટ્રાન્સપોર્ટ જરૂરિયાત છે:${refLine}
રૂટ: ${from_city} → ${to_city}.
વાહન: ${vehicle_type}.
માલ: ${materialStr}.
પિકઅપ તારીખ: ${dateStr}.

કૃપા કરીને આ રૂટ માટે આપનો શ્રેષ્ઠ ભાવ અને વાહનની ઉપલબ્ધતા જલ્દી જણાવો. આ નંબર પર રિપ્લાય કરો અથવા કૉલ બૅક કરો.

${BGTS_FOOTER_GU}`

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
interface FindAgentProps {
  autoBooking?:           MvdAutoBooking | null
  onAutoBookingConsumed?: () => void
}

const DEFAULT_FORM = {
  from_city:     '',
  to_city:       '',
  vehicle_type:  'Any / All Types',
  agent_type:    'ALL',
  material_type: '',
  pickup_date:   '',
  name_search:   '',
  language:      'en',
}

function FindAgent({ autoBooking, onAutoBookingConsumed }: FindAgentProps) {
  const [form,         setForm]         = useState(DEFAULT_FORM)
  const [loading,      setLoading]      = useState(false)
  const [agents,       setAgents]       = useState<MvdAgent[]>([])
  const [meta,         setMeta]         = useState<SearchMeta | null>(null)
  const [searched,     setSearched]     = useState(false)
  const [selected,     setSelected]     = useState<Set<string>>(new Set())
  const [messages,     setMessages]     = useState<{ agent: MvdAgent; en: string; hi: string; gu: string }[]>([])
  const [msgGenerated, setMsgGenerated] = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [copyStates,   setCopyStates]   = useState<Record<string, boolean>>({})
  const [activeBooking, setActiveBooking] = useState<MvdAutoBooking | null>(null)
  const [outreachLog,  setOutreachLog]  = useState<Record<string, OutreachRecord[]>>({})
  const [logSaving,    setLogSaving]    = useState<Record<string, boolean>>({})
  const processedRef = useRef<string | null>(null)

  // Core search function that accepts params directly (avoids stale closure)
  const runSearch = useCallback(async (params: typeof DEFAULT_FORM) => {
    if (!params.to_city && !params.from_city && !params.name_search) return
    setLoading(true)
    setSearched(false)
    setSelected(new Set())
    setMessages([])
    setMsgGenerated(false)
    try {
      const res = await fetch('/api/dispatch/mvd/agents/search', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_city:    params.from_city,
          to_city:      params.to_city,
          vehicle_type: params.vehicle_type === 'Any / All Types' ? 'ALL' : params.vehicle_type,
          agent_type:   params.agent_type,
          name_search:  params.name_search,
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
  }, [])

  const handleSearch = useCallback(() => runSearch(form), [form, runSearch])

  // Auto-populate + auto-search when a booking is pushed in
  useEffect(() => {
    if (!autoBooking || processedRef.current === autoBooking.id) return
    processedRef.current = autoBooking.id
    setActiveBooking(autoBooking)
    const newForm = {
      from_city:     autoBooking.from_loc,
      to_city:       autoBooking.to_loc,
      vehicle_type:  autoBooking.vehicle_type || 'Any / All Types',
      agent_type:    'ALL',
      material_type: autoBooking.material || '',
      pickup_date:   autoBooking.trip_date || '',
      name_search:   '',
      language:      'en',
    }
    setForm(newForm)
    onAutoBookingConsumed?.()
    // Run search immediately with new values
    if (autoBooking.to_loc || autoBooking.from_loc) {
      runSearch(newForm)
    }
  }, [autoBooking, onAutoBookingConsumed, runSearch])

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const generateMessages = async () => {
    const selectedAgents = agents.filter(a => selected.has(a.id))
    const ref = activeBooking ? fmtRef(activeBooking.id) : undefined
    const msgs = selectedAgents.map(a => ({
      agent: a,
      ...buildMessages(form.from_city, form.to_city, form.vehicle_type, form.material_type, form.pickup_date, a, form.language, ref),
    }))
    setMessages(msgs)
    setMsgGenerated(true)

    // Save inquiry to DB
    setSaving(true)
    try {
      const { en, hi, gu } = msgs[0] ?? { en: '', hi: '', gu: '' }
      await fetch('/api/dispatch/mvd/inquiries', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_city:     form.from_city,
          to_city:       form.to_city,
          vehicle_type:  form.vehicle_type,
          material_type: form.material_type || null,
          pickup_date:   form.pickup_date   || null,
          agent_ids:     selectedAgents.map(a => a.id),
          message_en:    en,
          message_hi:    hi,
          message_gu:    gu,
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

  const logOutreach = async (agent: MvdAgent, method: string, message: string) => {
    const key = `${agent.id}-${method}`
    setLogSaving(prev => ({ ...prev, [key]: true }))
    try {
      const res = await fetch('/api/dispatch/mvd/outreach', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mvd_booking_id: activeBooking?.id || null,
          agent_id:       agent.id,
          agent_name:     agent.company_name,
          agent_mobile:   agent.mobile,
          method,
          message_sent:   message,
        }),
      })
      const json = await res.json()
      const record: OutreachRecord = {
        id:           json.data?.id,
        agent_id:     agent.id,
        agent_name:   agent.company_name,
        agent_mobile: agent.mobile,
        method,
        message_sent: message,
        logged_at:    new Date().toISOString(),
        status:       'SENT',
      }
      setOutreachLog(prev => ({ ...prev, [agent.id]: [...(prev[agent.id] ?? []), record] }))
    } catch (e) {
      console.error('Failed to log outreach:', e)
    } finally {
      setLogSaving(prev => ({ ...prev, [key]: false }))
    }
  }

  const getLangText = (msg: { en: string; hi: string; gu: string }) => {
    if (form.language === 'en')  return { texts: [{ label: 'English',   text: msg.en }] }
    if (form.language === 'hi')  return { texts: [{ label: 'Hindi',     text: msg.hi }] }
    if (form.language === 'gu')  return { texts: [{ label: 'Gujarati',  text: msg.gu }] }
    return { texts: [{ label: 'English', text: msg.en }, { label: 'Hindi', text: msg.hi }, { label: 'Gujarati', text: msg.gu }] }
  }

  const INP: React.CSSProperties = { width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 14, boxSizing: 'border-box' }
  const LBL: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 0' }}>

      {/* Auto-booking banner */}
      {activeBooking && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#1d4ed8', marginBottom: 2 }}>
              📋 Auto-loaded from Market Vehicle Booking
            </div>
            <div style={{ fontSize: 12, color: '#3b82f6' }}>
              <strong>{fmtRef(activeBooking.id)}</strong>
              {' — '}
              {activeBooking.client_name}{activeBooking.company_name ? ` (${activeBooking.company_name})` : ''}
              {' — '}
              {activeBooking.from_loc} → {activeBooking.to_loc}
              {' — '}
              {activeBooking.vehicle_type}
              {activeBooking.material ? ` — ${activeBooking.material}` : ''}
              {activeBooking.trip_date ? ` — ${activeBooking.trip_date}` : ''}
            </div>
          </div>
          <button
            onClick={() => { setActiveBooking(null); setForm(DEFAULT_FORM); setAgents([]); setSearched(false); setMessages([]); setMsgGenerated(false); processedRef.current = null }}
            style={{ background: 'none', border: '1px solid #bfdbfe', borderRadius: 5, padding: '4px 10px', fontSize: 11, color: '#3b82f6', cursor: 'pointer' }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Search panel */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 24px', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: '#1a1a1a' }}>Find Agent — for an inbound inquiry</h3>
        <p style={{ color: '#888', fontSize: 12, marginTop: 0, marginBottom: 16 }}>Enter the route and vehicle type from the inquiry. Region matching is approximate — always confirm exact lane coverage with the agent before allocating.</p>

        <div style={{ marginBottom: 14 }}>
          <label style={LBL}>Search by company / agent name (optional)</label>
          <input value={form.name_search} onChange={e => setForm(p => ({ ...p, name_search: e.target.value }))} placeholder="Type company name or contact person..." style={INP} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={LBL}>From (origin city)</label>
            <input value={form.from_city} onChange={e => setForm(p => ({ ...p, from_city: e.target.value }))} placeholder="e.g. Ahmedabad" style={INP} />
          </div>
          <div>
            <label style={LBL}>To (destination city)</label>
            <input value={form.to_city} onChange={e => setForm(p => ({ ...p, to_city: e.target.value }))} placeholder="e.g. Mumbai" style={INP} />
          </div>
          <div>
            <label style={LBL}>Vehicle type required</label>
            <select value={form.vehicle_type} onChange={e => setForm(p => ({ ...p, vehicle_type: e.target.value }))} style={{ ...INP, background: '#fff' }}>
              {VEHICLE_TYPES.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label style={LBL}>Agent type</label>
            <select value={form.agent_type} onChange={e => setForm(p => ({ ...p, agent_type: e.target.value }))} style={{ ...INP, background: '#fff' }}>
              {AGENT_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
          <div>
            <label style={LBL}>Material type (for outreach message)</label>
            <input value={form.material_type} onChange={e => setForm(p => ({ ...p, material_type: e.target.value }))} placeholder="e.g. Industrial Materials, Pharma, FMCG..." style={INP} />
          </div>
          <div>
            <label style={LBL}>Pickup date (optional)</label>
            <input type="date" value={form.pickup_date} onChange={e => setForm(p => ({ ...p, pickup_date: e.target.value }))} style={INP} />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={LBL}>Message language</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[{ v: 'en', l: 'English' }, { v: 'hi', l: 'Hindi (हिंदी)' }, { v: 'gu', l: 'Gujarati (ગુજરાતી)' }, { v: 'all', l: 'All three' }].map(({ v, l }) => (
              <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                <input type="radio" name="lang" value={v} checked={form.language === v} onChange={() => setForm(p => ({ ...p, language: v }))} />
                {l}
              </label>
            ))}
          </div>
        </div>

        <button onClick={handleSearch} disabled={loading} style={{ background: loading ? '#999' : '#c45c28', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 28px', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
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
                <button onClick={() => setSelected(new Set(agents.map(a => a.id)))} style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>
                  Select all shown
                </button>
              )}
              <span style={{ fontSize: 12, color: '#666' }}><strong>{selected.size}</strong> agent(s) selected</span>
              {selected.size > 0 && (
                <button onClick={generateMessages} style={{ background: '#c45c28', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
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
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>
                        {a.company_name}
                        {outreachLog[a.id]?.length > 0 && (
                          <span style={{ marginLeft: 6, background: '#dcfce7', color: '#166534', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>
                            ✓ {outreachLog[a.id].length} sent
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '8px 10px', color: '#555' }}>{a.contact_person || '—'}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <a href={`tel:${a.mobile}`} style={{ color: '#c45c28', fontWeight: 600, textDecoration: 'none' }}>{a.mobile}</a>
                      </td>
                      <td style={{ padding: '8px 10px', color: '#555' }}>{a.city}{a.state ? `, ${a.state}` : ''}</td>
                      <td style={{ padding: '8px 10px', color: '#555', fontSize: 12 }}>{a.fleet_type.replace(/_/g, ' ')}</td>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              Inquiry Messages — Ready to Send
              {activeBooking && (
                <span style={{ marginLeft: 10, fontSize: 12, color: '#6b7280', fontWeight: 400 }}>
                  Booking ref: <strong style={{ color: '#1d4ed8' }}>{fmtRef(activeBooking.id)}</strong>
                </span>
              )}
            </div>
            {saving && <div style={{ fontSize: 12, color: '#888' }}>Saving inquiry…</div>}
          </div>

          {messages.map((m, i) => {
            const { texts } = getLangText(m)
            const agentLog  = outreachLog[m.agent.id] ?? []
            return (
              <div key={m.agent.id} style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: '14px 16px', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a' }}>
                    #{i + 1} — {m.agent.company_name} · {m.agent.mobile}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <a
                      href={`https://wa.me/${m.agent.mobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(texts[0]?.text ?? '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ background: '#25d366', color: '#fff', border: 'none', borderRadius: 5, padding: '5px 12px', fontSize: 12, textDecoration: 'none', display: 'inline-block', fontWeight: 600 }}
                    >
                      📱 WhatsApp
                    </a>
                    <button
                      disabled={logSaving[`${m.agent.id}-whatsapp`]}
                      onClick={() => logOutreach(m.agent, 'whatsapp', texts[0]?.text ?? '')}
                      style={{ background: agentLog.some(r => r.method === 'whatsapp') ? '#f0fdf4' : '#f3f4f6', color: agentLog.some(r => r.method === 'whatsapp') ? '#166534' : '#374151', border: `1px solid ${agentLog.some(r => r.method === 'whatsapp') ? '#bbf7d0' : '#d1d5db'}`, borderRadius: 5, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                    >
                      {logSaving[`${m.agent.id}-whatsapp`] ? '…' : agentLog.some(r => r.method === 'whatsapp') ? '✓ WA Logged' : 'Log WA Sent'}
                    </button>
                    <button
                      disabled={logSaving[`${m.agent.id}-phone`]}
                      onClick={() => logOutreach(m.agent, 'phone', texts[0]?.text ?? '')}
                      style={{ background: agentLog.some(r => r.method === 'phone') ? '#f0fdf4' : '#f3f4f6', color: agentLog.some(r => r.method === 'phone') ? '#166534' : '#374151', border: `1px solid ${agentLog.some(r => r.method === 'phone') ? '#bbf7d0' : '#d1d5db'}`, borderRadius: 5, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                    >
                      {logSaving[`${m.agent.id}-phone`] ? '…' : agentLog.some(r => r.method === 'phone') ? '✓ Call Logged' : 'Log Call'}
                    </button>
                  </div>
                </div>

                {/* Message text blocks */}
                {texts.map(({ label, text }) => (
                  <div key={label} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>{label}</span>
                      <button
                        onClick={() => copyText(`${m.agent.id}-${label}`, text)}
                        style={{ background: copyStates[`${m.agent.id}-${label}`] ? '#16a34a' : '#f3f4f6', color: copyStates[`${m.agent.id}-${label}`] ? '#fff' : '#374151', border: '1px solid #d1d5db', borderRadius: 5, padding: '3px 12px', fontSize: 11, cursor: 'pointer' }}
                      >
                        {copyStates[`${m.agent.id}-${label}`] ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, fontFamily: 'inherit' }}>{text}</pre>
                  </div>
                ))}

                {/* Outreach activity log for this agent */}
                {agentLog.length > 0 && (
                  <div style={{ marginTop: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 7, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#166534', marginBottom: 6, textTransform: 'uppercase' }}>Outreach Activity</div>
                    {agentLog.map((r, ri) => (
                      <div key={ri} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12, color: '#374151', marginBottom: ri < agentLog.length - 1 ? 4 : 0 }}>
                        <span style={{ background: '#dcfce7', color: '#166534', borderRadius: 4, padding: '1px 7px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{r.method}</span>
                        <span>{new Date(r.logged_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>{r.status}</span>
                      </div>
                    ))}
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

// ── Sub-tab 02: Agent Portal ──────────────────────────────────────────────────
function AgentPortal() {
  const [form, setForm] = useState({
    company_name: '', contact_person: '', mobile: '', city: '', state: '',
    fleet_type: 'BROKER', vehicle_types: [] as string[], routes_covered: [] as string[],
  })
  const [saving,  setSaving]  = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [saveErr, setSaveErr] = useState('')
  const [lookupMobile,  setLookupMobile]  = useState('')
  const [lookupResult,  setLookupResult]  = useState<MvdAgent | null>(null)
  const [lookupErr,     setLookupErr]     = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [recentAgents,  setRecentAgents]  = useState<MvdAgent[]>([])

  const loadRecent = useCallback(async () => {
    try {
      const res  = await fetch('/api/dispatch/mvd/agents?status=NEW')
      const json = await res.json()
      setRecentAgents((json.data ?? []).slice(0, 10))
    } catch { /* silent */ }
  }, [])

  useEffect(() => { loadRecent() }, [loadRecent])

  const toggleVehicle = (v: string) => setForm(p => ({ ...p, vehicle_types: p.vehicle_types.includes(v) ? p.vehicle_types.filter(x => x !== v) : [...p.vehicle_types, v] }))
  const toggleRoute   = (r: string) => setForm(p => ({ ...p, routes_covered: p.routes_covered.includes(r) ? p.routes_covered.filter(x => x !== r) : [...p.routes_covered, r] }))

  const handleRegister = async () => {
    if (!form.company_name.trim() || !form.mobile.trim() || !form.city.trim()) { setSaveErr('Company name, mobile and city are required.'); return }
    setSaving(true); setSaveErr(''); setSaveMsg('')
    try {
      const res  = await fetch('/api/dispatch/mvd/agents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setSaveMsg(json.isUpdate ? 'Listing updated successfully.' : 'Registration successful! You are now in the BGTS search pool.')
      if (!json.isUpdate) setForm({ company_name: '', contact_person: '', mobile: '', city: '', state: '', fleet_type: 'BROKER', vehicle_types: [], routes_covered: [] })
      loadRecent()
    } catch (e: unknown) { setSaveErr(e instanceof Error ? e.message : String(e)) } finally { setSaving(false) }
  }

  const handleLookup = async () => {
    if (!lookupMobile.trim()) return
    setLookupLoading(true); setLookupErr(''); setLookupResult(null)
    try {
      const res  = await fetch(`/api/dispatch/mvd/agents/mobile/${encodeURIComponent(lookupMobile.trim())}`)
      const json = await res.json()
      if (json.error) { setLookupErr(json.error); return }
      setLookupResult(json.data)
    } catch (e: unknown) { setLookupErr(String(e)) } finally { setLookupLoading(false) }
  }

  const INP: React.CSSProperties = { width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 14, boxSizing: 'border-box' }
  const LBL: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '20px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 24px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: '#1a1a1a' }}>Register / Update your listing</h3>
          <p style={{ color: '#888', fontSize: 12, marginBottom: 16 }}>Self-service registration. Registering adds you to the BGTS search pool for matching inquiries on your route and vehicle type.</p>
          <div style={{ marginBottom: 12 }}><label style={LBL}>Company / Transporter name *</label><input value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))} placeholder="ABC Transport Co." style={INP} /></div>
          <div style={{ marginBottom: 12 }}><label style={LBL}>Contact person</label><input value={form.contact_person} onChange={e => setForm(p => ({ ...p, contact_person: e.target.value }))} placeholder="Ramesh Patel" style={INP} /></div>
          <div style={{ marginBottom: 12 }}><label style={LBL}>Mobile number (used as your ID) *</label><input value={form.mobile} onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))} placeholder="9876543210" style={INP} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div><label style={LBL}>City / Base location *</label><input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Ahmedabad" style={INP} /></div>
            <div><label style={LBL}>State</label><input value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} placeholder="Gujarat" style={INP} /></div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={LBL}>Fleet type</label>
            <div style={{ display: 'flex', gap: 16 }}>
              {[['FLEET_OWNER','Fleet Owner'],['BROKER','Broker'],['FLEET_OWNER_BROKER','Fleet Owner / Broker']].map(([v,l]) => (
                <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: 13 }}>
                  <input type="radio" name="fleet_type" value={v} checked={form.fleet_type === v} onChange={() => setForm(p => ({ ...p, fleet_type: v }))} />{l}
                </label>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={LBL}>Vehicle types you can provide</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ROUTE_VEHICLE_OPTIONS.map(v => (
                <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 12, background: form.vehicle_types.includes(v) ? '#fef7f3' : '#f9fafb', border: `1px solid ${form.vehicle_types.includes(v) ? '#c45c28' : '#e5e7eb'}`, borderRadius: 5, padding: '3px 8px' }}>
                  <input type="checkbox" checked={form.vehicle_types.includes(v)} onChange={() => toggleVehicle(v)} style={{ margin: 0 }} />{v}
                </label>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={LBL}>Routes you cover</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {REGIONS.map(r => (
                <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 12, background: form.routes_covered.includes(r) ? '#fef7f3' : '#f9fafb', border: `1px solid ${form.routes_covered.includes(r) ? '#c45c28' : '#e5e7eb'}`, borderRadius: 5, padding: '3px 8px' }}>
                  <input type="checkbox" checked={form.routes_covered.includes(r)} onChange={() => toggleRoute(r)} style={{ margin: 0 }} />{r}
                </label>
              ))}
            </div>
          </div>
          {saveErr && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '8px 12px', fontSize: 13, color: '#b91c1c', marginBottom: 10 }}>{saveErr}</div>}
          {saveMsg && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '8px 12px', fontSize: 13, color: '#15803d', marginBottom: 10 }}>{saveMsg}</div>}
          <button onClick={handleRegister} disabled={saving} style={{ background: saving ? '#999' : '#c45c28', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving…' : 'Register / Save listing'}
          </button>
          <p style={{ color: '#aaa', fontSize: 11, marginTop: 10 }}>This portal identifies agents by mobile number — it is not a secure login. Before production rollout, add OTP/mobile verification.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 24px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#1a1a1a' }}>Look up your listing</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={lookupMobile} onChange={e => setLookupMobile(e.target.value)} placeholder="Enter your registered mobile number" onKeyDown={e => e.key === 'Enter' && handleLookup()} style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 14 }} />
              <button onClick={handleLookup} disabled={lookupLoading} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>{lookupLoading ? '…' : 'Find my listing'}</button>
            </div>
            {lookupErr && <div style={{ marginTop: 10, color: '#b91c1c', fontSize: 13 }}>{lookupErr}</div>}
            {lookupResult && (
              <div style={{ marginTop: 12, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 14px', fontSize: 13 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{lookupResult.company_name}</div>
                <div style={{ color: '#555', marginTop: 4 }}>{lookupResult.contact_person} · {lookupResult.mobile}</div>
                <div style={{ color: '#555' }}>{lookupResult.city}{lookupResult.state ? `, ${lookupResult.state}` : ''}</div>
                <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>{lookupResult.fleet_type.replace(/_/g, ' ')}</span>
                  {gradeBadge(lookupResult.grade)}{statusBadge(lookupResult.status)}
                </div>
                {lookupResult.vehicle_types?.length > 0 && <div style={{ marginTop: 6, color: '#666', fontSize: 12 }}><strong>Vehicles:</strong> {lookupResult.vehicle_types.join(', ')}</div>}
                {lookupResult.routes_covered?.length > 0 && <div style={{ color: '#666', fontSize: 12 }}><strong>Routes:</strong> {lookupResult.routes_covered.join(', ')}</div>}
                <div style={{ color: '#aaa', fontSize: 11, marginTop: 6 }}>Registered {new Date(lookupResult.created_at).toLocaleDateString('en-IN')}</div>
              </div>
            )}
          </div>

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

// ── Sub-tab 03: Pending Bookings ──────────────────────────────────────────────
interface PendingBookingsProps {
  onLoadBooking: (b: MvdAutoBooking) => void
}

function PendingBookings({ onLoadBooking }: PendingBookingsProps) {
  const [bookings,  setBookings]  = useState<MvdBookingRecord[]>([])
  const [loading,   setLoading]   = useState(false)
  const [refreshed, setRefreshed] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/dispatch/mvd/bookings')
      const json = await res.json()
      setBookings(json.data ?? [])
      setRefreshed(true)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const stageColor: Record<string, string> = {
    BOOKING_RECEIVED: '#fef3c7',
    BOOKING_CONFIRMED: '#d1fae5',
    CANCELLED: '#fee2e2',
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Market Vehicle Booking Queue</h3>
          <p style={{ fontSize: 12, color: '#888', margin: '4px 0 0' }}>All bookings submitted via the Market Vehicle Booking tab. Click “Open in Find Agent” to auto-load the booking into the agent search.</p>
        </div>
        <button onClick={load} disabled={loading} style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, padding: '7px 14px', fontSize: 12, cursor: 'pointer' }}>
          {loading ? 'Loading…' : '↻ Refresh'}
        </button>
      </div>

      {!refreshed && loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>Loading bookings…</div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa', background: '#f9fafb', borderRadius: 10, border: '1px dashed #e5e7eb' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>No market vehicle bookings yet</div>
          <div style={{ fontSize: 13 }}>Bookings submitted from the Market Vehicle Booking tab will appear here.</div>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151' }}>Ref</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151' }}>Date</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151' }}>Client</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151' }}>Route</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151' }}>Vehicle</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151' }}>Material</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151' }}>Status</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, idx) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #f0f0f0', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: '#1d4ed8', fontSize: 12 }}>{fmtRef(b.id)}</td>
                  <td style={{ padding: '10px 14px', color: '#555' }}>{b.trip_date}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontWeight: 600 }}>{b.client_name}</div>
                    {b.company_name && <div style={{ fontSize: 11, color: '#888' }}>{b.company_name}</div>}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#374151' }}>
                    <span style={{ fontWeight: 600 }}>{b.from_loc}</span>
                    <span style={{ color: '#aaa', margin: '0 4px' }}>→</span>
                    <span style={{ fontWeight: 600 }}>{b.to_loc}</span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#555', fontSize: 12 }}>{b.vehicle_type}</td>
                  <td style={{ padding: '10px 14px', color: '#555', fontSize: 12 }}>{b.material}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: stageColor[b.stage] ?? '#f3f4f6', color: '#374151', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>
                      {b.stage.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <button
                      onClick={() => onLoadBooking({
                        id:           b.id,
                        from_loc:     b.from_loc,
                        to_loc:       b.to_loc,
                        vehicle_type: b.vehicle_type,
                        material:     b.material,
                        trip_date:    b.trip_date,
                        client_name:  b.client_name,
                        phone:        b.phone,
                        company_name: b.company_name,
                      })}
                      style={{ background: '#c45c28', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Open in Find Agent →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
interface MarketVehicleDeskProps {
  autoBooking?:           MvdAutoBooking | null
  onAutoBookingConsumed?: () => void
}

export default function MarketVehicleDesk({ autoBooking, onAutoBookingConsumed }: MarketVehicleDeskProps) {
  const [activeTab,  setActiveTab]  = useState<'flow' | 'find' | 'portal' | 'queue'>('flow')
  const [agentCount, setAgentCount] = useState<number | null>(null)
  const [findAgentBooking, setFindAgentBooking] = useState<MvdAutoBooking | null>(null)
  const ROUTE_COUNT = 44

  useEffect(() => {
    fetch('/api/dispatch/mvd/agents')
      .then(r => r.json())
      .then(j => setAgentCount((j.data ?? []).length))
      .catch(() => setAgentCount(0))
  }, [])

  // When autoBooking arrives from DispatchShell, switch to Find Agent tab
  useEffect(() => {
    if (!autoBooking) return
    setFindAgentBooking(autoBooking)
    setActiveTab('find')
  }, [autoBooking])

  const handleLoadFromQueue = (b: MvdAutoBooking) => {
    setFindAgentBooking(b)
    setActiveTab('find')
  }

  const tabs: { id: 'flow' | 'find' | 'portal' | 'queue'; label: string }[] = [
    { id: 'flow',   label: '00  Process Flow' },
    { id: 'find',   label: '01  Find Agent (Ops)' },
    { id: 'portal', label: '02  Agent Portal' },
    { id: 'queue',  label: '03  Booking Queue' },
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
          <span style={{ color: agentCount === 0 ? '#f87171' : '#86efac', fontWeight: 600 }}>
            {agentCount === null ? '…' : agentCount.toLocaleString()} agents loaded
          </span>
          <span style={{ color: '#86efac', fontWeight: 600 }}>{ROUTE_COUNT} routes mapped</span>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ background: 'none', border: 'none', borderBottom: activeTab === t.id ? '2px solid #c45c28' : '2px solid transparent', marginBottom: -2, padding: '10px 20px', fontSize: 13, fontWeight: activeTab === t.id ? 700 : 500, color: activeTab === t.id ? '#c45c28' : '#666', cursor: 'pointer', transition: 'color 0.15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'flow'   && <ProcessFlow />}
      {activeTab === 'find'   && (
        <FindAgent
          autoBooking={findAgentBooking}
          onAutoBookingConsumed={() => { setFindAgentBooking(null); onAutoBookingConsumed?.() }}
        />
      )}
      {activeTab === 'portal' && <AgentPortal />}
      {activeTab === 'queue'  && <PendingBookings onLoadBooking={handleLoadFromQueue} />}
    </div>
  )
}
