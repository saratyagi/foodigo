import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import SlotPicker from '../components/meal/SlotPicker'
import MealSummary from '../components/meal/MealSummary'
import SkeletonLoader from '../components/common/SkeletonLoader'

const SLOTS = [
  { key: 'main',    label: 'Main Course', emoji: '🍽️', categories: ['Pizza', 'Burgers', 'Pasta', 'Indian', 'Rice', 'Noodles'] },
  { key: 'drink',   label: 'Drink',       emoji: '🥤', categories: ['Drinks']   },
  { key: 'dessert', label: 'Dessert',     emoji: '🍰', categories: ['Desserts'] },
]

export default function MealBuilder() {
  const { dispatch } = useCart()
  const navigate = useNavigate()

  const [foods, setFoods] = useState([])
  const [categoryMap, setCategoryMap] = useState({})   // id → name
  const [loading, setLoading] = useState(true)
  const [selections, setSelections] = useState({ main: null, drink: null, dessert: null })
  const [added, setAdded] = useState(false)

  useEffect(() => {
    Promise.all([api.get('/foods/'), api.get('/categories/')])
      .then(([foodsRes, catsRes]) => {
        setFoods(foodsRes.data)
        const map = {}
        catsRes.data.forEach(c => { map[c.id] = c.name })
        setCategoryMap(map)
      })
      .finally(() => setLoading(false))
  }, [])

  const foodsForSlot = slot =>
    foods.filter(f => slot.categories.includes(categoryMap[f.category_id]))

  const handleSelect = (key, food) =>
    setSelections(prev => ({ ...prev, [key]: food }))

  const handleAddToCart = (total, selectedFoods) => {
    const allVeg = selectedFoods.every(f => f.veg)
    dispatch({
      type: 'ADD',
      item: {
        id: `combo-${Date.now()}`,
        name: 'Custom Meal',
        description: selectedFoods.map(f => f.name).join(' + '),
        price: total,
        veg: allVeg,
        rating: 5.0,
        isCombo: true,
        comboItems: selectedFoods,
      },
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return <SkeletonLoader />

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">
          Build Your Meal
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Pick one from each slot and get <span className="text-green-600 font-semibold">10% off</span> the full combo.
        </p>
      </div>

      {/* Combo equation banner */}
      <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl px-6 py-3 mb-6 text-sm font-medium text-gray-700 dark:text-gray-300 flex-wrap">
        <span>🍽️ Main</span>
        <span className="text-purple-400">+</span>
        <span>🥤 Drink</span>
        <span className="text-purple-400">+</span>
        <span>🍰 Dessert</span>
        <span className="text-purple-400">=</span>
        <span className="text-green-600 font-bold">10% off combo</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Slot pickers */}
        <div className="flex-1 space-y-4">
          {SLOTS.map(slot => (
            <SlotPicker
              key={slot.key}
              slot={slot}
              foods={foodsForSlot(slot)}
              selected={selections[slot.key]}
              onSelect={food => handleSelect(slot.key, food)}
            />
          ))}
        </div>

        {/* Summary sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0">
          {added ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-2xl p-6 text-center sticky top-20">
              <p className="text-4xl mb-2">✅</p>
              <p className="font-bold text-green-700 dark:text-green-400">Combo added to cart!</p>
              <button
                onClick={() => navigate('/cart')}
                className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
              >
                Go to Cart
              </button>
              <button
                onClick={() => { setSelections({ main: null, drink: null, dessert: null }); setAdded(false) }}
                className="mt-2 w-full text-sm text-gray-500 dark:text-gray-400 hover:underline"
              >
                Build another
              </button>
            </div>
          ) : (
            <MealSummary
              slots={SLOTS}
              selections={selections}
              onAddToCart={handleAddToCart}
            />
          )}
        </div>
      </div>
    </div>
  )
}
