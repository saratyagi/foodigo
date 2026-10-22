import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-8xl mb-4">🍕</p>
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">404</h1>
      <p className="text-gray-500 mb-6">Oops! This page got eaten.</p>
      <Link to="/" className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors">
        Back to Home
      </Link>
    </div>
  )
}
