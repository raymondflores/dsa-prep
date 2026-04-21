import { useEffect, useState } from 'react'
import { useProblems } from './store'
import { daysOverdue } from './utils/scheduling'
import { Dashboard } from './components/Dashboard'
import { ProblemBank } from './components/ProblemBank'
import { CompletedList } from './components/CompletedList'
import { AddProblemModal } from './components/AddProblemModal'

type Tab = 'queue' | 'bank' | 'completed'

function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem('dark-mode') === 'true')
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('dark-mode', String(dark))
  }, [dark])
  return [dark, setDark] as const
}

export default function App() {
  const { problems, addProblem, bulkAddToBank, addToQueue, moveToBank, markSolved, markFailed, deleteProblem } = useProblems()
  const [tab, setTab] = useState<Tab>('queue')
  const [showAdd, setShowAdd] = useState(false)
  const [dark, setDark] = useDarkMode()

  const dueCount = problems.filter(
    p => p.status === 'active' && daysOverdue(p.nextReviewDate) >= 0
  ).length
  const bankCount = problems.filter(p => p.status === 'backlog').length
  const completedCount = problems.filter(p => p.status === 'completed').length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">DSA Review</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Spaced repetition for LeetCode</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark(d => !d)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Problem
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
          {([
            { key: 'queue', label: 'Queue', badge: dueCount, badgeColor: 'bg-indigo-600' },
            { key: 'bank', label: 'Bank', badge: bankCount, badgeColor: 'bg-gray-500' },
            { key: 'completed', label: 'Completed', badge: completedCount, badgeColor: 'bg-emerald-500' },
          ] as const).map(({ key, label, badge, badgeColor }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === key
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {label}
              {badge > 0 && (
                <span className={`${badgeColor} text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center leading-none`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'queue' && (
          <Dashboard
            problems={problems}
            onSolved={markSolved}
            onFailed={markFailed}
            onMoveToBank={moveToBank}
            onDelete={deleteProblem}
          />
        )}
        {tab === 'bank' && (
          <ProblemBank
            problems={problems}
            onAddToQueue={addToQueue}
            onDelete={deleteProblem}
            onBulkImport={bulkAddToBank}
          />
        )}
        {tab === 'completed' && (
          <CompletedList
            problems={problems}
            onDelete={deleteProblem}
          />
        )}
      </div>

      {showAdd && (
        <AddProblemModal
          onAdd={addProblem}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}
