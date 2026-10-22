import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

export default function CartSummary() {
  const { subtotal, taxes, deliveryFee, total, items } = useCart()
  const { user } = useAuth()

  const rows = [
    { label: 'Subtotal',     value: subtotal },
    { label: 'GST (5%)',     value: taxes },
    { label: 'Delivery fee', value: deliveryFee, free: deliveryFee === 0 && subtotal > 0 },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sticky top-20">
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Order Summary</h2>

      <div className="space-y-2 text-sm">
        {rows.map(r => (
          <div key={r.label} className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>{r.label}</span>
            <span className={r.free ? 'text-green-600 font-medium' : ''}>
              {r.free ? 'FREE' : `₹${r.value}`}
            </span>
          </div>
        ))}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-bold text-gray-800 dark:text-gray-100 text-base">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>

      {subtotal > 0 && subtotal <= 500 && (
        <p className="mt-3 text-xs text-orange-500 bg-orange-50 dark:bg-orange-900/20 rounded-lg px-3 py-2">
          Add ₹{500 - subtotal} more for free delivery!
        </p>
      )}

      {items.length > 0 && (
        user
          ? <Link
              to="/checkout"
              className="mt-4 block w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-center transition-colors"
            >
              Proceed to Checkout
            </Link>
          : <Link
              to="/login"
              className="mt-4 block w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-center transition-colors"
            >
              Login to Checkout
            </Link>
      )}
    </div>
  )
}
