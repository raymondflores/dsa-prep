import type { Problem } from '../types'

interface Props {
  problems: Problem[]
  onDelete: (id: string) => void
}

const DIFFICULTY_COLORS = {
  Easy: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400',
  Medium: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400',
  Hard: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400',
}

export function CompletedList({ problems, onDelete }: Props) {
  const completed = problems.filter(p => p.status === 'completed')

  if (completed.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 dark:text-gray-500">
        <p className="text-5xl mb-4">🏆</p>
        <p className="text-lg font-medium">Nothing completed yet</p>
        <p className="text-sm mt-1">Finish the 14-day review cycle to see problems here</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Completed · {completed.length}
      </h2>
      <div className="space-y-2">
        {completed.map(p => {
          const completedReview = p.reviews.find(r => r.stage === 4 && r.result === 'solved')
          const completedDate = completedReview?.completedDate ?? p.addedAt
          return (
            <div key={p.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {p.leetcodeNumber ? `${p.leetcodeNumber}. ` : ''}{p.title}
                </span>
                {p.difficulty && (
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${DIFFICULTY_COLORS[p.difficulty]}`}>
                    {p.difficulty}
                  </span>
                )}
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-full">
                  Mastered
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-gray-400 dark:text-gray-500">{completedDate}</span>
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                  >
                    LC ↗
                  </a>
                )}
                <button
                  onClick={() => onDelete(p.id)}
                  className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
                  title="Remove"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
