function SkeletonCard() {
  return (
    <div className="flex gap-3 rounded-xl border border-gray-100 dark:border-gray-700 p-3">
      <div className="h-20 w-20 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="flex items-center justify-between mt-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg w-14" />
        </div>
      </div>
    </div>
  )
}

export default function SkeletonLoader({ variant = 'cards', count = 6 }) {
  if (variant === 'bar') {
    return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-4 w-full" />
  }

  if (variant === 'restaurant') {
    return (
      <div className="animate-pulse">
        <div className="h-52 bg-gray-200 dark:bg-gray-700" />
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex gap-4 mb-5">
            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-xl w-28 ml-auto" />
          </div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-36 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'orders') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-3">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[...Array(count)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  )
}
