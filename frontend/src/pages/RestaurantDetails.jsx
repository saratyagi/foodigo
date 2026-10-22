import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { getReviews } from '../api/reviews'
import RestaurantBanner from '../components/restaurant/RestaurantBanner'
import FilterBar from '../components/food/FilterBar'
import DietFilterBar from '../components/food/DietFilterBar'
import SurpriseMe from '../components/food/SurpriseMe'
import MenuList from '../components/food/MenuList'
import ReviewList from '../components/restaurant/ReviewList'
import ReviewForm from '../components/restaurant/ReviewForm'
import SkeletonLoader from '../components/common/SkeletonLoader'
import EmptyState from '../components/common/EmptyState'
import { matchesDiet } from '../utils/dietUtils'

export default function RestaurantDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState(null)
  const [foods, setFoods] = useState([])
  const [categoryMap, setCategoryMap] = useState({})
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [veg, setVeg] = useState(null)
  const [sort, setSort] = useState('')
  const [dietFilters, setDietFilters] = useState([])

  const fetchReviews = () => getReviews(id).then(r => setReviews(r.data)).catch(() => {})

  useEffect(() => {
    Promise.all([
      api.get(`/restaurants/${id}`),
      api.get(`/foods/?restaurant=${id}`),
      api.get('/categories/'),
    ])
      .then(([rest, foodsRes, cats]) => {
        setRestaurant(rest.data)
        setFoods(foodsRes.data)
        const map = {}
        cats.data.forEach(c => { map[c.id] = c.name })
        setCategoryMap(map)
      })
      .finally(() => setLoading(false))

    fetchReviews()
  }, [id])

  const toggleDiet = key =>
    setDietFilters(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])

  const filtered = useMemo(() => {
    let list = veg === null ? foods : foods.filter(f => f.veg === veg)
    if (dietFilters.length > 0) list = list.filter(f => matchesDiet(f, dietFilters))
    if (sort === 'price_asc')       list = [...list].sort((a, b) => a.price - b.price)
    else if (sort === 'price_desc') list = [...list].sort((a, b) => b.price - a.price)
    else if (sort === 'rating')     list = [...list].sort((a, b) => b.rating - a.rating)
    return list
  }, [foods, veg, sort, dietFilters])

  if (loading) return <SkeletonLoader variant="restaurant" />
  if (!restaurant) return <EmptyState title="Restaurant not found." />

  return (
    <div>
      <RestaurantBanner restaurant={restaurant} />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Menu section */}
        <FilterBar veg={veg} setVeg={setVeg} sort={sort} setSort={setSort} />
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1"><DietFilterBar selected={dietFilters} onToggle={toggleDiet} /></div>
          <SurpriseMe foods={filtered} />
        </div>
        {filtered.length === 0
          ? <EmptyState title="No dishes match your filters." />
          : <MenuList foods={filtered} categoryMap={categoryMap} />
        }

        {/* Reviews section */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
            Reviews <span className="text-sm font-normal text-gray-400">({reviews.length})</span>
          </h2>
          <div className="space-y-5">
            {user && (
              <ReviewForm
                restaurantId={Number(id)}
                onSubmitted={fetchReviews}
              />
            )}
            <ReviewList reviews={reviews} />
          </div>
        </div>
      </div>
    </div>
  )
}
