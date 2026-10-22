import { Link } from 'react-router-dom'
import RestaurantCard from '../restaurant/RestaurantCard'

export default function PopularRestaurants({ restaurants }) {
  if (!restaurants.length) return null
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">🏆 Popular Restaurants</h2>
        <Link to="/restaurants" className="text-sm text-red-500 font-medium hover:underline">See all →</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {restaurants.slice(0, 3).map(r => <RestaurantCard key={r.id} restaurant={r} />)}
      </div>
    </section>
  )
}
