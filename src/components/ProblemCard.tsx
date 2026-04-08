import type { Problem } from '../types'
import { daysOverdue, STAGE_LABELS } from '../utils/scheduling'

interface Props {
  problem: Problem
  onSolved: () => void
  onFailed: () => void
  onMoveToBank: () => void
  onDelete: () => void
}

const DIFFICULTY_COLORS = {
  Easy: 'text-emerald-600 bg-emerald-50',
  Medium: 'text-amber-600 bg-amber-50',
  Hard: 'text-red-600 bg-red-50',
}

const STAGE_DOTS = [0, 1, 2, 3, 4]

export function ProblemCard({ problem, onSolved, onFailed, onMoveToBank, onDelete }: Props) {
  const overdue = daysOverdue(problem.nextReviewDate)
  const isOverdue = overdue > 0
  const isDueToday = overdue === 0
  const failCount = problem.reviews.filter(r => r.result === 'failed').length

  const titleEl = problem.url ? (
    <a
      href={problem.url}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
    >
      {problem.leetcodeNumber ? `${problem.leetcodeNumber}. ` : ''}{problem.title}
    </a>
  ) : (
    <span className="font-semibold text-gray-900">
      {problem.leetcodeNumber ? `${problem.leetcodeNumber}. ` : ''}{problem.title}
    </span>
  )

  return (
    <div className={`bg-white rounded-xl border ${isOverdue ? 'border-red-200' : 'border-gray-200'} p-4 shadow-sm`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {titleEl}
            {problem.difficulty && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[problem.difficulty]}`}>
                {problem.difficulty}
              </span>
            )}
          </div>

          {/* Stage progress dots */}
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs text-gray-400 mr-1">Stage:</span>
            {STAGE_DOTS.map(i => {
              const isDone = i < problem.currentStage
              const isCurrent = i === problem.currentStage
              return (
                <span
                  key={i}
                  title={STAGE_LABELS[i as keyof typeof STAGE_LABELS]}
                  className={`inline-block w-2.5 h-2.5 rounded-full transition-all ${
                    isDone
                      ? 'bg-indigo-500'
                      : isCurrent
                      ? 'bg-indigo-300 ring-2 ring-indigo-300 ring-offset-1'
                      : 'bg-gray-200'
                  }`}
                />
              )
            })}
            <span className="text-xs text-gray-500 ml-1">{STAGE_LABELS[problem.currentStage]}</span>
          </div>

          {/* Due status + fail count */}
          <div className="mt-1 flex items-center gap-3">
            {isOverdue ? (
              <span className="text-xs font-medium text-red-600">
                {overdue === 1 ? '1 day overdue' : `${overdue} days overdue`}
              </span>
            ) : isDueToday ? (
              <span className="text-xs font-medium text-indigo-600">Due today</span>
            ) : null}
            {failCount > 0 && (
              <span className="text-xs text-red-400">{failCount} {failCount === 1 ? 'fail' : 'fails'}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onSolved}
            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Solved
          </button>
          <button
            onClick={onFailed}
            className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg hover:bg-red-200 transition-colors"
          >
            Failed
          </button>
          <button
            onClick={onMoveToBank}
            className="p-1.5 text-gray-300 hover:text-amber-500 transition-colors"
            title="Move to Bank"
          >
            {/* inbox/archive icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
              <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-300 hover:text-gray-500 transition-colors"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
