import { useNavigate } from 'react-router-dom'

const EMOJI = {
  Pizza: '🍕', Burgers: '🍔', Pasta: '🍝', Indian: '🍛',
  Rice: '🍚', Noodles: '🍜', Desserts: '🍰', Drinks: '🥤',
}

export default function CategoryList({ categories }) {
  const navigate = useNavigate()
  if (!categories.length) return null

  return (
    <section>
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Categories</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => navigate(`/search?category=${cat.id}&label=${cat.name}`)}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3 hover:border-red-400 hover:shadow-md transition-all"
          >
            <span className="text-3xl">{EMOJI[cat.name] || '🍽️'}</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{cat.name}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
