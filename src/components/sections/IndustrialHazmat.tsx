// Server component — no client state needed

import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, Zap, Award, Truck, AlertTriangle, CheckCircle } from 'lucide-react'
import { KmCounter } from '@/components/ui/KmCounter'

// ─── Hazmat Stats ──────────────────────────────────────────────────────────

const HAZMAT_STATS = [
  {
    value: '30+',
    label: 'Years of Hazardous Goods Experience',
    sub: 'Since 1995',
  },
  {
    value: '7,98,110',
    label: 'KM Hazardous Cargo Transported',
    sub: 'All contracts 1995–2026',
    isKm: true,
  },
  {
    value: '0',
    label: 'Safety Incidents on Record',
    sub: 'Across all contracts 1995–2026',
  },
  {
    value: '6+',
    label: 'Major PSU & Government Clients',
    sub: 'RMC · GSECL · NTPC · GACL · Indian Railways · Sun Pharma',
  },
]

// ─── PSU Clients ───────────────────────────────────────────────────────────

const PSU_CLIENTS = [
  { abbr: 'RMC',   name: 'Rajkot Municipal Corporation',   type: 'Govt. of Gujarat',      color: 'bg-blue-600'   },
  { abbr: 'GSECL', name: 'Gujarat State Electricity Corp.', type: 'Gujarat PSU',           color: 'bg-orange-600' },
  { abbr: 'NTPC',  name: 'NTPC Ltd. — Jhanor Gandhar',     type: 'Govt. of India PSU',    color: 'bg-green-700'  },
  { abbr: 'GACL',  name: 'Gujarat Alkalies & Chemicals',   type: 'Gujarat PSU',           color: 'bg-purple-700' },
  { abbr: 'IR',    name: 'Indian Railways — Western Rly.', type: 'Govt. of India',        color: 'bg-sky-700'    },
  { abbr: 'SP',    name: 'Sun Pharmaceutical Ind.',        type: 'Fortune 500 — Listed',  color: 'bg-red-700'    },
]

// ─── Hazmat Materials ─────────────────────────────────────────────────────

const MATERIALS = [
  {
    icon: '⚗️',
    name: 'Liquid Chlorine',
    class: 'Class 2.3 — Toxic Gas',
    desc: '900 kg tonners & cylinders · 30 years of documented RMC hauls',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  {
    icon: '💨',
    name: 'Hydrogen Gas',
    class: 'Class 2.1 — Flammable Gas',
    desc: 'Pressurised cylinders · NTPC Jhanor Gas Power Project',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    icon: '🧪',
    name: 'Industrial Chemicals',
    class: 'Class 8 — Corrosive',
    desc: 'Caustic soda, process chemicals · GACL CSL multi-route contract',
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  {
    icon: '💎',
    name: 'Specialty Materials',
    class: 'Catalysts & Precision Components',
    desc: 'Palladium catalyst · Cathode & anode pans · GACL Dahej Complex',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    icon: '💊',
    name: 'Pharma Materials',
    class: 'Regulated Pharmaceutical',
    desc: 'API transport · Sun Pharmaceutical Ankleshwar · e-Way bill compliant',
    badge: 'bg-green-100 text-green-800 border-green-200',
  },
  {
    icon: '⚙️',
    name: 'Heavy Industrial Equipment',
    class: 'Special Handling Cargo',
    desc: 'Electrolyser components · 3–5 MT/trip · GACL Dahej special hauls',
    badge: 'bg-gray-100 text-gray-800 border-gray-200',
  },
]

// ─── Compliance Cards ─────────────────────────────────────────────────────

const COMPLIANCE = [
  { icon: '🛡️', title: 'CMVR Hazmat Compliant',     desc: 'Central Motor Vehicles Rules for hazardous goods followed on 100% of hauls.' },
  { icon: '🔰', title: 'CCE Rules Compliant',        desc: 'Chief Controller of Explosives regulations met for all applicable cargo types.' },
  { icon: '📡', title: 'AIS-140 GPS Enabled',        desc: 'All vehicles fitted with government-mandated GPS for real-time trip tracking.' },
  { icon: '📄', title: 'Transit Insurance',          desc: 'Full transit and third-party insurance active on every hazmat shipment.' },
  { icon: '🦺', title: 'PPE Equipped Fleet',         desc: 'Drivers and loaders carry full Personal Protective Equipment on every haul.' },
  { icon: '🚨', title: 'TREM Cards Available',       desc: 'Transport Emergency cards on board for all vehicles carrying hazardous goods.' },
  { icon: '📋', title: 'GST Registered',             desc: 'GST compliant with e-way bills generated for every commercial movement.' },
  { icon: '🏅', title: 'MSME Certified',             desc: 'Registered MSME vendor eligible for government and PSU procurement.' },

]

// ─── Why Choose ───────────────────────────────────────────────────────────

const WHY_CHOOSE = [
  {
    icon: Award,
    title: '30+ Years Experience',
    desc: 'Serving industrial and hazardous logistics since 1995. First work order: Liquid Chlorine, Rajkot Municipal Corporation.',
    color: 'text-brand bg-brand/10',
  },
  {
    icon: ShieldCheck,
    title: 'Zero Incident Record',
    desc: 'Documented safety-first operations across every contract. CMVR Hazmat rules followed on 100% of hauls.',
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    icon: Zap,
    title: 'PSU & Govt. Trusted',
    desc: 'Long-term contracts with NTPC, GSECL, GACL, RMC, and Indian Railways — the most demanding clients in India.',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    icon: Truck,
    title: 'Specialized Fleet',
    desc: 'Vehicles equipped with TREM cards, PPE kits, and GPS for hazardous and industrial cargo movement.',
    color: 'text-purple-600 bg-purple-50',
  },
]

// ─── Component ────────────────────────────────────────────────────────────

export function IndustrialHazmat() {
  return (
    <div id="industrial-hazmat">

      {/* ── 1. Dark Hero Banner ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0D1117] py-20 md:py-28">
        {/* Background image */}
        <Image
          src="/bgts-hero-3.jpg"
          alt="BGTS industrial hazardous cargo transport"
          fill
          className="object-cover object-center"
          priority={false}
          sizes="100vw"
          aria-hidden="true"
        />
        {/* Dark gradient overlay — 80% opacity for strong text contrast */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, rgba(13,17,23,0.88) 0%, rgba(13,17,23,0.72) 55%, rgba(13,17,23,0.55) 100%)',
          }}
          aria-hidden="true"
        />
        {/* Subtle warm vignette at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: 'linear-gradient(to top, rgba(13,17,23,0.95), transparent)' }}
          aria-hidden="true"
        />
        {/* Orange accent line top */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand via-orange-400 to-brand" aria-hidden="true" />

        <div className="container-xl relative z-10">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/15 border border-brand/30 mb-6">
              <AlertTriangle size={12} className="text-brand" aria-hidden="true" />
              <span className="text-brand text-xs font-bold uppercase tracking-widest">
                Industrial & Hazardous Goods Transport
              </span>
            </div>

            <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-white tracking-tight leading-[1.0] mb-6">
              Trusted by India's Largest PSUs<br />
              <span className="text-brand">for 30+ Years of Safe Haul</span>
            </h2>

            <p className="text-white/65 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl">
              BGTS has safely transported hazardous chemicals, industrial gases, specialty cargo,
              and critical industrial materials across India since 1995 — with zero safety incidents
              and formal completion certificates from Central and State Government clients.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand/90 shadow-lg shadow-brand/30 transition-all hover:-translate-y-0.5"
              >
                Explore Industrial Logistics
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/15 transition-all hover:-translate-y-0.5"
              >
                View Capability Statement
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Hazmat Stats Strip ───────────────────────────────────────── */}
      <section className="bg-[#161B22] border-b border-white/5">
        <div className="container-xl py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {HAZMAT_STATS.map((s, i) => (
              <div key={i} className="bg-[#161B22] px-6 py-8">
                <p className="font-display font-black text-3xl md:text-4xl text-brand mb-1 leading-none">
                  {s.isKm ? <KmCounter /> : s.value}
                </p>
                <p className="text-white font-bold text-sm mb-1.5 leading-snug">{s.label}</p>
                <p className="text-white/35 text-[11px] leading-snug">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. PSU Trusted By ────────────────────────────────────────────── */}
      <section className="section-py bg-surface-page" aria-labelledby="psu-heading">
        <div className="container-xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/8 border border-brand/15 mb-4">
              <span className="text-brand text-xs font-bold uppercase tracking-widest">Client Portfolio</span>
            </div>
            <h2 id="psu-heading" className="font-display font-black text-3xl md:text-4xl text-ink-strong mb-3">
              Trusted by Government, PSU &amp; Industrial Leaders
            </h2>
            <p className="text-ink-muted text-lg max-w-2xl mx-auto">
              Delivering mission-critical industrial logistics for government agencies, power plants,
              chemical manufacturers, and Fortune 500 companies.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PSU_CLIENTS.map((c) => (
              <div
                key={c.abbr}
                className="group bg-white rounded-2xl border border-ink-ghost/10 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${c.color} flex items-center justify-center shrink-0`}>
                    <span className="font-display font-black text-white text-sm">{c.abbr}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-ink-strong text-sm leading-tight">{c.name}</p>
                    <p className="text-xs text-ink-muted mt-0.5">{c.type}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <CheckCircle size={11} className="text-emerald-500 shrink-0" aria-hidden="true" />
                  <span className="text-[10px] text-emerald-700 font-semibold">Active / Completed Contract</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Materials Expertise ───────────────────────────────────────── */}
      <section className="section-py bg-gray-50 border-y border-ink-ghost/8" aria-labelledby="materials-heading">
        <div className="container-xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/8 border border-brand/15 mb-4">
              <span className="text-brand text-xs font-bold uppercase tracking-widest">Hazmat Expertise</span>
            </div>
            <h2 id="materials-heading" className="font-display font-black text-3xl md:text-4xl text-ink-strong mb-3">
              Hazardous Materials We Handle
            </h2>
            <p className="text-ink-muted max-w-xl mx-auto">
              Full compliance under CMVR Hazardous Goods Rules across every category. Documented, certified, and insured.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MATERIALS.map((m) => (
              <div
                key={m.name}
                className="bg-white rounded-2xl border border-ink-ghost/10 p-5 hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3" aria-hidden="true">{m.icon}</div>
                <div className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full border mb-2 ${m.badge}`}>
                  {m.class}
                </div>
                <h3 className="font-display font-bold text-base text-ink-strong mb-1.5">{m.name}</h3>
                <p className="text-xs text-ink-muted leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Safety & Compliance Grid ──────────────────────────────────── */}
      <section className="section-py bg-[#0D1117]" aria-labelledby="compliance-heading">
        <div className="container-xl">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/15 border border-brand/30 mb-4">
              <ShieldCheck size={12} className="text-brand" aria-hidden="true" />
              <span className="text-brand text-xs font-bold uppercase tracking-widest">Certifications & Standards</span>
            </div>
            <h2 id="compliance-heading" className="font-display font-black text-3xl md:text-4xl text-white mb-3">
              Safety &amp; Compliance — Every Haul, Every Time
            </h2>
            <p className="text-white/50 text-base max-w-xl mx-auto">
              Every vehicle, every driver, every route — fully compliant with Indian and international hazardous goods standards.
            </p>
          </div>

          {/* 4 × 4 Card Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {COMPLIANCE.map((item) => (
              <div
                key={item.title}
                className="group flex flex-col bg-white/5 border border-white/8 rounded-2xl p-5
                           hover:bg-white/10 hover:border-brand/40 hover:-translate-y-0.5
                           transition-all duration-200"
              >
                <span className="text-2xl mb-3 leading-none" aria-hidden="true">{item.icon}</span>
                <h3 className="font-display font-bold text-sm text-white mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-white/45 text-xs leading-relaxed flex-1">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 6. Why Industries Choose BGTS ───────────────────────────────── */}
      <section className="section-py bg-surface-page" aria-labelledby="why-bgts-heading">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 id="why-bgts-heading" className="font-display font-black text-3xl md:text-4xl text-ink-strong mb-3">
              Why Industries Choose BGTS
            </h2>
            <p className="text-ink-muted max-w-lg mx-auto">
              Decades of specialized experience trusted by the most demanding clients in India.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY_CHOOSE.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-ink-ghost/10 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon size={20} aria-hidden="true" />
                </div>
                <h3 className="font-display font-bold text-base text-ink-strong mb-2">{title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
