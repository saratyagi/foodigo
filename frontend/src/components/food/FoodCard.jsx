import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { useFavorites } from '../../context/FavoritesContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import LazyImage from '../common/LazyImage'
import NutritionBadge from './NutritionBadge'
import NutritionModal from './NutritionModal'

const CATEGORY_EMOJI = {
  pizza: '🍕', burger: '🍔', burgers: '🍔', pasta: '🍝',
  indian: '🍛', rice: '🍚', noodles: '🍜', dessert: '🍰',
  desserts: '🍰', drink: '🥤', drinks: '🥤',
}

function foodEmoji(food) {
  if (!food.image) return '🍽️'
  const slug = food.image.split('/').pop().replace('.jpg', '').replace('.png', '')
  for (const [key, emoji] of Object.entries(CATEGORY_EMOJI)) {
    if (slug.includes(key)) return emoji
  }
  return '🍽️'
}

export default function FoodCard({ food }) {
  const { dispatch } = useCart()
  const { user } = useAuth()
  const { favoriteIds, toggle } = useFavorites()
  const toast = useToast()
  const [showNutrition, setShowNutrition] = useState(false)

  const isFav = favoriteIds.has(food.id)

  return (
    <>
      <div className="flex gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="relative h-20 w-20 flex-shrink-0 rounded-lg bg-gradient-to-br from-orange-300 to-red-400 overflow-hidden flex items-center justify-center">
          <LazyImage
            src={food.image}
            alt={food.name}
            className="h-full w-full object-cover"
            fallback={<span className="text-3xl select-none">{foodEmoji(food)}</span>}
          />
          {/* Favorite heart */}
          {user && (
            <button
              onClick={e => { e.stopPropagation(); toggle(food.id) }}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/80 dark:bg-gray-900/70 flex items-center justify-center text-sm hover:scale-110 transition-transform"
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFav ? '❤️' : '🤍'}
            </button>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`inline-flex items-center justify-center h-4 w-4 rounded-sm border-2 flex-shrink-0 ${food.veg ? 'border-green-600' : 'border-red-600'}`}>
              <span className={`h-2 w-2 rounded-full ${food.veg ? 'bg-green-600' : 'bg-red-600'}`} />
            </span>
            <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{food.name}</h3>
          </div>

          {food.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{food.description}</p>
          )}

          <NutritionBadge food={food} onClick={() => setShowNutrition(true)} />

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800 dark:text-gray-100">₹{food.price}</span>
              <span className="text-xs text-yellow-500">⭐ {food.rating}</span>
            </div>
            <button
              onClick={() => { dispatch({ type: 'ADD', item: food }); toast.success(`${food.name} added to cart!`) }}
              className="bg-red-500 hover:bg-red-600 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
            >
              + Add
            </button>
          </div>
        </div>
      </div>

      {showNutrition && (
        <NutritionModal food={food} onClose={() => setShowNutrition(false)} />
      )}
    </>
  )
}
