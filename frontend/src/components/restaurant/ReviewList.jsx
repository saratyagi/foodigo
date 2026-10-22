function Stars({ rating }) {
  return (
    <span className="text-yellow-400 text-sm">
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
    </span>
  )
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ReviewList({ reviews }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-gray-400 py-4 text-center">No reviews yet. Be the first!</p>
  }

  return (
    <div className="space-y-4">
      {reviews.map(r => (
        <div key={r.id} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <Stars rating={r.rating} />
            <span className="text-xs text-gray-400">{formatDate(r.created_at)}</span>
          </div>
          {r.comment && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{r.comment}</p>
          )}
        </div>
      ))}
    </div>
  )
}
