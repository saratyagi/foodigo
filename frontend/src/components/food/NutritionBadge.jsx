export default function NutritionBadge({ food, onClick }) {
  if (!food.calories) return null
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick() }}
      className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors mt-1 group"
    >
      <span>{food.calories} kcal</span>
      {food.protein_g > 0 && (
        <>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span>{food.protein_g}g P</span>
        </>
      )}
      {food.carbs_g > 0 && (
        <>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span>{food.carbs_g}g C</span>
        </>
      )}
      <span className="ml-0.5 text-gray-300 group-hover:text-green-400 transition-colors">ⓘ</span>
    </button>
  )
}
