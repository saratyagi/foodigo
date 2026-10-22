import { createContext, useContext, useReducer, useMemo } from 'react'

const CartContext = createContext()

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find(i => i.id === action.item.id)
      if (existing) return state.map(i => i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i)
      return [...state, { ...action.item, qty: 1 }]
    }
    case 'INCREASE':
      return state.map(i => i.id === action.id ? { ...i, qty: i.qty + 1 } : i)
    case 'DECREASE':
      return state.map(i => i.id === action.id ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0)
    case 'REMOVE':
      return state.filter(i => i.id !== action.id)
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [])

  const subtotal    = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items])
  const taxes       = Math.round(subtotal * 0.05)
  const deliveryFee = subtotal === 0 || subtotal > 500 ? 0 : 40
  const total       = subtotal + taxes + deliveryFee

  return (
    <CartContext.Provider value={{ items, dispatch, subtotal, taxes, deliveryFee, total }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
