'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { BookNowButton } from '@/components/ui/BookNowButton'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Tag } from '@/components/ui/Tag'
import { calculateCarbon } from '@/lib/carbon-calculator'
import type { CarbonCalcInput } from '@/types/ekohaul'
import { Leaf, Zap, IndianRupee, Wind, ArrowRight, RotateCcw } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────

const VEHICLE_OPTIONS = [
  { value: '3w',   label: 'Euler HiLoad EV (3-Wheeler, 688 kg)' },
  { value: 'mini', label: 'Tata Ace EV (Mini Truck, 550 kg)' },
  { value: 'scv',  label: 'Switch IeV3 (Small CV, 1,000 kg)' },
  { value: 'icv',  label: 'Tata Ultra E.7 (Intermediate CV, 7,000 kg)' },
]

const DEFAULT_INPUT: CarbonCalcInput = {
  vehicleType: 'mini',
  quantity: 5,
  dailyDistanceKm: 80,
  powerSource: 'grid',
  workingDaysPerMonth: 26,
  dieselPricePerLitre: 95,
  electricityRatePerKwh: 8,
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function fmtNum(n: number) {
  return n.toLocaleString('en-IN')
}

function fmtRs(n: number) {
  if (n >= 10_00_000) return `₹${(n / 10_00_000).toFixed(2)} Cr`
  if (n >= 1_00_000)  return `₹${(n / 1_00_000).toFixed(1)} L`
  return `₹${fmtNum(n)}`
}

// ─── Stat card ────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  color,
  label,
  value,
  sub,
}: {
  icon: React.ElementType
  color: string
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-ink-ghost/10 p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon size={18} aria-hidden="true" />
      </div>
      <p className="font-display font-black text-2xl text-ink-strong mb-0.5">{value}</p>
      <p className="text-sm font-semibold text-ink-strong mb-0.5">{label}</p>
      <p className="text-xs text-ink-muted">{sub}</p>
    </div>
  )
}

// ─── Input field ──────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-ink-strong mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-ink-ghost mt-1">{hint}</p>}
    </div>
  )
}

// ─── Page component ───────────────────────────────────────────────────────

export default function EkoHaulESGPage() {
  const [input, setInput] = useState<CarbonCalcInput>(DEFAULT_INPUT)
  const result = useMemo(() => calculateCarbon(input), [input])

  function update<K extends keyof CarbonCalcInput>(key: K, value: CarbonCalcInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="pt-header min-h-screen bg-surface-page">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div
        className="py-14 md:py-20 border-b border-ink-ghost/10"
        style={{ background: 'linear-gradient(135deg, #0C5B35 0%, #138A4F 60%, #119C97 100%)' }}
      >
        <div className="container-xl">
          <Tag variant="eko" size="sm" className="mb-4 bg-white/15 text-white border-white/20">
            ESG & Carbon Calculator
          </Tag>
          <h1 className="font-display font-black text-4xl md:text-5xl text-white tracking-tight mb-3">
            How much CO₂ will you save?
          </h1>
          <p className="text-white/70 text-lg max-w-xl">
            Model your fleet's monthly carbon reduction and cost savings by switching
            from diesel to BGTS EVs. Results formatted for BRSR reporting.
          </p>
        </div>
      </div>

      <div className="container-xl py-10 md:py-16">
        <div className="grid lg:grid-cols-5 gap-10 items-start">

          {/* ── Input panel ─────────────────────────────────────────── */}
          <aside className="lg:col-span-2 bg-white rounded-2xl border border-ink-ghost/10 p-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-ink-strong">Your fleet inputs</h2>
              <button
                type="button"
                onClick={() => setInput(DEFAULT_INPUT)}
                className="flex items-center gap-1.5 text-xs text-ink-ghost hover:text-eko transition-colors"
              >
                <RotateCcw size={12} aria-hidden="true" />
                Reset
              </button>
            </div>

            <div className="space-y-5">
              {/* Vehicle type */}
              <Field label="Vehicle type">
                <select
                  value={input.vehicleType}
                  onChange={(e) => update('vehicleType', e.target.value as CarbonCalcInput['vehicleType'])}
                  className="w-full border border-ink-ghost/30 rounded-lg px-3 py-2.5 text-sm text-ink-strong focus:outline-none focus:ring-2 focus:ring-eko/40 focus:border-eko"
                >
                  {VEHICLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </Field>

              {/* Quantity */}
              <Field label="Number of vehicles" hint="How many EVs you plan to operate">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={input.quantity}
                    onChange={(e) => update('quantity', Number(e.target.value))}
                    className="flex-1 accent-eko"
                  />
                  <span className="w-12 text-center font-mono font-bold text-ink-strong text-sm">
                    {input.quantity}
                  </span>
                </div>
              </Field>

              {/* Daily distance */}
              <Field label="Daily distance per vehicle (km)">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={20}
                    max={200}
                    step={5}
                    value={input.dailyDistanceKm}
                    onChange={(e) => update('dailyDistanceKm', Number(e.target.value))}
                    className="flex-1 accent-eko"
                  />
                  <span className="w-16 text-center font-mono font-bold text-ink-strong text-sm">
                    {input.dailyDistanceKm} km
                  </span>
                </div>
              </Field>

              {/* Working days */}
              <Field label="Working days per month">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={20}
                    max={31}
                    value={input.workingDaysPerMonth}
                    onChange={(e) => update('workingDaysPerMonth', Number(e.target.value))}
                    className="flex-1 accent-eko"
                  />
                  <span className="w-12 text-center font-mono font-bold text-ink-strong text-sm">
                    {input.workingDaysPerMonth}
                  </span>
                </div>
              </Field>

              {/* Power source */}
              <Field label="EV charging source">
                <div className="grid grid-cols-2 gap-2">
                  {(['grid', 'solar'] as const).map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => update('powerSource', src)}
                      className={`py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                        input.powerSource === src
                          ? 'bg-eko text-white border-eko'
                          : 'bg-white text-ink-body border-ink-ghost/30 hover:border-eko hover:text-eko'
                      }`}
                    >
                      {src === 'grid' ? '🔌 Grid' : '☀️ Solar'}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Diesel price */}
              <Field label="Diesel price (₹/litre)" hint="Current market rate">
                <input
                  type="number"
                  min={70}
                  max={130}
                  value={input.dieselPricePerLitre}
                  onChange={(e) => update('dieselPricePerLitre', Number(e.target.value))}
                  className="w-full border border-ink-ghost/30 rounded-lg px-3 py-2.5 text-sm text-ink-strong font-mono focus:outline-none focus:ring-2 focus:ring-eko/40 focus:border-eko"
                />
              </Field>

              {/* Electricity rate */}
              <Field label="Electricity rate (₹/kWh)" hint="Your commercial tariff">
                <input
                  type="number"
                  min={4}
                  max={15}
                  step={0.5}
                  value={input.electricityRatePerKwh}
                  onChange={(e) => update('electricityRatePerKwh', Number(e.target.value))}
                  className="w-full border border-ink-ghost/30 rounded-lg px-3 py-2.5 text-sm text-ink-strong font-mono focus:outline-none focus:ring-2 focus:ring-eko/40 focus:border-eko"
                />
              </Field>
            </div>
          </aside>

          {/* ── Results panel ─────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-6">

            {result ? (
              <>
                {/* Headline summary */}
                <div
                  className="rounded-2xl p-6 text-white"
                  style={{ background: 'linear-gradient(135deg, #0C5B35, #138A4F)' }}
                >
                  <p className="text-white/70 text-sm mb-1">
                    {input.quantity} × {result.vehicleLabel} · {input.dailyDistanceKm} km/day
                    · {input.workingDaysPerMonth} days/month · {input.powerSource} charging
                  </p>
                  <p className="font-display font-black text-5xl text-eko-lime mb-1">
                    {fmtNum(result.co2AvoidedKgPerMonth)} kg
                  </p>
                  <p className="text-white/80 text-lg">CO₂ avoided per month</p>
                  <p className="text-white/50 text-sm mt-1">
                    {result.co2ReductionPercent}% reduction vs equivalent diesel fleet
                  </p>
                </div>

                {/* 4-stat grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <StatCard
                    icon={Leaf}
                    color="bg-eko/10 text-eko"
                    label="CO₂ avoided"
                    value={`${fmtNum(result.co2AvoidedKgPerMonth)} kg`}
                    sub={`per month · ${result.co2ReductionPercent}% reduction`}
                  />
                  <StatCard
                    icon={IndianRupee}
                    color="bg-saffron/10 text-saffron"
                    label="Monthly cost saving"
                    value={fmtRs(result.savingRsPerMonth)}
                    sub={`${result.savingPercent}% vs diesel · ${fmtRs(result.savingRsPerYear)}/year`}
                  />
                  <StatCard
                    icon={Zap}
                    color="bg-eko/10 text-eko"
                    label="Trees equivalent"
                    value={fmtNum(result.treesEquivalent)}
                    sub="mature trees absorbing equivalent CO₂/year"
                  />
                  <StatCard
                    icon={Wind}
                    color="bg-sky-100 text-sky-600"
                    label="PM2.5 avoided"
                    value={`${fmtNum(result.pm25AvoidedGPerMonth)} g`}
                    sub="particulate matter per month (BS6 diesel baseline)"
                  />
                </div>

                {/* Detailed breakdown */}
                <div className="bg-white rounded-2xl border border-ink-ghost/10 p-6">
                  <h3 className="font-display font-bold text-ink-strong mb-5">
                    Monthly comparison
                  </h3>

                  <div className="space-y-4">
                    {/* CO2 bar chart */}
                    <div>
                      <div className="flex justify-between text-xs text-ink-muted mb-1.5">
                        <span>Diesel CO₂</span>
                        <span className="font-mono font-semibold text-brick">
                          {fmtNum(result.dieselCO2KgPerMonth)} kg
                        </span>
                      </div>
                      <div className="h-2.5 bg-ink-ghost/10 rounded-full overflow-hidden">
                        <div className="h-full bg-brick/70 rounded-full w-full" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-ink-muted mb-1.5">
                        <span>EV CO₂ ({input.powerSource})</span>
                        <span className="font-mono font-semibold text-eko">
                          {fmtNum(result.evCO2KgPerMonth)} kg
                        </span>
                      </div>
                      <div className="h-2.5 bg-ink-ghost/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-eko rounded-full"
                          style={{
                            width: `${Math.max(1, (result.evCO2KgPerMonth / result.dieselCO2KgPerMonth) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Cost comparison */}
                    <div className="border-t border-ink-ghost/10 pt-4 mt-4">
                      <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
                        Fuel cost comparison
                      </h4>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-brick/5 rounded-lg p-3 border border-brick/10">
                          <p className="text-xs text-ink-ghost mb-1">Diesel cost</p>
                          <p className="font-mono font-bold text-brick text-sm">
                            {fmtRs(result.dieselCostRsPerMonth)}
                          </p>
                          <p className="text-2xs text-ink-ghost">per month</p>
                        </div>
                        <div className="bg-eko/5 rounded-lg p-3 border border-eko/10">
                          <p className="text-xs text-ink-ghost mb-1">EV cost</p>
                          <p className="font-mono font-bold text-eko text-sm">
                            {fmtRs(result.evCostRsPerMonth)}
                          </p>
                          <p className="text-2xs text-ink-ghost">per month</p>
                        </div>
                        <div className="bg-eko-50 rounded-lg p-3 border border-eko/20">
                          <p className="text-xs text-ink-ghost mb-1">You save</p>
                          <p className="font-mono font-bold text-eko text-sm">
                            {fmtRs(result.savingRsPerMonth)}
                          </p>
                          <p className="text-2xs text-eko">{result.savingPercent}% less</p>
                        </div>
                      </div>
                    </div>

                    {/* Monthly distance */}
                    <div className="border-t border-ink-ghost/10 pt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-ink-muted">Total fleet distance/month</span>
                        <span className="font-mono font-bold text-ink-strong">
                          {fmtNum(result.monthlyDistanceKm)} km
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BRSR note */}
                <div className="bg-eko-50 border border-eko/15 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-eko uppercase tracking-wider mb-2">
                    BRSR Report Usage
                  </p>
                  <p className="text-sm text-ink-body leading-relaxed">
                    These figures can be directly used in your SEBI BRSR (Business
                    Responsibility & Sustainability Report) under Principle 6 — Responsible
                    towards and Respectful of Environment. EkoHaul's DediEV and FleetEV plans
                    include monthly auto-generated BRSR data exports.
                  </p>
                </div>

                {/* CTA */}
                <div className="flex flex-wrap gap-3">
                  <BookNowButton variant="eko" size="lg" modalType="ev">
                    Book Now — {input.quantity} vehicles
                  </BookNowButton>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-eko hover:bg-eko/10"
                    asChild
                  >
                    <Link href="/BGTSEV">View Fleet Plans</Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-ink-ghost/10 p-10 text-center">
                <p className="text-ink-muted">
                  Adjust inputs on the left to see your carbon and cost savings.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
