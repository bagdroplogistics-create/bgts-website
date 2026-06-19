import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ─── Tailwind class merger ───────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Number formatters ────────────────────────────────────────────────────
export function formatRs(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)} Cr`
    if (amount >= 100_000)   return `₹${(amount / 100_000).toFixed(1)} L`
    if (amount >= 1_000)     return `₹${(amount / 1_000).toFixed(1)}K`
  }
  return `₹${new Intl.NumberFormat('en-IN').format(Math.round(amount))}`
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-IN').format(n)
}

export function formatWeight(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} MT`
  return `${kg} kg`
}

// ─── Date utils ───────────────────────────────────────────────────────────
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date)
  let added = 0
  while (added < days) {
    result.setDate(result.getDate() + 1)
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      added++
    }
  }
  return result
}

// ─── String utils ─────────────────────────────────────────────────────────
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen - 3) + '...'
}

// ─── Random LR number generator ──────────────────────────────────────────
export function generateLRNumber(): string {
  const prefix = 'BGTS'
  const year = new Date().getFullYear().toString().slice(-2)
  const random = Math.floor(100000 + Math.random() * 900000)
  return `${prefix}${year}${random}`
}

// ─── Clamp ───────────────────────────────────────────────────────────────
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ─── Delay ────────────────────────────────────────────────────────────────
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
