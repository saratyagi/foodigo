import { useEffect, useState } from 'react'
import api from '../api/axios'
import RestaurantList from '../components/restaurant/RestaurantList'
import SkeletonLoader from '../components/common/SkeletonLoader'
import EmptyState from '../components/common/EmptyState'

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/restaurants/')
      .then(r => setRestaurants(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <SkeletonLoader />

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mb-6">
        All Restaurants
      </h1>
      {restaurants.length === 0
        ? <EmptyState title="No restaurants found." />
        : <RestaurantList restaurants={restaurants} />
      }
    </div>
  )
}
