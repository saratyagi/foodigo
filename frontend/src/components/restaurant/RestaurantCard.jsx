import { Link } from 'react-router-dom'
import LazyImage from '../common/LazyImage'

export default function RestaurantCard({ restaurant: r }) {
  return (
    <Link
      to={`/restaurants/${r.id}`}
      className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="h-40 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center overflow-hidden">
        <LazyImage
          src={r.image}
          alt={r.name}
          className="w-full h-full object-cover"
          fallback={<span className="text-5xl select-none">🍽️</span>}
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base">{r.name}</h3>
        {r.address && <p className="text-xs text-gray-400 mt-0.5 truncate">{r.address}</p>}
        <div className="flex items-center gap-2 mt-2 text-sm flex-wrap">
          <span className="text-yellow-500 font-semibold">⭐ {r.rating}</span>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span className="text-gray-600 dark:text-gray-400">🕐 {r.delivery_time}</span>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span className="text-gray-600 dark:text-gray-400">₹{r.price_for_two} for two</span>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          Min. ₹{r.min_order} ·{' '}
          {r.delivery_fee === 0 ? '🆓 Free delivery' : `🚚 ₹${r.delivery_fee} delivery`}
        </p>
      </div>
    </Link>
  )
}
