export default function SlotPicker({ slot, foods, selected, onSelect }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
      {/* Slot header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{slot.emoji}</span>
        <h3 className="font-bold text-gray-800 dark:text-gray-100">{slot.label}</h3>
        {selected && (
          <span className="ml-auto text-xs text-green-600 dark:text-green-400 font-medium">
            ✓ Selected
          </span>
        )}
      </div>

      {foods.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">No items available</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {foods.map(food => {
            const isSelected = selected?.id === food.id
            return (
              <button
                key={food.id}
                onClick={() => onSelect(isSelected ? null : food)}
                className={`flex-shrink-0 w-32 rounded-xl border-2 transition-all text-left overflow-hidden ${
                  isSelected
                    ? 'border-green-500 shadow-md shadow-green-100 dark:shadow-green-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                {/* Mini image */}
                <div className="h-20 bg-gradient-to-br from-orange-300 to-red-400 flex items-center justify-center relative">
                  <span className="text-3xl select-none">🍽️</span>
                  {isSelected && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold shadow">✓</span>
                    </div>
                  )}
                  {/* Veg dot */}
                  <span className={`absolute top-1.5 left-1.5 w-3 h-3 rounded-full border border-white ${food.veg ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>

                {/* Info */}
                <div className="p-2">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-tight line-clamp-2">
                    {food.name}
                  </p>
                  <p className="text-xs font-bold text-red-500 mt-1">₹{food.price}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
