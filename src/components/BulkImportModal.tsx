import { useState } from 'react'
import type { Difficulty } from '../types'

interface ParsedProblem {
  title: string
  leetcodeNumber?: number
  difficulty?: Difficulty
  url: string
}

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function parseLine(line: string): ParsedProblem | null {
  const trimmed = line.trim()
  if (!trimmed) return null

  let rest = trimmed
  let leetcodeNumber: number | undefined

  const numMatch = rest.match(/^(\d+)[.\s]\s*(.+)/)
  if (numMatch) {
    leetcodeNumber = parseInt(numMatch[1], 10)
    rest = numMatch[2].trim()
  }

  let difficulty: Difficulty | undefined
  const diffMatch = rest.match(/\s*\(?(Easy|Medium|Hard)\)?$/i)
  if (diffMatch) {
    difficulty = (diffMatch[1].charAt(0).toUpperCase() + diffMatch[1].slice(1).toLowerCase()) as Difficulty
    rest = rest.slice(0, rest.length - diffMatch[0].length).trim()
  }

  const title = rest.trim()
  if (!title) return null
  const url = `https://leetcode.com/problems/${titleToSlug(title)}/description/`
  return { title, leetcodeNumber, difficulty, url }
}

interface Props {
  onImport: (items: ParsedProblem[]) => { added: number; skipped: number }
  onClose: () => void
}

export function BulkImportModal({ onImport, onClose }: Props) {
  const [text, setText] = useState('')
  const [result, setResult] = useState<{ added: number; skipped: number } | null>(null)

  const parsed = text
    .split('\n')
    .map(parseLine)
    .filter((p): p is ParsedProblem => p !== null)

  function handleImport() {
    if (parsed.length === 0) return
    const res = onImport(parsed)
    setResult(res)
  }

  if (result) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 text-center">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Import complete</p>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            <span className="font-medium text-indigo-600 dark:text-indigo-400">{result.added}</span> added
            {result.skipped > 0 && (
              <>, <span className="font-medium text-gray-500 dark:text-gray-400">{result.skipped}</span> skipped (duplicates)</>
            )}
          </p>
          <button
            onClick={onClose}
            className="mt-6 w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Bulk Import to Bank</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            One problem per line. Supports formats like:
            <code className="ml-1 text-xs bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 py-0.5 rounded">1. Two Sum</code>
            <code className="ml-1 text-xs bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 py-0.5 rounded">704. Binary Search (Easy)</code>
          </p>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={"1. Two Sum\n2. Add Two Numbers (Medium)\n3. Longest Substring Without Repeating Characters\n704. Binary Search Easy"}
            rows={10}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder-gray-400 dark:placeholder-gray-600"
            autoFocus
          />

          {parsed.length > 0 && (
            <div className="mt-3 border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                Preview — {parsed.length} problem{parsed.length !== 1 ? 's' : ''} parsed
              </div>
              <div className="max-h-40 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700">
                {parsed.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800">
                    <span className="text-xs text-gray-400 dark:text-gray-500 w-6 shrink-0 text-right">{p.leetcodeNumber ?? '—'}</span>
                    <span className="text-sm text-gray-800 dark:text-gray-200 flex-1 truncate">{p.title}</span>
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
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={parsed.length === 0}
              className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Import {parsed.length > 0 ? `${parsed.length} problems` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
