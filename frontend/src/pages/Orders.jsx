import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { getStatusColor } from '../utils/deliveryUtils'
import SkeletonLoader from '../components/common/SkeletonLoader'
import EmptyState from '../components/common/EmptyState'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/')
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <SkeletonLoader variant="orders" />

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="🛍️"
        title="No orders yet"
        description="Your order history will appear here."
        action={
          <Link
            to="/restaurants"
            className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors"
          >
            Start Ordering
          </Link>
        }
      />
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map(order => (
          <div
            key={order.id}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-gray-800 dark:text-gray-100">Order #{order.id}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)}</p>
              </div>
              <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            {/* Items summary */}
            <div className="mt-3 space-y-1">
              {order.items.slice(0, 3).map(item => (
                <p key={item.id} className="text-sm text-gray-600 dark:text-gray-400">
                  Item #{item.food_id} × {item.quantity}
                  <span className="ml-2 text-gray-400">₹{item.price * item.quantity}</span>
                </p>
              ))}
              {order.items.length > 3 && (
                <p className="text-xs text-gray-400">+{order.items.length - 3} more items</p>
              )}
            </div>

            {/* Footer row */}
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
              <div className="text-sm">
                <span className="font-bold text-gray-800 dark:text-gray-100">₹{order.total}</span>
                <span className="text-gray-400 ml-1.5">·</span>
                <span className="text-gray-500 dark:text-gray-400 ml-1.5">{order.payment_method}</span>
                {order.promo_code && (
                  <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                    {order.promo_code}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                {!['Delivered', 'Cancelled'].includes(order.status) && (
                  <Link
                    to={`/track/${order.id}`}
                    className="text-xs font-semibold text-red-500 hover:underline px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Track
                  </Link>
                )}
                {order.status === 'Delivered' && (
                  <Link
                    to={`/track/${order.id}`}
                    className="text-xs font-semibold text-gray-500 hover:text-red-500 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
                  >
                    Details
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
