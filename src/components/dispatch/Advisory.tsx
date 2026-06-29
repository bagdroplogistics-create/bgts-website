'use client'

interface AdvisoryCard {
  number:   number
  title:    string
  subtitle: string
  impact:   'High Impact' | 'Medium Impact'
  urgency:  string
  body:     string[]
  action:   string
}

const CARDS: AdvisoryCard[] = [
  {
    number:   1,
    title:    'Dead Mileage — Your Biggest Hidden Loss',
    subtitle: 'Immediate Action Required',
    impact:   'High Impact',
    urgency:  'Immediate',
    body: [
      'Your 4 vehicles likely run 5,000+ km/month empty on return trips. At ₹26/km average cost, that\'s roughly ₹1,30,000/month going out that clients aren\'t fully paying for.',
      'Before every outstation trip, spend 10 minutes calling 2–3 companies on the return route. Apps like Vahak, TrucksMudi, BlackBuck Load Board connect you with shippers needing exactly your return route. Even getting a partial load cuts dead mileage cost by 50–80%.',
    ],
    action: 'Build a return load contact list for your top 5 outstation routes (Ahmedabad, Mumbai, Surat, Delhi, Hyderabad) — companies that regularly ship from those cities back toward Vadodara.',
  },
  {
    number:   2,
    title:    'Detention is ₹20,000–40,000/Month You\'re Giving Away Free',
    subtitle: 'You are losing this every month',
    impact:   'High Impact',
    urgency:  'This Week',
    body: [
      'Industrial sites (PCPIR, GIDC, refineries) routinely delay 5–12 hours. If you\'re running 20 trips/month averaging 4 hrs wait each — that\'s ₹10,000–20,000 in detention you\'re currently giving to clients for free.',
      'Create a physical Detention Slip — driver hands it at the loading gate, client signs it = acceptance of detention terms. One habit change can add ₹25,000+/month to profit within 60 days.',
    ],
    action: 'Script: "Sir, as per our standard terms, after 3 free hours we charge ₹500/hour for waiting. Please sign this slip — it\'s just for our records." Most clients sign without question.',
  },
  {
    number:   3,
    title:    'Ultra 1518 — No EMI, Highest Payload. Use It Strategically',
    subtitle: 'Strategic Reallocation',
    impact:   'High Impact',
    urgency:  'This Month',
    body: [
      'GJ19X6890 (Ultra 1518) has NO EMI. Its fixed cost is only ₹49,876/month. Every rupee it earns above ₹83,127 goes straight to profit.',
      'Compare with Tata 1212: it must earn ₹1,49,000 just to break even — before any profit.',
    ],
    action: 'Ultra 1518 should get all highest-paying, longest runs — IOCL Dahej, ONGC, Mumbai, Pune, heavy industrial contracts. Never use it for city runs that Bolero can handle. Revenue check: Ultra needs ₹4,200/day for 20 working days to hit target.',
  },
  {
    number:   4,
    title:    'Contract vs Spot Ratio — You Need Both',
    subtitle: 'Strategic Balance',
    impact:   'Medium Impact',
    urgency:  '30 Days',
    body: [
      'Current risk: If all revenue is spot, one slow month = can\'t cover EMI. If all contracts, you miss premium surge rates.',
      'Ideal mix for BGTS: 60% Contract + 40% Spot. Contracts: 2–3 anchor clients on monthly retainer or per-trip guarantee. Covers fixed costs reliably every month. One PSU contract (IOCL, ONGC, GNFC, GSFC) at ₹2 lakh/month changes your entire financial stability.',
    ],
    action: 'Spot: Apply peak/urgent/night surcharges freely. This is where margin jumps to 50–60%. Identify one PSU client to target this quarter.',
  },
  {
    number:   5,
    title:    'Goods-in-Transit Insurance — Critical Gap',
    subtitle: 'Risk Management — Do This Week',
    impact:   'High Impact',
    urgency:  'Urgent',
    body: [
      'Critical gap: Your vehicle insurance covers the truck — NOT the goods inside it. Carry ₹10 lakh of chemicals, have an accident, client sues you for the cargo value.',
      'Goods-in-Transit (GIT) insurance. Annual premium: ₹8,000–15,000 for coverage up to ₹50 lakh per trip. For chemical/HAZMAT loads especially, this is non-negotiable.',
    ],
    action: 'Some PSU clients mandate Third-Party Liability for goods through GIDC/PCPIR zones in their contract terms. Check before bidding. Call your insurance broker this week.',
  },
  {
    number:   6,
    title:    'Build Your Client Portfolio — Track Top 10 Clients',
    subtitle: 'Do Within 30 Days',
    impact:   'Medium Impact',
    urgency:  '30 Days',
    body: [
      '3–4 clients generate 70% of revenue in most transport businesses. Losing one = a crisis. Knowing who they are = you protect and prioritize them.',
      'Track for each client: Total trips/month, revenue, avg payment days, disputes ever, cargo type, preferred vehicle, seasonal patterns.',
    ],
    action: 'Use the Dispatch Board to build this data — every booking logged = client history building automatically. After 90 days you will see clearly which 3 clients matter most.',
  },
  {
    number:   7,
    title:    'Technology Stack to Add (Low Cost, High Impact)',
    subtitle: 'Efficiency Upgrades',
    impact:   'Medium Impact',
    urgency:  '60 Days',
    body: [
      'GPS on all 4 vehicles — Fleetroot / Shiprocket GPS ₹500/vehicle/month. Clients love live tracking. Eliminates fake breakdown excuses.',
      'WhatsApp Business Account — Set up business profile, use broadcast lists for delivery updates. Costs nothing. Makes you look like a logistics company, not a single truck operator.',
    ],
    action: 'Digital POD — Driver photographs signed delivery receipt. Upload to shared Google Drive folder per client. Eliminates all payment disputes. Tally Prime — every expense and income tracked. Real profitability per vehicle per month.',
  },
  {
    number:   8,
    title:    'Next Vehicle: Refrigerated Van for Pharma Growth',
    subtitle: '12-Month Growth Plan',
    impact:   'Medium Impact',
    urgency:  '12 Months',
    body: [
      'Vadodara has Torrent, Zydus, Sun Pharma, Intas — all 5 minutes from each other. Pharma transport rates are 40–60% higher than general cargo.',
      'A 2–3T refrigerated van costs ₹18–22 lakh. EMI ~₹35,000/month. Break-even with pharma rates achievable in 12 months.',
    ],
    action: 'Alternative: A flatbed trailer for ODC (L&T, Siemens, ABB) earns ₹25,000–75,000 per trip. Timeline: After clearing Tata 1212 EMI (GJ06BX3536) — redirect those funds to next vehicle EMI.',
  },
]

const IMPACT_STYLE: Record<string, React.CSSProperties> = {
  'High Impact':   { background: '#ffe0e0', color: '#b30000' },
  'Medium Impact': { background: '#fff7d6', color: '#7a5000' },
}

const URGENCY_STYLE: Record<string, React.CSSProperties> = {
  'Urgent':     { background: '#ffe0e0', color: '#b30000' },
  'Immediate':  { background: '#ffe0e0', color: '#b30000' },
  'This Week':  { background: '#fff0dc', color: '#a05000' },
  'This Month': { background: '#fef3c7', color: '#78350f' },
  '30 Days':    { background: '#e0edff', color: '#1e5fa8' },
  '60 Days':    { background: '#e0edff', color: '#1e5fa8' },
  '12 Months':  { background: '#e0e7ff', color: '#3730a3' },
}

export function Advisory() {
  return (
    <div style={{ padding: '24px 24px 48px', maxWidth: 1000 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#111', margin: '0 0 4px' }}>
          Advisory — Operational Intelligence
        </h2>
        <p style={{ fontSize: '0.78rem', color: '#888', margin: 0 }}>
          Professional assessment of BGTS operations. 8 specific areas where revenue is being left on the table — with exact action plans.
        </p>
      </div>

      {/* Summary banner */}
      <div style={{ background: '#F3EFE8', border: '1px solid #ddd8d0', borderRadius: 8, padding: '16px 20px', marginBottom: 24, fontSize: '0.85rem', lineHeight: 1.6, color: '#333' }}>
        <strong>Professional Assessment — BGTS Operations:</strong> Cost model is solid. Pricing discipline is good. But significant money is being left on the table in 3 areas: detention enforcement, dead mileage recovery, and lack of client portfolio tracking. The 8-point action plan below addresses all of it.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {CARDS.map(card => (
          <div key={card.number} style={{ background: '#ffffff', border: '1px solid #ddd8d0', borderRadius: 10, overflow: 'hidden' }}>
            {/* Card header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #ece8e0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#c45c28', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem', flexShrink: 0 }}>
                  {card.number}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111', marginBottom: 2 }}>{card.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#888' }}>{card.subtitle}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 16 }}>
                <span style={{ ...IMPACT_STYLE[card.impact], padding: '3px 8px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {card.impact}
                </span>
                <span style={{ ...(URGENCY_STYLE[card.urgency] ?? {}), padding: '3px 8px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 700 }}>
                  {card.urgency}
                </span>
              </div>
            </div>

            {/* Card body */}
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {card.body.map((para, i) => (
                  <p key={i} style={{ margin: 0, fontSize: '0.85rem', color: '#444', lineHeight: 1.65 }}>{para}</p>
                ))}
              </div>

              {/* Action box */}
              <div style={{ background: '#faf7f4', border: '1px solid #e8e0d5', borderLeft: '3px solid #c45c28', borderRadius: '0 6px 6px 0', padding: '10px 14px' }}>
                <div style={{ fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c45c28', marginBottom: 4 }}>
                  Action
                </div>
                <div style={{ fontSize: '0.82rem', color: '#333', lineHeight: 1.6 }}>{card.action}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
