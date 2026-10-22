import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import api from '../api/axios'
import AddressSelector from '../components/checkout/AddressSelector'
import PromoCode from '../components/checkout/PromoCode'

export default function Checkout() {
  const { items, subtotal, dispatch } = useCart()
  const navigate = useNavigate()

  const [addresses, setAddresses] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [applied, setApplied] = useState(null)   // { code, discount, quote }
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/addresses/').then(r => {
      setAddresses(r.data)
      const def = r.data.find(a => a.is_default) || r.data[0]
      if (def) setSelectedId(def.id)
    })
  }, [])

  if (items.length === 0) return <Navigate to="/cart" replace />

  const restaurantId = items[0]?.restaurant_id || 1

  const handleApply = (quote, code) => setApplied({ code, discount: quote.discount, quote })
  const handleClear = () => setApplied(null)

  const addAddress = addr => {
    setAddresses(prev => [...prev, addr])
    setSelectedId(addr.id)
  }

  // Totals — use server quote when promo is applied
  const q = applied?.quote
  const displaySubtotal  = subtotal
  const displayTax       = q ? q.taxes        : Math.round(subtotal * 0.05)
  const displayDelivery  = q ? q.delivery_fee  : (subtotal > 500 ? 0 : 40)
  const displayDiscount  = q ? q.discount      : 0
  const displayTotal     = q ? q.total         : displaySubtotal + displayTax + displayDelivery

  const placeOrder = async () => {
    if (!selectedId) { setError('Please select a delivery address'); return }
    setPlacing(true)
    setError('')
    try {
      const { data } = await api.post('/orders/', {
        address_id: selectedId,
        items: items.flatMap(i =>
          i.isCombo
            ? (i.comboItems || []).map(f => ({ food_id: f.id, quantity: i.qty }))
            : [{ food_id: i.id, quantity: i.qty }]
        ),
        promo_code: applied?.code || null,
        payment_method: 'COD',
      })
      dispatch({ type: 'CLEAR' })
      navigate(`/order-success/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to place order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mb-6">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Left column ───────────────────────────────── */}
        <div className="flex-1 space-y-6">

          {/* 1. Items review */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-3">Your Items</h2>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                  <span>{item.name} × {item.qty}</span>
                  <span className="font-medium">₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Delivery address */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-3">Delivery Address</h2>
            <AddressSelector
              addresses={addresses}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onNewAddress={addAddress}
            />
          </section>

          {/* 3. Promo code */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-3">Promo Code</h2>
            <PromoCode
              subtotal={subtotal}
              restaurantId={restaurantId}
              applied={applied}
              onApply={handleApply}
              onClear={handleClear}
            />
          </section>

          {/* 4. Payment method */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-3">Payment</h2>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700">
              <span className="text-xl">💵</span>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Cash on Delivery</p>
                <p className="text-xs text-gray-400">Pay when your order arrives</p>
              </div>
              <span className="ml-auto inline-flex items-center justify-center w-4 h-4 rounded-full border-2 border-red-500">
                <span className="w-2 h-2 rounded-full bg-red-500" />
              </span>
            </div>
          </section>
        </div>

        {/* ── Right column: price summary ───────────────── */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sticky top-20">
            <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Price Details</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span><span>₹{displaySubtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>GST (5%)</span><span>₹{displayTax}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delivery fee</span>
                <span className={displayDelivery === 0 ? 'text-green-600 font-medium' : ''}>
                  {displayDelivery === 0 ? 'FREE' : `₹${displayDelivery}`}
                </span>
              </div>
              {displayDiscount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Promo discount</span><span>− ₹{displayDiscount}</span>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-bold text-gray-800 dark:text-gray-100 text-base">
                <span>Total</span><span>₹{displayTotal}</span>
              </div>
            </div>

            {error && (
              <p className="mt-3 text-xs text-red-500 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={placeOrder}
              disabled={placing || !selectedId}
              className="mt-4 w-full bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {placing ? 'Placing order…' : `Place Order · ₹${displayTotal}`}
            </button>

            <p className="mt-3 text-center text-xs text-gray-400">
              By placing this order you agree to our terms
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
