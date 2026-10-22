import FoodCard from '../food/FoodCard'

export default function FeaturedDishes({ foods }) {
  if (!foods.length) return null
  return (
    <section>
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">⭐ Featured Dishes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {foods.map(food => <FoodCard key={food.id} food={food} />)}
      </div>
    </section>
  )
}
