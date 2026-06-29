import { NextRequest, NextResponse } from 'next/server'
import { getBgtsAdminClient } from '@/lib/supabase-bgts'

// ── Route → Region mapping ────────────────────────────────────────────────────
// Maps destination city keywords → normalised region tag
const ROUTE_MATRIX: { keywords: string[]; region: string }[] = [
  { keywords: ['ahmedabad','gandhinagar','rajkot','surat','vadodara','baroda','anand','bharuch','vapi','valsad','navsari','mehsana','patan','morbi','jamnagar','bhavnagar','bhuj','kutch','junagadh','amreli','surendranagar','dahej','ankleshwar','hazira','mundra'], region: 'Gujarat' },
  { keywords: ['mumbai','pune','nashik','nagpur','aurangabad','thane','navi mumbai','kolhapur','solapur','ahmednagar','nanded','latur'], region: 'Maharashtra' },
  { keywords: ['delhi','new delhi','gurgaon','gurugram','noida','faridabad','ghaziabad'], region: 'North India' },
  { keywords: ['lucknow','kanpur','agra','meerut','varanasi','allahabad','prayagraj','bareilly','mathura','aligarh','gorakhpur','moradabad'], region: 'Uttar Pradesh' },
  { keywords: ['jaipur','jodhpur','udaipur','kota','bikaner','ajmer','alwar'], region: 'Rajasthan' },
  { keywords: ['indore','bhopal','jabalpur','gwalior','ujjain','ratlam','dewas'], region: 'Madhya Pradesh' },
  { keywords: ['chennai','coimbatore','madurai','trichy','tiruppur','salem','vellore'], region: 'South India' },
  { keywords: ['bangalore','bengaluru','mysore','hubli','mangalore','belgaum'], region: 'South India' },
  { keywords: ['hyderabad','secunderabad','vijayawada','visakhapatnam','vizag','warangal','guntur','tirupati'], region: 'South India' },
  { keywords: ['kochi','thiruvananthapuram','thrissur','kozhikode','calicut','kollam'], region: 'South India' },
  { keywords: ['kolkata','howrah','durgapur','asansol','siliguri'], region: 'East India' },
  { keywords: ['bhubaneswar','cuttack','rourkela','sambalpur'], region: 'East India' },
  { keywords: ['patna','gaya','muzaffarpur','bhagalpur'], region: 'East India' },
  { keywords: ['ranchi','jamshedpur','dhanbad','bokaro'], region: 'East India' },
  { keywords: ['chandigarh','ludhiana','amritsar','jalandhar','patiala'], region: 'North India' },
  { keywords: ['dehradun','haridwar','roorkee','haldwani'], region: 'North India' },
  { keywords: ['goa','panaji','margao','vasco'], region: 'Goa' },
  { keywords: ['raipur','bhilai','bilaspur','durg'], region: 'Chhattisgarh' },
  { keywords: ['guwahati','dibrugarh','silchar'], region: 'North East' },
  { keywords: ['jammu','srinagar','leh'], region: 'J&K' },
]

function resolveRegion(city: string): string {
  const c = city.toLowerCase().trim()
  for (const entry of ROUTE_MATRIX) {
    if (entry.keywords.some(k => c.includes(k) || k.includes(c))) return entry.region
  }
  return 'Other'
}

// POST /api/dispatch/mvd/agents/search
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      from_city   = '',
      to_city     = '',
      vehicle_type = '',
      agent_type  = '',
      name_search = '',
    } = body

    const sb  = getBgtsAdminClient()
    const region = to_city ? resolveRegion(to_city) : ''

    // Pull all active agents
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (sb as any)
      .from('mvd_agents')
      .select('*')
      .neq('status', 'INACTIVE')
      .order('reliability_score', { ascending: false })

    // Name search (partial match on company_name or contact_person)
    if (name_search.trim()) {
      query = query.or(`company_name.ilike.%${name_search.trim()}%,contact_person.ilike.%${name_search.trim()}%`)
    }

    // Fleet type filter
    if (agent_type && agent_type !== 'ALL') {
      // Exact match OR contains pattern for fleet_type
      query = query.eq('fleet_type', agent_type)
    }

    const { data: agents, error } = await query
    if (error) throw error

    let results = agents as Record<string, unknown>[]

    // Client-side region + vehicle filtering (Supabase array contains is tricky across regions)
    if (region && region !== 'Other') {
      results = results.filter(a => {
        const routes = (a.routes_covered as string[]) ?? []
        return routes.some(r => r === region || r === 'PAN India' || r === 'All India')
      })
    }

    if (vehicle_type && vehicle_type !== 'ALL') {
      results = results.filter(a => {
        const types = (a.vehicle_types as string[]) ?? []
        return types.includes(vehicle_type) || types.includes('All Types') || types.some(t => t.toLowerCase().includes('all'))
      })
    }

    // Rank: grade A=3, B=2, C=1 → then reliability_score
    const GRADE_SCORE: Record<string, number> = { A: 3, B: 2, C: 1 }
    results.sort((a, b) => {
      const ga = GRADE_SCORE[(a.grade as string) ?? 'C'] ?? 1
      const gb = GRADE_SCORE[(b.grade as string) ?? 'C'] ?? 1
      if (gb !== ga) return gb - ga
      return ((b.reliability_score as number) ?? 0) - ((a.reliability_score as number) ?? 0)
    })

    return NextResponse.json({
      data:   results,
      region: region || 'Unknown',
      error:  null,
      meta: { from_city, to_city, vehicle_type, agent_type, region, total: results.length }
    })
  } catch (e) {
    return NextResponse.json({ data: null, region: null, error: String(e) }, { status: 500 })
  }
}
