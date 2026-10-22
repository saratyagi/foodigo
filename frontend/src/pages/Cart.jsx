import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import CartItem from '../components/cart/CartItem'
import CartSummary from '../components/cart/CartSummary'
import EmptyState from '../components/common/EmptyState'

export default function Cart() {
  const { items, dispatch } = useCart()

  if (items.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="Your cart is empty"
        description="Looks like you haven't added anything yet."
        action={
          <Link
            to="/restaurants"
            className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors"
          >
            Browse Restaurants
          </Link>
        }
      />
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">Your Cart</h1>
        <button
          onClick={() => dispatch({ type: 'CLEAR' })}
          className="text-sm text-red-500 hover:underline"
        >
          Clear all
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Item list */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-5 py-2">
          {items.map(item => <CartItem key={item.id} item={item} />)}
        </div>

        {/* Summary sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <CartSummary />
        </div>
      </div>
    </div>
  )
}
