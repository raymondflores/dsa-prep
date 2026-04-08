import type { ReviewStage } from '../types'

// Days to add when advancing to the next stage (after solving)
export const STAGE_INTERVALS: Record<ReviewStage, number> = {
  0: 1,  // after initial solve → review in 1 day
  1: 3,  // after 1-day review → review in 3 days
  2: 7,  // after 3-day review → review in 7 days
  3: 14, // after 7-day review → review in 14 days
  4: 0,  // after 14-day review → completed (unused)
}

export const STAGE_LABELS: Record<ReviewStage, string> = {
  0: 'Initial',
  1: '+1 day',
  2: '+3 days',
  3: '+7 days',
  4: '+14 days',
}

export function today(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function addDays(date: string, days: number): string {
  const d = new Date(date + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function daysOverdue(nextReviewDate: string): number {
  const t = today()
  const due = new Date(nextReviewDate + 'T00:00:00')
  const now = new Date(t + 'T00:00:00')
  const diff = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
  return diff // positive = overdue, 0 = due today, negative = future
}

// Sort problems: in-progress (stage > 0) before fresh stage 0, then most overdue within each group
export function rankProblems<T extends { nextReviewDate: string; currentStage: ReviewStage; reviews: { result: string | null }[] }>(problems: T[]): T[] {
  return [...problems].sort((a, b) => {
    const inProgressA = a.currentStage > 0 ? 0 : 1
    const inProgressB = b.currentStage > 0 ? 0 : 1
    if (inProgressA !== inProgressB) return inProgressA - inProgressB
    return daysOverdue(b.nextReviewDate) - daysOverdue(a.nextReviewDate)
  })
}
