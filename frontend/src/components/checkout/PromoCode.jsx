import { useState } from 'react'
import api from '../../api/axios'

export default function PromoCode({ subtotal, restaurantId, onApply, onClear, applied }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const apply = async () => {
    const code = input.trim().toUpperCase()
    if (!code) return
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/delivery/quote', {
        subtotal,
        restaurant_id: restaurantId,
        promo_code: code,
      })
      if (data.discount === 0) {
        setError('Invalid or expired promo code')
      } else {
        onApply(data, code)
      }
    } catch {
      setError('Could not apply code. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const clear = () => {
    setInput('')
    setError('')
    onClear()
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-xl px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-green-700 dark:text-green-400">
            🎉 Promo applied: <span className="font-mono">{applied.code}</span>
          </p>
          <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
            You save ₹{applied.discount}
          </p>
        </div>
        <button onClick={clear} className="text-sm text-red-500 hover:underline">Remove</button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && apply()}
          placeholder="WELCOME50 or SAVE20"
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 font-mono"
        />
        <button
          onClick={apply} disabled={loading || !input.trim()}
          className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-bold px-4 rounded-lg transition-colors"
        >
          {loading ? '…' : 'Apply'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-gray-400">Try: WELCOME50 (₹50 off) · SAVE20 (20% off)</p>
    </div>
  )
}
