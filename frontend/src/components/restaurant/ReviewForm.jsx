import { useState } from 'react'
import { createReview } from '../../api/reviews'
import { useToast } from '../../context/ToastContext'

export default function ReviewForm({ restaurantId, onSubmitted }) {
  const toast = useToast()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async e => {
    e.preventDefault()
    if (rating === 0) { setError('Please select a star rating'); return }
    setLoading(true)
    setError('')
    try {
      await createReview({ restaurant_id: restaurantId, rating, comment: comment.trim() || null })
      setRating(0)
      setComment('')
      toast.success('Review submitted!')
      onSubmitted()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
      <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Write a Review</h4>

      {/* Star selector */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="text-2xl transition-transform hover:scale-110"
          >
            <span className={(hover || rating) >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}>
              ★
            </span>
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-xs text-gray-400 self-center">
            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
          </span>
        )}
      </div>

      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Share your experience (optional)…"
        rows={3}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors"
      >
        {loading ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  )
}
