'use client'
import { useState, useEffect, useCallback } from 'react'
import type { WebsiteInquiry, InquiryStatus } from '@/types/dispatch'

// ── Style tokens ──────────────────────────────────────────────────────────────
const TH: React.CSSProperties = {
  padding: '8px 12px', fontSize: '0.68rem', fontWeight: 700,
  letterSpacing: '0.07em', color: '#777', textAlign: 'left',
  borderBottom: '1px solid #e0dbd3', whiteSpace: 'nowrap', background: '#F3EFE8',
}
const TD: React.CSSProperties = {
  padding: '9px 12px', fontSize: '0.82rem', color: '#333', borderBottom: '1px solid #f0ece6',
  verticalAlign: 'top',
}

const CATEGORY_STYLE: Record<string, React.CSSProperties> = {
  FTL    : { background: '#e0edff', color: '#1e5fa8' },
  PTL    : { background: '#fff7d6', color: '#8a6400' },
  EV     : { background: '#d8f5e2', color: '#1a6e35' },
  SERVICE: { background: '#f0e0ff', color: '#6200b3' },
}
const CATEGORY_LABEL: Record<string, string> = {
  FTL: 'FTL Booking', PTL: 'PTL Booking', EV: 'EV Booking', SERVICE: 'Service Inquiry',
}

const STATUS_STYLE: Record<InquiryStatus, React.CSSProperties> = {
  NEW      : { background: '#fff0dc', color: '#a05000' },
  CONTACTED: { background: '#e8f0ff', color: '#2050a0' },
  CONVERTED: { background: '#d8f5e2', color: '#1a6e35' },
  DROPPED  : { background: '#f0f0f0', color: '#888' },
}

const STATUSES: InquiryStatus[] = ['NEW', 'CONTACTED', 'CONVERTED', 'DROPPED']

const CATEGORIES = ['ALL', 'FTL', 'PTL', 'EV', 'SERVICE']

function badge(style: React.CSSProperties, text: string) {
  return (
    <span style={{ ...style, display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700 }}>
      {text}
    </span>
  )
}

export function WebsiteInquiries() {
  const [inquiries, setInquiries] = useState<WebsiteInquiry[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [filter,    setFilter]    = useState('ALL')
  const [expanded,  setExpanded]  = useState<string | null>(null)
  const [updating,  setUpdating]  = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res  = await fetch('/api/dispatch/inquiries?limit=200')
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setInquiries(json.data ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load inquiries')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id: string, status: InquiryStatus) => {
    setUpdating(id)
    try {
      const res  = await fetch('/api/dispatch/inquiries', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i))
    } catch (e) { alert(e instanceof Error ? e.message : 'Update failed') }
    finally { setUpdating(null) }
  }

  const visible = filter === 'ALL' ? inquiries : inquiries.filter(i => i.category === filter)

  // Count by category
  const counts = inquiries.reduce<Record<string, number>>((acc, i) => {
    acc[i.category] = (acc[i.category] ?? 0) + 1
    acc.ALL = (acc.ALL ?? 0) + 1
    return acc
  }, {})
  const newCount = inquiries.filter(i => i.status === 'NEW').length

  return (
    <div style={{ padding: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a1a' }}>
            Website Inquiries
            {newCount > 0 && (
              <span style={{ marginLeft: 10, background: '#c45c28', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
                {newCount} NEW
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 2 }}>
            All booking requests submitted through the website — FTL, PTL, EV and Service inquiries.
          </div>
        </div>
        <button onClick={load}
          style={{ fontSize: '0.75rem', padding: '5px 12px', borderRadius: 6, border: '1px solid #d0ccc5', background: 'transparent', color: '#888', cursor: 'pointer' }}>
          ↻ Refresh
        </button>
      </div>

      {/* Category filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            style={{
              padding: '5px 14px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
              cursor: 'pointer', border: '1px solid',
              background: filter === cat ? '#c45c28' : '#faf7f4',
              color:      filter === cat ? '#fff'    : '#666',
              borderColor: filter === cat ? '#c45c28' : '#d5cfc7',
            }}>
            {cat === 'ALL' ? 'All' : CATEGORY_LABEL[cat] ?? cat}
            {counts[cat] ? ` (${counts[cat]})` : ''}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #ddd8d0', borderRadius: 10, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>Loading inquiries…</div>
        ) : error ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#c00' }}>{error}</div>
        ) : visible.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>
            No {filter === 'ALL' ? '' : CATEGORY_LABEL[filter] + ' '}inquiries yet.
            <div style={{ fontSize: '0.75rem', marginTop: 6 }}>Inquiries appear here as soon as someone submits a form on the website.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Date & Ref','Category','Name / Company','Contact','Route','Goods / Load','Status',''].map(h => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map(inq => (
                  <>
                    <tr key={inq.id} style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}>
                      <td style={TD}>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#c45c28', fontWeight: 700 }}>{inq.ref_no ?? '—'}</div>
                        <div style={{ fontSize: '0.7rem', color: '#999', marginTop: 2 }}>
                          {inq.created_at ? new Date(inq.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                        </div>
                      </td>
                      <td style={TD}>{badge(CATEGORY_STYLE[inq.category] ?? {}, CATEGORY_LABEL[inq.category] ?? inq.category)}</td>
                      <td style={TD}>
                        <div style={{ fontWeight: 600, color: '#111' }}>{inq.full_name ?? '—'}</div>
                        {inq.company_name && <div style={{ fontSize: '0.72rem', color: '#888' }}>{inq.company_name}</div>}
                      </td>
                      <td style={TD}>
                        <div style={{ fontSize: '0.78rem' }}>{inq.mobile ?? '—'}</div>
                        {inq.email && <div style={{ fontSize: '0.7rem', color: '#888' }}>{inq.email}</div>}
                      </td>
                      <td style={{ ...TD, fontSize: '0.78rem' }}>
                        {inq.origin_city && inq.destination_city
                          ? `${inq.origin_city} → ${inq.destination_city}`
                          : inq.origin_city ?? '—'}
                        {inq.pickup_date && <div style={{ fontSize: '0.7rem', color: '#999' }}>{inq.pickup_date}</div>}
                      </td>
                      <td style={{ ...TD, fontSize: '0.78rem' }}>
                        <div>{inq.goods_type ?? inq.service_name ?? '—'}</div>
                        {inq.weight_range && <div style={{ fontSize: '0.7rem', color: '#999' }}>{inq.weight_range}</div>}
                      </td>
                      <td style={TD} onClick={e => e.stopPropagation()}>
                        <select value={inq.status} disabled={updating === inq.id}
                          onChange={e => updateStatus(inq.id, e.target.value as InquiryStatus)}
                          style={{ fontSize: '0.75rem', border: '1px solid #ddd', borderRadius: 6, padding: '3px 6px', cursor: 'pointer', ...(STATUS_STYLE[inq.status] ?? {}) }}>
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{ ...TD, color: '#bbb', fontSize: '0.8rem' }}>{expanded === inq.id ? '▲' : '▼'}</td>
                    </tr>

                    {/* Expanded detail row */}
                    {expanded === inq.id && (
                      <tr key={inq.id + '_detail'}>
                        <td colSpan={8} style={{ background: '#faf7f4', padding: '14px 20px', borderBottom: '1px solid #e0dbd3' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 24px', fontSize: '0.78rem' }}>
                            {[
                              ['Vehicle Type',          inq.vehicle_type],
                              ['No. of Packages',       inq.no_of_packages != null ? String(inq.no_of_packages) : null],
                              ['Service-Specific',      inq.service_specific],
                              ['Additional Services',   inq.additional_services],
                              ['Special Instructions',  inq.special_instructions],
                              ['Additional Requirements', inq.additional_requirements],
                              ['Source Form',           inq.source_form],
                            ].filter(([, v]) => v).map(([k, v]) => (
                              <div key={String(k)}>
                                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{k}</div>
                                <div style={{ color: '#333' }}>{v}</div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
