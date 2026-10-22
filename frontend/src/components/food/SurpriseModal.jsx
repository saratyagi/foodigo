import { useEffect } from 'react'
import { useCart } from '../../context/CartContext'

export default function SurpriseModal({ food, onClose, onReroll }) {
  const { dispatch } = useCart()

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleAdd = () => {
    dispatch({ type: 'ADD', item: food })
    onClose()
  }

  const dietTags = (food.diet_tags || '').split(',').map(t => t.trim()).filter(Boolean)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Image / gradient header */}
        <div className="h-44 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center relative">
          <span className="text-7xl select-none">🍽️</span>
          <div className="absolute top-3 right-3">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors"
            >
              ×
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/40" />
        </div>

        <div className="p-5">
          {/* Veg dot + name */}
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center justify-center h-4 w-4 rounded-sm border-2 flex-shrink-0 ${food.veg ? 'border-green-600' : 'border-red-600'}`}>
              <span className={`h-2 w-2 rounded-full ${food.veg ? 'bg-green-600' : 'bg-red-600'}`} />
            </span>
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{food.name}</h3>
          </div>

          {food.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{food.description}</p>
          )}

          {/* Price + rating */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xl font-extrabold text-gray-800 dark:text-gray-100">₹{food.price}</span>
            <span className="text-sm text-yellow-500 font-medium">⭐ {food.rating}</span>
          </div>

          {/* Nutrition summary */}
          {food.calories > 0 && (
            <div className="flex gap-3 text-xs text-gray-400 mb-3">
              <span>{food.calories} kcal</span>
              {food.protein_g > 0 && <span>· {food.protein_g}g protein</span>}
              {food.carbs_g   > 0 && <span>· {food.carbs_g}g carbs</span>}
              {food.fat_g     > 0 && <span>· {food.fat_g}g fat</span>}
            </div>
          )}

          {/* Diet tags */}
          {dietTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {dietTags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition-colors"
            >
              + Add to Cart
            </button>
            <button
              onClick={onReroll}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-lg"
              title="Try again"
            >
              🎲
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
