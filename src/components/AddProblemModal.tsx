import { useState } from 'react'
import type { Difficulty } from '../types'

interface Props {
  onAdd: (fields: {
    title: string
    leetcodeNumber?: number
    url?: string
    difficulty?: Difficulty
    addToQueue?: boolean
  }) => string | null
  onClose: () => void
}

export function AddProblemModal({ onAdd, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [number, setNumber] = useState('')
  const [url, setUrl] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('')
  const [addToQueue, setAddToQueue] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const err = onAdd({
      title: title.trim(),
      leetcodeNumber: number ? parseInt(number, 10) : undefined,
      url: url.trim() || undefined,
      difficulty: difficulty || undefined,
      addToQueue,
    })
    if (err) {
      setError(err)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Problem</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => { setTitle(e.target.value); setError(null) }}
                placeholder="Two Sum"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">LC #</label>
                <input
                  type="number"
                  value={number}
                  onChange={e => { setNumber(e.target.value); setError(null) }}
                  placeholder="1"
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as Difficulty | '')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">—</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://leetcode.com/problems/two-sum"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Destination toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setAddToQueue(v => !v)}
                className={`relative w-9 h-5 rounded-full transition-colors ${addToQueue ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${addToQueue ? 'translate-x-4' : ''}`} />
              </div>
              <span className="text-sm text-gray-700">
                {addToQueue ? 'Add directly to Queue' : 'Save to Bank'}
              </span>
            </label>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {addToQueue ? 'Add to Queue' : 'Add to Bank'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
