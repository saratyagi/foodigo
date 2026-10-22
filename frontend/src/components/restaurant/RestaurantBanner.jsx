import LazyImage from '../common/LazyImage'

export default function RestaurantBanner({ restaurant: r }) {
  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="h-48 md:h-64 bg-gradient-to-br from-orange-400 to-red-500 relative overflow-hidden">
        {r.image && (
          <LazyImage src={r.image} alt={r.name} className="w-full h-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 flex items-end p-6 bg-gradient-to-t from-black/60">
          <h1 className="text-3xl font-extrabold text-white drop-shadow">{r.name}</h1>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
        <span>⭐ <strong className="text-gray-800 dark:text-gray-100">{r.rating}</strong></span>
        <span>🕐 {r.delivery_time}</span>
        <span>💰 ₹{r.price_for_two} for two</span>
        <span>📦 Min. ₹{r.min_order}</span>
        <span>{r.delivery_fee === 0 ? '🆓 Free delivery' : `🚚 ₹${r.delivery_fee} delivery`}</span>
        <span>🕰️ {r.open_hours}</span>
      </div>
    </div>
  )
}
