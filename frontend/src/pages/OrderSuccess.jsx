import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/axios'
import SkeletonLoader from '../components/common/SkeletonLoader'

export default function OrderSuccess() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(r => setOrder(r.data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <SkeletonLoader />

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      {/* Success animation */}
      <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6 animate-bounce">
        <span className="text-5xl">✅</span>
      </div>

      <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">Order Placed!</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-2">
        Your order <span className="font-semibold text-gray-700 dark:text-gray-300">#{id}</span> has been confirmed.
      </p>

      {order && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 text-left space-y-3">
          {/* Items */}
          <div className="space-y-1.5">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                <span>Item #{item.food_id} × {item.quantity}</span>
                <span className="font-medium">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Subtotal</span><span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>GST</span><span>₹{order.taxes}</span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Delivery</span>
              <span className={order.delivery_fee === 0 ? 'text-green-600' : ''}>
                {order.delivery_fee === 0 ? 'FREE' : `₹${order.delivery_fee}`}
              </span>
            </div>
            {order.promo_code && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Promo ({order.promo_code})</span>
                <span>Applied ✓</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-800 dark:text-gray-100 pt-1 border-t border-gray-100 dark:border-gray-700">
              <span>Total</span><span>₹{order.total}</span>
            </div>
          </div>

          {order.estimated_delivery && (
            <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl px-4 py-3 mt-2">
              <span className="text-xl">🛵</span>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Estimated delivery</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{order.estimated_delivery}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <Link
          to={`/track/${id}`}
          className="block w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors"
        >
          Track Your Order
        </Link>
        <Link
          to="/home"
          className="block w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
