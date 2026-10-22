import { useCart } from '../../context/CartContext'

export default function CartItem({ item }) {
  const { dispatch } = useCart()

  return (
    <div className="flex items-start gap-3 py-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
      {/* Veg / non-veg indicator */}
      <span className={`mt-0.5 flex-shrink-0 inline-flex items-center justify-center h-4 w-4 rounded-sm border-2 ${item.veg ? 'border-green-600' : 'border-red-600'}`}>
        <span className={`h-2 w-2 rounded-full ${item.veg ? 'bg-green-600' : 'bg-red-600'}`} />
      </span>

      {/* Name + combo breakdown */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {item.isCombo && <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded font-medium">Combo</span>}
          <p className="font-medium text-gray-800 dark:text-gray-100 text-sm truncate">{item.name}</p>
        </div>
        {item.isCombo && item.comboItems?.length > 0
          ? <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.comboItems.map(f => f.name).join(' + ')}</p>
          : <p className="text-xs text-gray-400 mt-0.5">₹{item.price} each</p>
        }
      </div>

      {/* Qty stepper */}
      <div className="flex items-center gap-2 mt-0.5">
        <button
          onClick={() => dispatch({ type: 'DECREASE', id: item.id })}
          className="h-7 w-7 rounded-full border border-red-400 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition-colors"
        >
          −
        </button>
        <span className="w-5 text-center font-semibold text-gray-800 dark:text-gray-100 text-sm">
          {item.qty}
        </span>
        <button
          onClick={() => dispatch({ type: 'INCREASE', id: item.id })}
          className="h-7 w-7 rounded-full border border-red-400 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition-colors"
        >
          +
        </button>
      </div>

      {/* Line total */}
      <p className="w-16 text-right font-bold text-gray-800 dark:text-gray-100 text-sm mt-0.5">
        ₹{item.price * item.qty}
      </p>

      {/* Remove */}
      <button
        onClick={() => dispatch({ type: 'REMOVE', id: item.id })}
        className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none ml-1 mt-0.5"
        aria-label="Remove item"
      >
        ×
      </button>
    </div>
  )
}
