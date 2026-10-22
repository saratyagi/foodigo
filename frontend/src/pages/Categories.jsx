import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import SkeletonLoader from '../components/common/SkeletonLoader'

const GRADIENTS = [
  'from-red-400 to-orange-400',
  'from-orange-400 to-yellow-400',
  'from-yellow-400 to-green-400',
  'from-green-400 to-teal-400',
  'from-teal-400 to-blue-400',
  'from-blue-400 to-indigo-400',
  'from-indigo-400 to-purple-400',
  'from-purple-400 to-pink-400',
]

const EMOJI_MAP = {
  Pizza: '🍕', Burger: '🍔', Biryani: '🍛', Sushi: '🍱',
  Pasta: '🍝', Desserts: '🍰', Drinks: '🥤', Healthy: '🥗',
}

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/categories/')
      .then(r => setCategories(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <SkeletonLoader />

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mb-6">All Categories</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((cat, i) => (
          <button
            key={cat.id}
            onClick={() => navigate(`/search?category=${cat.id}&label=${encodeURIComponent(cat.name)}`)}
            className={`bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} rounded-2xl p-6 flex flex-col items-center gap-2 hover:scale-105 transition-transform shadow-sm`}
          >
            <span className="text-4xl">{EMOJI_MAP[cat.name] || '🍽️'}</span>
            <span className="text-white font-bold text-sm">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
