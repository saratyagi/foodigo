import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import CategoryList from '../components/home/CategoryList'
import FeaturedDishes from '../components/home/FeaturedDishes'
import PopularRestaurants from '../components/home/PopularRestaurants'
import WeatherSuggestions from '../components/home/WeatherSuggestions'
import SkeletonLoader from '../components/common/SkeletonLoader'
import ChatColumn from '../components/chat/ChatColumn'

export default function Home() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [allFoods, setAllFoods] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/categories/'),
      api.get('/restaurants/'),
      api.get('/foods/?sort=rating'),
    ])
      .then(([cats, rests, foods]) => {
        setCategories(cats.data)
        setRestaurants(rests.data)
        setAllFoods(foods.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <SkeletonLoader />

  const catalog = { foods: allFoods, restaurants, categories }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6 items-start">
      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-10">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">
            Hey {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">What are you craving today?</p>
        </div>

        <section>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Categories</h2>
          <CategoryList categories={categories} />
        </section>

        {/* Weather suggestions — renders itself only when location + bucket match */}
        <WeatherSuggestions />

        <section>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Top Rated Dishes</h2>
          <FeaturedDishes foods={allFoods.slice(0, 8)} />
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Popular Restaurants</h2>
          <PopularRestaurants restaurants={restaurants} />
        </section>
      </div>

      {/* Chat column — desktop sidebar + mobile bottom sheet */}
      <ChatColumn catalog={catalog} />
    </div>
  )
}
