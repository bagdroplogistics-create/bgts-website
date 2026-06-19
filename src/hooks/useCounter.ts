'use client'

import { useState, useEffect, useRef } from 'react'

interface UseCounterOptions {
  start?: number
  duration?: number        // ms
  easing?: 'linear' | 'ease-out'
}

/**
 * Animates a number from `start` to `target` once `active` becomes true.
 * Uses requestAnimationFrame with ease-out cubic for a smooth count-up effect.
 */
export function useCounter(
  target: number,
  active: boolean,
  options: UseCounterOptions = {}
): number {
  const { start = 0, duration = 1800, easing = 'ease-out' } = options
  const [count, setCount] = useState(start)
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active) return

    startTimeRef.current = null

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic: t → 1 - (1 - t)^3
      const eased =
        easing === 'ease-out'
          ? 1 - Math.pow(1 - progress, 3)
          : progress

      const current = Math.round(start + (target - start) * eased)
      setCount(current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [active, target, start, duration, easing])

  return count
}
