import type { Problem } from '../types'
import { daysOverdue, rankProblems, STAGE_LABELS, today } from '../utils/scheduling'
import { ProblemCard } from './ProblemCard'

function formatUpcomingDate(dateStr: string): string {
  const days = Math.abs(daysOverdue(dateStr))
  const d = new Date(dateStr + 'T00:00:00')
  const weekday = d.toLocaleDateString('en-GB', { weekday: 'short' })
  const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `in ${days === 1 ? '1 day' : `${days} days`} · ${date} · ${weekday}`
}

const STAGE_DOTS = [0, 1, 2, 3, 4]

interface Props {
  problems: Problem[]
  onSolved: (id: string) => void
  onFailed: (id: string) => void
  onMoveToBank: (id: string) => void
  onDelete: (id: string) => void
}

export function Dashboard({ problems, onSolved, onFailed, onMoveToBank, onDelete }: Props) {
  const t = today()
  const solvedToday = problems.filter(p =>
    p.reviews.some(r => r.completedDate === t && r.result !== null)
  )

  const active = problems.filter(p => p.status === 'active')
  const due = active.filter(p => daysOverdue(p.nextReviewDate) >= 0)
  const upcoming = active.filter(p => daysOverdue(p.nextReviewDate) < 0).sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate))

  const ranked = rankProblems(due)

  if (active.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 dark:text-gray-500">
        <p className="text-5xl mb-4">🧩</p>
        <p className="text-lg font-medium">No problems yet</p>
        <p className="text-sm mt-1">Add a problem to get started</p>
      </div>
    )
  }

  return (
    <div className="flex gap-6 items-start">
      {/* Left: Due Now queue */}
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Due Now · {ranked.length}
        </h2>
        {ranked.length > 0 ? (
          <div className="space-y-3">
            {ranked.map(p => (
              <ProblemCard
                key={p.id}
                problem={p}
                onSolved={() => onSolved(p.id)}
                onFailed={() => onFailed(p.id)}
                onMoveToBank={() => onMoveToBank(p.id)}
                onDelete={() => onDelete(p.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">
            <p className="text-4xl mb-3">✅</p>
            <p className="font-medium">All caught up for today!</p>
          </div>
        )}
      </div>

      {/* Right: Done Today + Upcoming */}
      <div className="w-72 shrink-0 space-y-6">
        {solvedToday.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Done Today · {solvedToday.length}
            </h2>
            <div className="space-y-1.5">
              {solvedToday.map(p => {
                const lastResult = [...p.reviews].reverse().find(r => r.completedDate === t)?.result
                const solved = lastResult === 'solved'
                return (
                  <div key={p.id} className={`border rounded-lg px-3 py-2 flex items-center justify-between ${
                    solved
                      ? 'bg-green-200 dark:bg-green-900/40 border-green-300 dark:border-green-800'
                      : 'bg-red-200 dark:bg-red-900/40 border-red-300 dark:border-red-800'
                  }`}>
                    <span className={`text-sm font-medium truncate ${solved ? 'text-green-900 dark:text-green-300' : 'text-red-900 dark:text-red-300'}`}>
                      {p.leetcodeNumber ? `${p.leetcodeNumber}. ` : ''}{p.title}
                    </span>
                    <span className={`text-xs font-semibold ml-2 shrink-0 ${solved ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                      {solved ? `S${p.currentStage}` : 'fail'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Upcoming · {upcoming.length}
            </h2>
            <div className="space-y-1.5">
              {upcoming.map(p => (
                <div key={p.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                      {p.leetcodeNumber ? `${p.leetcodeNumber}. ` : ''}{p.title}
                    </span>
                    {p.difficulty && (
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                        p.difficulty === 'Easy' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        p.difficulty === 'Medium' ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400' :
                        'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {p.difficulty}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1">
                      {STAGE_DOTS.map(i => {
                        const isDone = i < p.currentStage
                        const isCurrent = i === p.currentStage
                        return (
                          <span
                            key={i}
                            title={STAGE_LABELS[i as keyof typeof STAGE_LABELS]}
                            className={`inline-block w-1.5 h-1.5 rounded-full ${
                              isDone ? 'bg-indigo-500' : isCurrent ? 'bg-indigo-300' : 'bg-gray-200 dark:bg-gray-600'
                            }`}
                          />
                        )
                      })}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400 dark:text-gray-500">{formatUpcomingDate(p.nextReviewDate)}</div>
                      <div className="text-xs text-gray-300 dark:text-gray-600">{p.nextReviewDate}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
