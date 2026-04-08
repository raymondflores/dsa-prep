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
    .replace(/[^a-z0-9\s-]/g, '') // strip non-alphanumeric (except spaces/hyphens)
    .trim()
    .replace(/\s+/g, '-')
}

function parseLine(line: string): ParsedProblem | null {
  const trimmed = line.trim()
  if (!trimmed) return null

  let rest = trimmed
  let leetcodeNumber: number | undefined

  // Extract leading number: "1. Title" or "1 Title"
  const numMatch = rest.match(/^(\d+)[.\s]\s*(.+)/)
  if (numMatch) {
    leetcodeNumber = parseInt(numMatch[1], 10)
    rest = numMatch[2].trim()
  }

  // Extract trailing difficulty: "(Easy)", "(Medium)", "(Hard)", or bare "Easy"/"Medium"/"Hard"
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
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-lg font-semibold text-gray-900">Import complete</p>
          <p className="text-gray-600 mt-1">
            <span className="font-medium text-indigo-600">{result.added}</span> added
            {result.skipped > 0 && (
              <>, <span className="font-medium text-gray-500">{result.skipped}</span> skipped (duplicates)</>
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Bulk Import to Bank</h2>
          <p className="text-sm text-gray-500 mb-4">
            One problem per line. Supports formats like:
            <code className="ml-1 text-xs bg-gray-100 px-1 py-0.5 rounded">1. Two Sum</code>
            <code className="ml-1 text-xs bg-gray-100 px-1 py-0.5 rounded">704. Binary Search (Easy)</code>
          </p>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={"1. Two Sum\n2. Add Two Numbers (Medium)\n3. Longest Substring Without Repeating Characters\n704. Binary Search Easy"}
            rows={10}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            autoFocus
          />

          {/* Preview */}
          {parsed.length > 0 && (
            <div className="mt-3 border border-gray-100 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500 border-b border-gray-100">
                Preview — {parsed.length} problem{parsed.length !== 1 ? 's' : ''} parsed
              </div>
              <div className="max-h-40 overflow-y-auto divide-y divide-gray-50">
                {parsed.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5">
                    <span className="text-xs text-gray-400 w-6 shrink-0 text-right">{p.leetcodeNumber ?? '—'}</span>
                    <span className="text-sm text-gray-800 flex-1 truncate">{p.title}</span>
                    {p.difficulty && (
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                        p.difficulty === 'Easy' ? 'text-emerald-600 bg-emerald-50' :
                        p.difficulty === 'Medium' ? 'text-amber-600 bg-amber-50' :
                        'text-red-600 bg-red-50'
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
              className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
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
