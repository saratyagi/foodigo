import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useFavorites } from '../context/FavoritesContext'
import FoodCard from '../components/food/FoodCard'
import SkeletonLoader from '../components/common/SkeletonLoader'
import EmptyState from '../components/common/EmptyState'

export default function Favorites() {
  const { favoriteIds } = useFavorites()
  const [allFoods, setAllFoods] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/foods/')
      .then(r => setAllFoods(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <SkeletonLoader />

  const favFoods = allFoods.filter(f => favoriteIds.has(f.id))

  if (favFoods.length === 0) {
    return (
      <EmptyState
        icon="❤️"
        title="No favourites yet"
        description="Tap the heart on any dish to save it here."
        action={
          <Link
            to="/search"
            className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors"
          >
            Browse Dishes
          </Link>
        }
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mb-6">
        My Favourites
        <span className="ml-2 text-base font-normal text-gray-400">({favFoods.length})</span>
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {favFoods.map(food => <FoodCard key={food.id} food={food} />)}
      </div>
    </div>
  )
}
