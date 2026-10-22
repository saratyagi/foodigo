import FoodCard from './FoodCard'

export default function MenuList({ foods, categoryMap = {} }) {
  const grouped = foods.reduce((acc, food) => {
    const key = categoryMap[food.category_id] || 'Menu'
    if (!acc[key]) acc[key] = []
    acc[key].push(food)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, items]) => (
        <section key={category}>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            {category} <span className="text-sm font-normal text-gray-400">({items.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map(food => <FoodCard key={food.id} food={food} />)}
          </div>
        </section>
      ))}
    </div>
  )
}
