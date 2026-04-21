import { useState } from 'react'
import type { Problem, Difficulty } from '../types'
import { BulkImportModal } from './BulkImportModal'

interface Props {
  problems: Problem[]
  onAddToQueue: (id: string) => void
  onDelete: (id: string) => void
  onBulkImport: (items: Array<{ title: string; leetcodeNumber?: number; difficulty?: Difficulty }>) => { added: number; skipped: number }
}

const DIFFICULTY_COLORS = {
  Easy: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400',
  Medium: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400',
  Hard: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400',
}

const DIFFICULTIES: Array<Difficulty | 'All'> = ['All', 'Easy', 'Medium', 'Hard']

export function ProblemBank({ problems, onAddToQueue, onDelete, onBulkImport }: Props) {
  const [filter, setFilter] = useState<Difficulty | 'All'>('All')
  const [showBulkImport, setShowBulkImport] = useState(false)

  const bank = problems.filter(p => p.status === 'backlog')
  const filtered = filter === 'All' ? bank : bank.filter(p => p.difficulty === filter)

  const sorted = [...filtered].sort((a, b) => {
    if (a.leetcodeNumber && b.leetcodeNumber) return a.leetcodeNumber - b.leetcodeNumber
    if (a.leetcodeNumber) return -1
    if (b.leetcodeNumber) return 1
    return a.title.localeCompare(b.title)
  })

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === d
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {d}
              {d !== 'All' && (
                <span className="ml-1 opacity-60">
                  {bank.filter(p => p.difficulty === d).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowBulkImport(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          Bulk Import
        </button>
      </div>

      {bank.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p className="text-5xl mb-4">📚</p>
          <p className="text-lg font-medium">Your bank is empty</p>
          <p className="text-sm mt-1">Bulk import a list or add problems one by one</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">
          No {filter} problems in the bank
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          {sorted.map(p => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
              <span className="text-xs text-gray-400 dark:text-gray-500 w-8 shrink-0 text-right">
                {p.leetcodeNumber ?? '—'}
              </span>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                {p.url ? (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 truncate transition-colors"
                  >
                    {p.title}
                  </a>
                ) : (
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{p.title}</span>
                )}
                {p.difficulty && (
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full shrink-0 ${DIFFICULTY_COLORS[p.difficulty]}`}>
                    {p.difficulty}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onAddToQueue(p.id)}
                  className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-medium rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  Add to Queue
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showBulkImport && (
        <BulkImportModal
          onImport={onBulkImport}
          onClose={() => setShowBulkImport(false)}
        />
      )}
    </div>
  )
}
