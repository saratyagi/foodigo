export default function FilterBar({ veg, setVeg, sort, setSort }) {
  const pill = (active, color) =>
    `px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
      active
        ? `${color} text-white border-transparent`
        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-red-400'
    }`

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      <button onClick={() => setVeg(null)}   className={pill(veg === null,  'bg-gray-700')}>All</button>
      <button onClick={() => setVeg(true)}   className={pill(veg === true,  'bg-green-600')}>🟢 Veg</button>
      <button onClick={() => setVeg(false)}  className={pill(veg === false, 'bg-red-700')}>🔴 Non-Veg</button>

      <select
        value={sort}
        onChange={e => setSort(e.target.value)}
        className="ml-auto px-3 py-1.5 rounded-full text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400"
      >
        <option value="">Sort: Relevance</option>
        <option value="price_asc">Price: Low → High</option>
        <option value="price_desc">Price: High → Low</option>
        <option value="rating">Top Rated</option>
      </select>
    </div>
  )
}
