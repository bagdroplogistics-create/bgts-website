'use client'

import { useEffect, useRef, useState } from 'react'

// ─── Config — update these when the base figure is re-verified ────────────
const BASE_KM    = 798110        // verified km total as of BASE_DATE
const BASE_DATE  = '2026-06-25'  // date BASE_KM was last confirmed
const DAILY_RATE = 85            // estimated km added per day (active contracts avg)
// ─────────────────────────────────────────────────────────────────────────────

function calcCurrentKm(): number {
  const msPerDay   = 1000 * 60 * 60 * 24
  const daysSince  = Math.floor((Date.now() - new Date(BASE_DATE).getTime()) / msPerDay)
  return BASE_KM + Math.max(0, daysSince) * DAILY_RATE
}

function toIndian(n: number): string {
  return n.toLocaleString('en-IN')
}

export function KmCounter() {
  const target              = calcCurrentKm()
  const [value, setValue]   = useState(BASE_KM)
  const ref                 = useRef<HTMLSpanElement>(null)
  const animated            = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || animated.current) return
        animated.current = true
        observer.disconnect()

        const DURATION = 2200           // ms
        const from     = BASE_KM
        const start    = performance.now()

        const tick = (now: number) => {
          const progress = Math.min((now - start) / DURATION, 1)
          // ease-out cubic — fast start, smooth finish
          const eased    = 1 - Math.pow(1 - progress, 3)
          setValue(Math.round(from + (target - from) * eased))
          if (progress < 1) requestAnimationFrame(tick)
        }

        requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{toIndian(value)}</span>
}
