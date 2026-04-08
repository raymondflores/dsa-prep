import { useState, useCallback } from 'react'
import type { Problem, ReviewStage, Difficulty } from './types'
import { today, addDays, STAGE_INTERVALS } from './utils/scheduling'

const STORAGE_KEY = 'dsa-prep-problems'

function loadProblems(): Problem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveProblems(problems: Problem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(problems))
}

function generateId(): string {
  return crypto.randomUUID()
}

function isDuplicate(problems: Problem[], title: string, leetcodeNumber?: number): Problem | undefined {
  return problems.find(p => {
    if (leetcodeNumber && p.leetcodeNumber === leetcodeNumber) return true
    return p.title.trim().toLowerCase() === title.trim().toLowerCase()
  })
}

export function useProblems() {
  const [problems, setProblems] = useState<Problem[]>(loadProblems)

  const update = useCallback((next: Problem[]) => {
    saveProblems(next)
    setProblems(next)
  }, [])

  // Add a single problem. Destination: 'backlog' by default, 'active' if addToQueue=true.
  const addProblem = useCallback((fields: {
    title: string
    leetcodeNumber?: number
    url?: string
    difficulty?: Difficulty
    addToQueue?: boolean
  }): string | null => {
    const dup = isDuplicate(problems, fields.title, fields.leetcodeNumber)
    if (dup) {
      return dup.status === 'completed'
        ? `"${dup.title}" is already completed.`
        : dup.status === 'active'
        ? `"${dup.title}" is already in your queue.`
        : `"${dup.title}" is already in your bank.`
    }
    const isActive = !!fields.addToQueue
    const problem: Problem = {
      id: generateId(),
      title: fields.title,
      leetcodeNumber: fields.leetcodeNumber,
      url: fields.url,
      difficulty: fields.difficulty,
      addedAt: today(),
      status: isActive ? 'active' : 'backlog',
      currentStage: 0,
      nextReviewDate: today(),
      reviews: [],
    }
    update([...problems, problem])
    return null
  }, [problems, update])

  // Bulk add many problems to the bank (skips duplicates).
  // Returns { added, skipped }.
  const bulkAddToBank = useCallback((items: Array<{
    title: string
    leetcodeNumber?: number
    difficulty?: Difficulty
    url?: string
  }>): { added: number; skipped: number } => {
    const toAdd: Problem[] = []
    let skipped = 0
    const seen = new Set<string>() // track within this batch too
    for (const item of items) {
      const key = item.title.trim().toLowerCase()
      if (isDuplicate(problems, item.title, item.leetcodeNumber) || seen.has(key)) {
        skipped++
        continue
      }
      seen.add(key)
      toAdd.push({
        id: generateId(),
        title: item.title.trim(),
        leetcodeNumber: item.leetcodeNumber,
        url: item.url,
        difficulty: item.difficulty,
        addedAt: today(),
        status: 'backlog',
        currentStage: 0,
        nextReviewDate: today(),
        reviews: [],
      })
    }
    if (toAdd.length > 0) update([...problems, ...toAdd])
    return { added: toAdd.length, skipped }
  }, [problems, update])

  // Move a backlog problem into the active queue (fresh start).
  const addToQueue = useCallback((id: string) => {
    const t = today()
    update(problems.map(p =>
      p.id === id
        ? { ...p, status: 'active' as const, currentStage: 0, nextReviewDate: t, reviews: [] }
        : p
    ))
  }, [problems, update])

  // Move an active problem back to the bank (resets progress).
  const moveToBank = useCallback((id: string) => {
    update(problems.map(p =>
      p.id === id
        ? { ...p, status: 'backlog' as const, currentStage: 0, reviews: [] }
        : p
    ))
  }, [problems, update])

  const markSolved = useCallback((id: string) => {
    const t = today()
    const next = problems.map(p => {
      if (p.id !== id) return p
      const review = {
        stage: p.currentStage,
        scheduledDate: p.nextReviewDate,
        completedDate: t,
        result: 'solved' as const,
      }
      if (p.currentStage === 4) {
        return { ...p, status: 'completed' as const, reviews: [...p.reviews, review] }
      }
      const nextStage = (p.currentStage + 1) as ReviewStage
      const nextDate = addDays(t, STAGE_INTERVALS[p.currentStage])
      return {
        ...p,
        currentStage: nextStage,
        nextReviewDate: nextDate,
        reviews: [...p.reviews, review],
      }
    })
    update(next)
  }, [problems, update])

  const markFailed = useCallback((id: string) => {
    const t = today()
    const next = problems.map(p => {
      if (p.id !== id) return p
      const review = {
        stage: p.currentStage,
        scheduledDate: p.nextReviewDate,
        completedDate: t,
        result: 'failed' as const,
      }
      return {
        ...p,
        nextReviewDate: addDays(t, 1),
        reviews: [...p.reviews, review],
      }
    })
    update(next)
  }, [problems, update])

  const deleteProblem = useCallback((id: string) => {
    update(problems.filter(p => p.id !== id))
  }, [problems, update])

  return { problems, addProblem, bulkAddToBank, addToQueue, moveToBank, markSolved, markFailed, deleteProblem }
}
