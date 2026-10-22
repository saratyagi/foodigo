const COMBO_DISCOUNT = 0.10

export default function MealSummary({ slots, selections, onAddToCart }) {
  const selected = slots.map(s => selections[s.key]).filter(Boolean)
  const subtotal = selected.reduce((sum, f) => sum + f.price, 0)
  const discount = selected.length === slots.length ? Math.round(subtotal * COMBO_DISCOUNT) : 0
  const total    = subtotal - discount
  const allChosen = selected.length === slots.length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sticky top-20">
      <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-4 text-lg">Your Combo</h2>

      {/* Slot rows */}
      <div className="space-y-3 mb-4">
        {slots.map(slot => {
          const food = selections[slot.key]
          return (
            <div key={slot.key} className="flex items-start gap-2">
              <span className="text-base mt-0.5">{slot.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-medium">{slot.label}</p>
                {food
                  ? <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{food.name}</p>
                  : <p className="text-sm text-gray-300 dark:text-gray-600 italic">Not chosen</p>
                }
              </div>
              {food && (
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex-shrink-0">
                  ₹{food.price}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Price breakdown */}
      <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-2 text-sm">
        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
            <span>Combo discount (10%)</span>
            <span>− ₹{discount}</span>
          </div>
        )}
        {!allChosen && selected.length > 0 && (
          <p className="text-xs text-orange-500">
            Choose all 3 items to unlock 10% combo discount!
          </p>
        )}
        <div className="flex justify-between font-bold text-gray-800 dark:text-gray-100 text-base pt-1 border-t border-gray-100 dark:border-gray-700">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>

      <button
        onClick={() => onAddToCart(total, selected)}
        disabled={selected.length === 0}
        className="mt-4 w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all"
      >
        {selected.length === 0
          ? 'Choose items to build a combo'
          : `Add Combo to Cart · ₹${total}`
        }
      </button>

      {allChosen && (
        <p className="mt-2 text-center text-xs text-green-600 dark:text-green-400">
          🎉 Full combo — 10% off applied!
        </p>
      )}
    </div>
  )
}
