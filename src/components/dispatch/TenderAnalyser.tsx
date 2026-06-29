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
const TH: React.CSSProperties = {
  padding: '8px 14px', fontSize: '0.7rem', fontWeight: 700,
  letterSpacing: '0.07em', textTransform: 'uppercase' as const,
  color: '#777', background: '#F3EFE8', borderBottom: '1px solid #d5cfc7',
  textAlign: 'left' as const,
}
const TD: React.CSSProperties = {
  padding: '9px 14px', fontSize: '0.82rem', color: '#333',
  borderBottom: '1px solid #ece8e0',
}

// Payment risk multiplier: longer payment cycle = higher effective cost of capital
const PAYMENT_RISK: Record<string, number> = {
  monthly:    0.00,  // no discount
  quarterly:  0.01,  // ~1% penalty
  halfyearly: 0.025, // ~2.5% penalty
  annually:   0.05,  // ~5% penalty
}

// Route risk: local trips have less dead mileage / compliance cost
const ROUTE_RISK: Record<string, number> = {
  local:     0.00,
  interstate: 0.03,
  national:   0.06,
}

// Duration lock-in bonus: longer = more predictable revenue
const DURATION_BONUS: Record<string, number> = {
  '3':  0.00,
  '6':  0.01,
  '12': 0.02,
  '24': 0.025,
  '36': 0.03,
}

interface TenderResult {
  rawMargin:      number
  adjustedMargin: number
  decision:       'BID' | 'CAUTION' | 'NO_BID'
  decisionLabel:  string
  reasoning:      string
  action:         string
  paymentPenalty: number
  routePenalty:   number
  durationBonus:  number
  emdLockup:      number // ₹ locked up in EMD
}

function analyse(
  quotedRate: number, cost: number, emd: number,
  duration: string, paymentTerms: string, routeType: string
): TenderResult {
  const rawMargin = ((quotedRate - cost) / quotedRate) * 100

  const paymentPenalty = PAYMENT_RISK[paymentTerms] ?? 0
  const routePenalty   = ROUTE_RISK[routeType]      ?? 0
  const durationBonus  = DURATION_BONUS[duration]   ?? 0

  const adjustedMargin = rawMargin - (paymentPenalty * 100) - (routePenalty * 100) + (durationBonus * 100)

  const emdLockup = emd // ₹ locked in bank guarantee / DD

  let decision: 'BID' | 'CAUTION' | 'NO_BID'
  let decisionLabel: string
  let reasoning: string
  let action: string

  if (adjustedMargin < 10) {
    decision = 'NO_BID'
    decisionLabel = '✕ Do Not Bid — Reject'
    reasoning = `Adjusted margin is only ${adjustedMargin.toFixed(1)}% after accounting for payment risk and route complexity. This tender will result in a confirmed loss or near-zero return once you factor in vehicle wear, staff time for compliance, and delayed payment.`
    action = 'Reject. Write a polite "capacity not available" email. Focus on spot market this period where margins are 30–50%.'
  } else if (adjustedMargin < 15) {
    decision = 'CAUTION'
    decisionLabel = '⚡ Caution — MD Approval Required'
    reasoning = `Adjusted margin of ${adjustedMargin.toFixed(1)}% is marginal. May be viable if payment terms can be improved or if this is a strategic anchor client (PSU / MNC) that opens future business.`
    action = `Submit only with MD approval. Condition: push for monthly payment, not ${paymentTerms}. EMD of ₹${emd.toLocaleString('en-IN')} locks up capital for ${duration} months — confirm cash flow can absorb this.`
  } else if (adjustedMargin < 25) {
    decision = 'BID'
    decisionLabel = '✓ Acceptable — Bid with Cost Buffer'
    reasoning = `${adjustedMargin.toFixed(1)}% adjusted margin is workable. This tender provides revenue stability. Factor in a 5% cost buffer for fuel price increases over the contract period.`
    action = `Bid. Add 5% fuel escalation clause in your submission. Ensure your rate covers diesel at ₹105/L as a stress test. Push for monthly payment terms.`
  } else {
    decision = 'BID'
    decisionLabel = '✓✓ Bid Aggressively — Prioritize'
    reasoning = `Excellent adjusted margin of ${adjustedMargin.toFixed(1)}%. This tender should be prioritised. At this margin, even with payment delays and cost escalation, BGTS remains profitable.`
    action = `Submit immediately. Prepare all documents — PAN, GST, vehicle RC, insurance, permit — so submission is complete and clean. A clean bid often wins over lower-priced incomplete bids.`
  }

  return { rawMargin, adjustedMargin, decision, decisionLabel, reasoning, action, paymentPenalty: paymentPenalty * 100, routePenalty: routePenalty * 100, durationBonus: durationBonus * 100, emdLockup }
}

const DECISION_MATRIX = [
  { margin: 'Below 10%',  decision: 'Do Not Bid',       action: 'Reject — confirmed loss',     color: '#b30000', bg: '#fff0f0' },
  { margin: '10 – 15%',   decision: 'Caution',           action: 'MD approval required',        color: '#7a5000', bg: '#fffbe6' },
  { margin: '15 – 25%',   decision: 'Acceptable',        action: 'Bid with cost buffer',        color: '#1a4a8a', bg: '#eef3ff' },
  { margin: '25%+',       decision: 'Bid Aggressively',  action: 'Prioritize this tender',      color: '#1a6e35', bg: '#eafaf0' },
]

const DECISION_STYLE: Record<string, { bg: string; border: string; color: string }> = {
  BID:     { bg: '#d8f5e2', border: '#4caf50', color: '#1a6e35' },
  CAUTION: { bg: '#fff7d6', border: '#e0aa00', color: '#7a5000' },
  NO_BID:  { bg: '#ffe0e0', border: '#e53935', color: '#b30000' },
}

export function TenderAnalyser() {
  const [tenderName,    setTenderName]    = useState('')
  const [quotedRate,    setQuotedRate]    = useState('')
  const [cost,          setCost]          = useState('')
  const [emd,           setEmd]           = useState('')
  const [duration,      setDuration]      = useState('12')
  const [paymentTerms,  setPaymentTerms]  = useState('monthly')
  const [routeType,     setRouteType]     = useState('local')
  const [result,        setResult]        = useState<TenderResult | null>(null)

  const handleAnalyse = () => {
    const q = Number(quotedRate), c = Number(cost), e = Number(emd) || 0
    if (!q || !c) return
    setResult(analyse(q, c, e, duration, paymentTerms, routeType))
  }

  return (
    <div style={{ padding: '24px 24px 48px', maxWidth: 1000 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#111', margin: '0 0 4px' }}>
          Tender Analyser
        </h2>
        <p style={{ fontSize: '0.78rem', color: '#888', margin: 0 }}>
          Go / No-Go decision engine for PSU and government contracts. Adjusts for payment risk, route complexity, and contract duration.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Inputs */}
        <div>
          <div style={CARD}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={LABEL}>Tender Name / Client</label>
                <input style={INPUT} placeholder="e.g. IOCL Dahej Supply Contract" value={tenderName} onChange={e => setTenderName(e.target.value)} />
              </div>
              <div>
                <label style={LABEL}>Our Quoted Rate (₹)</label>
                <input style={INPUT} type="number" placeholder="e.g. 850000" value={quotedRate} onChange={e => setQuotedRate(e.target.value)} />
              </div>
              <div>
                <label style={LABEL}>Estimated Cost (₹)</label>
                <input style={INPUT} type="number" placeholder="e.g. 650000" value={cost} onChange={e => setCost(e.target.value)} />
              </div>
              <div>
                <label style={LABEL}>EMD Amount (₹)</label>
                <input style={INPUT} type="number" placeholder="e.g. 50000" value={emd} onChange={e => setEmd(e.target.value)} />
              </div>
              <div>
                <label style={LABEL}>Contract Duration</label>
                <select style={SELECT_STYLE} value={duration} onChange={e => setDuration(e.target.value)}>
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                  <option value="24">24 Months</option>
                  <option value="36">36 Months</option>
                </select>
              </div>
              <div>
                <label style={LABEL}>Payment Terms</label>
                <select style={SELECT_STYLE} value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)}>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="halfyearly">Half-Yearly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={LABEL}>Route Type</label>
                <select style={SELECT_STYLE} value={routeType} onChange={e => setRouteType(e.target.value)}>
                  <option value="local">Local Gujarat</option>
                  <option value="interstate">Interstate</option>
                  <option value="national">National Long Haul</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleAnalyse}
              disabled={!quotedRate || !cost}
              style={{
                marginTop: 16, width: '100%', padding: '10px 0',
                background: (!quotedRate || !cost) ? '#e0dbd4' : '#c45c28',
                color: (!quotedRate || !cost) ? '#999' : '#fff',
                border: 'none', borderRadius: 6, fontWeight: 700, fontSize: '0.9rem',
                cursor: (!quotedRate || !cost) ? 'not-allowed' : 'pointer',
              }}
            >
              Analyse Tender →
            </button>
          </div>

          {/* Decision Matrix */}
          <div style={CARD}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#555', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Decision Matrix
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Adjusted Margin','Decision','Action'].map(h => <th key={h} style={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {DECISION_MATRIX.map(row => (
                  <tr key={row.margin} style={{ background: row.bg }}>
                    <td style={{ ...TD, fontWeight: 600 }}>{row.margin}</td>
                    <td style={{ ...TD, color: row.color, fontWeight: 700 }}>{row.decision}</td>
                    <td style={{ ...TD, fontSize: '0.78rem' }}>{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Result */}
        <div>
          {!result ? (
            <div style={{ ...CARD, textAlign: 'center', padding: '48px 24px', color: '#bbb', fontSize: '0.88rem' }}>
              Enter tender details to see Go / No-Go analysis.
            </div>
          ) : (() => {
            const cfg = DECISION_STYLE[result.decision]
            return (
              <div>
                {tenderName && (
                  <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: 10 }}>
                    Analysis for: <strong style={{ color: '#333' }}>{tenderName}</strong>
                  </div>
                )}

                {/* Decision */}
                <div style={{ background: cfg.bg, border: `2px solid ${cfg.border}`, borderRadius: 10, padding: '20px 24px', marginBottom: 16 }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: cfg.color, marginBottom: 12 }}>
                    {result.decisionLabel}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    {[
                      ['Raw Margin',      `${result.rawMargin.toFixed(1)}%`],
                      ['Adjusted Margin', `${result.adjustedMargin.toFixed(1)}%`],
                      ['Payment Penalty', result.paymentPenalty > 0 ? `-${result.paymentPenalty.toFixed(1)}%` : 'None'],
                      ['Route Risk',      result.routePenalty > 0   ? `-${result.routePenalty.toFixed(1)}%`   : 'None'],
                      ['Duration Bonus',  result.durationBonus > 0  ? `+${result.durationBonus.toFixed(1)}%`  : 'None'],
                      ['EMD Lock-up',     result.emdLockup > 0 ? `₹${result.emdLockup.toLocaleString('en-IN')}` : '—'],
                    ].map(([l, v]) => (
                      <div key={l} style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 6, padding: '8px 12px' }}>
                        <div style={{ fontSize: '0.65rem', color: '#777', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{l}</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: cfg.color }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#555', lineHeight: 1.6 }}>
                    {result.reasoning}
                  </div>
                </div>

                {/* Action */}
                <div style={CARD}>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#c45c28', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Recommended Action
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#1a1a1a', lineHeight: 1.7 }}>
                    {result.action}
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
