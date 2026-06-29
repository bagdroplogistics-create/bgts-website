'use client'
import { useState } from 'react'

const CARD: React.CSSProperties = {
  background: '#ffffff', border: '1px solid #ddd8d0',
  borderRadius: 8, padding: '20px 24px', marginBottom: 20,
}
const LABEL: React.CSSProperties = {
  fontSize: '0.72rem', fontWeight: 700, color: '#666',
  textTransform: 'uppercase', letterSpacing: '0.06em',
  display: 'block', marginBottom: 4,
}
const INPUT: React.CSSProperties = {
  width: '100%', padding: '8px 10px', fontSize: '0.88rem',
  border: '1px solid #d5cfc7', borderRadius: 6,
  background: '#faf7f4', boxSizing: 'border-box',
}
const SELECT_STYLE: React.CSSProperties = { ...INPUT, cursor: 'pointer' }

type Decision = 'GO' | 'CONDITIONAL' | 'NO'

interface NegResult {
  decision:  Decision
  margin:    number   // margin at counter-offer %
  script:    string
  reasoning: string
}

function analyse(
  original: number, counter: number, cost: number,
  relationship: string, hasEmi: boolean, fleetBusy: boolean
): NegResult {
  const margin = ((counter - cost) / counter) * 100

  // Absolute reject: below cost
  if (counter <= cost) {
    return {
      decision:  'NO',
      margin,
      reasoning: `Counter-offer of ₹${counter.toLocaleString('en-IN')} is below your actual cost of ₹${cost.toLocaleString('en-IN')}. Accepting this means a confirmed loss.`,
      script:    `"Sir, I appreciate your business but I genuinely cannot do this trip below ₹${Math.ceil(cost * 1.08).toLocaleString('en-IN')}. Our cost alone is ₹${cost.toLocaleString('en-IN')}. I would be losing money. If you can confirm 3 trips this month, I can offer ₹${Math.ceil(cost * 1.12).toLocaleString('en-IN')}."`
    }
  }

  // Below 10% margin — risky
  if (margin < 10) {
    if (hasEmi && !fleetBusy) {
      return {
        decision:  'CONDITIONAL',
        margin,
        reasoning: `Margin is only ${margin.toFixed(1)}% — thin, but vehicle has EMI and is currently idle. A thin margin is better than zero revenue today.`,
        script:    `"Sir, I can consider ₹${counter.toLocaleString('en-IN')} only if payment is 100% advance before trip. Given how tight this is, I also need you to commit minimum 2 trips this month to make this viable."`
      }
    }
    return {
      decision:  'NO',
      margin,
      reasoning: `Margin of ${margin.toFixed(1)}% is too thin for a fleet-busy situation. Your vehicle can earn better elsewhere. Politely decline and hold your rate.`,
      script:    `"Sir, I am already running at capacity this week. My rate of ₹${original.toLocaleString('en-IN')} already accounts for all costs. I cannot go below ₹${Math.ceil(cost * 1.15).toLocaleString('en-IN')} and remain profitable. If timing is flexible, I can revisit next week."`
    }
  }

  // 10–20% margin — conditional
  if (margin < 20) {
    const concessionTarget = Math.ceil(original * 0.93) // max 7% discount
    const isTooLow = counter < concessionTarget

    if (isTooLow && relationship === 'new') {
      return {
        decision:  'NO',
        margin,
        reasoning: `${margin.toFixed(1)}% margin with a new client who has no trip history. The risk-to-reward is unfavourable. Hold your rate — new clients who negotiate this hard often pay slowly too.`,
        script:    `"Sir, this is our standard rate for this route. We maintain these rates to ensure quality service. Once we establish a working relationship and you see our reliability, we can discuss volume-based pricing."`
      }
    }

    return {
      decision:  'CONDITIONAL',
      margin,
      reasoning: `${margin.toFixed(1)}% margin is acceptable — not ideal, but workable. Use a concession trade: discount in exchange for guaranteed volume or faster payment.`,
      script:    `"Sir, I can come down to ₹${counter.toLocaleString('en-IN')} on one condition — 50% advance payment before departure, and if you can guarantee ${relationship === 'key' ? '5' : '3'} trips this month, I will honour this rate for all of them. Otherwise my standard rate stands."`
    }
  }

  // 20%+ margin — acceptable counter-offer
  const dropPct = ((original - counter) / original) * 100
  if (dropPct > 15) {
    return {
      decision:  'CONDITIONAL',
      margin,
      reasoning: `Margin is healthy at ${margin.toFixed(1)}%, but client is asking for a ${dropPct.toFixed(0)}% discount which is large. Accept with a face-saving condition so you maintain pricing discipline.`,
      script:    `"Sir, I can match ₹${counter.toLocaleString('en-IN')} this time as a gesture of goodwill. But please note — this is a special rate for you and not our standard. Next trip I will need at least ₹${Math.ceil(counter * 1.05).toLocaleString('en-IN')}."`
    }
  }

  return {
    decision:  'GO',
    margin,
    reasoning: `${margin.toFixed(1)}% margin is solid. Client's counter-offer is reasonable (${dropPct.toFixed(0)}% below your quote). Accept confidently — do not negotiate further.`,
    script:    `"Sir, done. I will confirm the booking right away. Please share the pickup address and time. Payment terms: ${relationship === 'key' || relationship === 'regular' ? '50% advance, balance on delivery' : '100% advance'}."`
  }
}

const DECISION_CONFIG: Record<Decision, { bg: string; border: string; color: string; label: string }> = {
  GO:          { bg: '#d8f5e2', border: '#4caf50', color: '#1a6e35', label: '✓ GO — Accept' },
  CONDITIONAL: { bg: '#fff7d6', border: '#e0aa00', color: '#7a5000', label: '⚡ CONDITIONAL — Accept with terms' },
  NO:          { bg: '#ffe0e0', border: '#e53935', color: '#b30000', label: '✕ NO — Hold your rate' },
}

const PRINCIPLES = [
  { title: 'Never reveal your cost.', body: 'Always anchor high. First quote = your ceiling.' },
  { title: 'Silence is a tactic.', body: 'After quoting, go silent. First person to speak next loses.' },
  { title: 'Trade concessions.', body: '"I can do ₹X if you confirm 3 trips this month" or "100% advance."' },
  { title: 'Anchor on value, not cost.', body: 'GPS tracking, on-time delivery rate, no delays — you are not a commodity.' },
  { title: 'Never discount without getting something.', body: 'Every rupee you give away should buy volume, speed of payment, or loyalty.' },
]

export function Negotiation() {
  const [original,     setOriginal]     = useState('')
  const [counter,      setCounter]      = useState('')
  const [cost,         setCost]         = useState('')
  const [relationship, setRelationship] = useState('occasional')
  const [hasEmi,       setHasEmi]       = useState('yes')
  const [fleetBusy,    setFleetBusy]    = useState('busy')
  const [result,       setResult]       = useState<NegResult | null>(null)

  const handleAnalyse = () => {
    const o = Number(original), c = Number(counter), ct = Number(cost)
    if (!o || !c || !ct) return
    setResult(analyse(o, c, ct, relationship, hasEmi === 'yes', fleetBusy === 'busy'))
  }

  return (
    <div style={{ padding: '24px 24px 48px', maxWidth: 1000 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#111', margin: '0 0 4px' }}>
          Negotiation Room
        </h2>
        <p style={{ fontSize: '0.78rem', color: '#888', margin: 0 }}>
          Client pushes back on your price? Enter their counter-offer — get an instant Go / Conditional / No decision with the exact script to use.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Inputs */}
        <div>
          <div style={CARD}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={LABEL}>Your Original Quote (₹)</label>
                <input style={INPUT} type="number" placeholder="e.g. 18000" value={original} onChange={e => setOriginal(e.target.value)} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={LABEL}>Client Counter-Offer (₹)</label>
                <input style={INPUT} type="number" placeholder="e.g. 14000" value={counter} onChange={e => setCounter(e.target.value)} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={LABEL}>Your Actual Cost (₹) — use Quote Engine above</label>
                <input style={INPUT} type="number" placeholder="e.g. 11500" value={cost} onChange={e => setCost(e.target.value)} />
              </div>
              <div>
                <label style={LABEL}>Client Relationship</label>
                <select style={SELECT_STYLE} value={relationship} onChange={e => setRelationship(e.target.value)}>
                  <option value="new">New — No history</option>
                  <option value="occasional">Occasional — 1–3 trips/month</option>
                  <option value="regular">Regular — 4+ trips/month</option>
                  <option value="key">Key Account — ₹1L+/month</option>
                </select>
              </div>
              <div>
                <label style={LABEL}>Vehicle has EMI?</label>
                <select style={SELECT_STYLE} value={hasEmi} onChange={e => setHasEmi(e.target.value)}>
                  <option value="yes">Yes — must keep running</option>
                  <option value="no">No — loan cleared</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={LABEL}>Current fleet status</label>
                <select style={SELECT_STYLE} value={fleetBusy} onChange={e => setFleetBusy(e.target.value)}>
                  <option value="busy">Fleet busy — trip optional</option>
                  <option value="idle">EMI vehicle sitting idle</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleAnalyse}
              disabled={!original || !counter || !cost}
              style={{
                marginTop: 16, width: '100%', padding: '10px 0',
                background: (!original || !counter || !cost) ? '#e0dbd4' : '#c45c28',
                color: (!original || !counter || !cost) ? '#999' : '#fff',
                border: 'none', borderRadius: 6, fontWeight: 700, fontSize: '0.9rem',
                cursor: (!original || !counter || !cost) ? 'not-allowed' : 'pointer',
              }}
            >
              Analyse Counter-Offer →
            </button>
          </div>

          {/* Principles */}
          <div style={CARD}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#555', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Negotiation Principles
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PRINCIPLES.map(p => (
                <div key={p.title} style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                  <strong style={{ color: '#1a1a1a' }}>{p.title}</strong>{' '}
                  <span style={{ color: '#666' }}>{p.body}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Result */}
        <div>
          {!result ? (
            <div style={{ ...CARD, textAlign: 'center', padding: '48px 24px', color: '#bbb', fontSize: '0.88rem' }}>
              Enter counter-offer details to get your answer.
            </div>
          ) : (() => {
            const cfg = DECISION_CONFIG[result.decision]
            const discountPct = Number(original) > 0
              ? ((Number(original) - Number(counter)) / Number(original) * 100).toFixed(1)
              : '0'
            return (
              <div>
                {/* Decision badge */}
                <div style={{ background: cfg.bg, border: `2px solid ${cfg.border}`, borderRadius: 10, padding: '20px 24px', marginBottom: 16 }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: cfg.color, marginBottom: 8 }}>
                    {cfg.label}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    {[
                      ['Margin at counter-offer', `${result.margin.toFixed(1)}%`],
                      ['Discount given',          `${discountPct}%`],
                      ['Your cost',               `₹${Number(cost).toLocaleString('en-IN')}`],
                      ['Profit at counter',       `₹${Math.round(Number(counter) - Number(cost)).toLocaleString('en-IN')}`],
                    ].map(([l, v]) => (
                      <div key={l} style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 6, padding: '8px 12px' }}>
                        <div style={{ fontSize: '0.68rem', color: '#777', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{l}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: cfg.color }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#555', lineHeight: 1.6 }}>
                    {result.reasoning}
                  </div>
                </div>

                {/* Script */}
                <div style={CARD}>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#c45c28', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    What to Say — Exact Script
                  </div>
                  <div style={{ background: '#faf7f4', border: '1px solid #ddd8d0', borderRadius: 6, padding: '14px 16px', fontSize: '0.88rem', color: '#1a1a1a', lineHeight: 1.7, fontStyle: 'italic' }}>
                    {result.script}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
