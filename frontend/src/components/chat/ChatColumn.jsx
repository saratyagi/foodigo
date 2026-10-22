import { useState, useRef, useEffect, useReducer } from 'react'
import { parseChat } from '../../utils/chatParser'
import { runQuery } from '../../utils/chatQuery'
import FoodCard from '../food/FoodCard'

const STARTER_CHIPS = [
  { label: 'Best veg under ₹300', query: 'best veg under 300' },
  { label: 'Highest protein',      query: 'highest protein dish' },
  { label: 'Cheapest dessert',     query: 'cheapest dessert' },
  { label: 'Top rated overall',    query: 'top rated' },
]

const UNKNOWN_LOG_KEY = 'foodigo:unknown_queries'

function logUnknown(text) {
  try {
    const log = JSON.parse(localStorage.getItem(UNKNOWN_LOG_KEY) ?? '[]')
    log.push({ q: text, ts: Date.now() })
    localStorage.setItem(UNKNOWN_LOG_KEY, JSON.stringify(log.slice(-500)))
  } catch {}
}

function messagesReducer(state, action) {
  if (action.type === 'ADD') return [...state, ...action.messages]
  if (action.type === 'CLEAR') return []
  return state
}

function ChatPanel({ catalog, onClose }) {
  const [messages, dispatch] = useReducer(messagesReducer, [])
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  // Report stored unknowns once on mount (dev analysis)
  useEffect(() => {
    try {
      const log = JSON.parse(localStorage.getItem(UNKNOWN_LOG_KEY) ?? '[]')
      if (log.length) {
        console.info('[Foodigo chat] UNKNOWN queries logged:', log.length,
          '— last 5:', log.slice(-5).map(e => e.q))
      }
    } catch {}
  }, [])

  useEffect(() => {
    const el = bottomRef.current
    if (!el) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: prefersReduced ? 'instant' : 'smooth' })
  }, [messages])

  function send(text) {
    const trimmed = text.trim()
    if (!trimmed) return
    const parsed  = parseChat(trimmed, catalog)
    const response = runQuery(parsed, catalog)

    if (response.type === 'UNKNOWN') logUnknown(trimmed)

    dispatch({
      type: 'ADD',
      messages: [
        { id: `u-${Date.now()}`,     role: 'user', text: trimmed },
        { id: `b-${Date.now() + 1}`, role: 'bot',  text: response.text, response },
      ],
    })
    setInput('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    send(input)
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none" aria-hidden="true">💬</span>
          <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">Ask Foodigo</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close chat"
          >
            ×
          </button>
        )}
      </div>

      {/* Message list */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-3"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {isEmpty && (
          <div className="space-y-4">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">
              Ask me about dishes, prices, nutrition, or restaurants.
            </p>
            <div className="flex flex-wrap gap-2">
              {STARTER_CHIPS.map(chip => (
                <button
                  key={chip.label}
                  onClick={() => send(chip.query)}
                  className="text-xs bg-orange-50 hover:bg-orange-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-gray-600 rounded-full px-3 py-1.5 transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg =>
          msg.role === 'user' ? (
            <div key={msg.id} className="flex justify-end">
              <span className="bg-red-500 text-white text-xs rounded-2xl rounded-tr-sm px-3 py-2 max-w-[82%] leading-relaxed">
                {msg.text}
              </span>
            </div>
          ) : (
            <BotMessage key={msg.id} msg={msg} />
          )
        )}

        {/* Persistent chips below conversation */}
        {!isEmpty && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {STARTER_CHIPS.map(chip => (
              <button
                key={chip.label}
                onClick={() => send(chip.query)}
                className="text-xs bg-orange-50 hover:bg-orange-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-gray-600 rounded-full px-2.5 py-1 transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        id="chat-form"
        onSubmit={handleSubmit}
        className="flex gap-2 p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about the menu…"
          className="flex-1 min-w-0 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-400 dark:focus:ring-red-500"
          aria-label="Chat input"
        />
        <button
          type="submit"
          className="bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-lg px-3 py-2 text-sm font-bold transition-all flex-shrink-0"
          aria-label="Send message"
        >
          →
        </button>
      </form>
    </div>
  )
}

// ── Card components ──────────────────────────────────────────────────────────

const RESTAURANT_LIST_TYPES = new Set(['BEST_RESTAURANT', 'FASTEST_RESTAURANT', 'CHEAPEST_RESTAURANT'])

function RestaurantCard({ restaurant }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{restaurant.name}</p>
          {restaurant.address && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{restaurant.address}</p>
          )}
        </div>
        <span className="text-xs text-yellow-500 flex-shrink-0 font-medium">⭐ {restaurant.rating}</span>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-gray-600 dark:text-gray-400">
        <span>🕐 {restaurant.delivery_time}</span>
        <span>₹{restaurant.price_for_two} for two</span>
        {restaurant.delivery_fee === 0
          ? <span className="text-green-600 dark:text-green-400">Free delivery</span>
          : <span>₹{restaurant.delivery_fee} delivery</span>}
      </div>
    </div>
  )
}

function RestaurantBadge({ restaurant }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
      <p className="font-semibold text-gray-800 dark:text-gray-200">{restaurant.name}</p>
      {restaurant.open_hours  && <p>{restaurant.open_hours}</p>}
      {restaurant.min_order   != null && <p>Min order ₹{restaurant.min_order}</p>}
      {restaurant.delivery_fee != null && (
        <p>{restaurant.delivery_fee === 0 ? 'Free delivery' : `₹${restaurant.delivery_fee} delivery`}</p>
      )}
    </div>
  )
}

function BotMessage({ msg }) {
  const { response } = msg
  const isRestaurantList = RESTAURANT_LIST_TYPES.has(response?.type)

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{msg.text}</p>

      {/* Restaurant list cards (BEST / FASTEST / CHEAPEST) */}
      {isRestaurantList && response?.restaurantList?.length > 0 && (
        <div className="space-y-2">
          {response.restaurantList.map(r => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      )}

      {/* Dish cards */}
      {!isRestaurantList && response?.dishes?.length > 0 && (
        <div className="space-y-2">
          {response.dishes.map(food => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      )}

      {/* NO_RESULTS alternatives */}
      {response?.type === 'NO_RESULTS' && response?.fallback?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">Closest alternatives:</p>
          {response.fallback.map(food => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      )}

      {/* Single-restaurant detail badge */}
      {response?.type === 'RESTAURANT_INFO' && response?.restaurant && (
        <RestaurantBadge restaurant={response.restaurant} />
      )}
    </div>
  )
}

// ── Mobile bottom sheet with slide-up animation ──────────────────────────────

function MobileSheet({ catalog, onClose }) {
  const [visible, setVisible] = useState(false)
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Trigger slide-up on next paint so the CSS transition has a start state
  useEffect(() => {
    if (reducedMotion) { setVisible(true); return }
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [reducedMotion])

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Foodigo chat assistant"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={[
          'absolute inset-x-0 bottom-0 rounded-t-2xl bg-white dark:bg-gray-900 shadow-xl flex flex-col max-h-[80vh]',
          reducedMotion ? '' : 'transition-transform duration-300 ease-out',
          visible ? 'translate-y-0' : 'translate-y-full',
        ].join(' ')}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1 flex-shrink-0" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <ChatPanel catalog={catalog} onClose={onClose} />
        </div>
      </div>
    </div>
  )
}

// ── Main export ──────────────────────────────────────────────────────────────

export default function ChatColumn({ catalog }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sticky sidebar */}
      <div className="hidden lg:flex flex-col w-80 flex-shrink-0 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-6 h-[calc(100vh-3rem)] max-h-[700px]">
        <ChatPanel catalog={catalog} />
      </div>

      {/* Mobile floating trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-20 right-4 z-40 w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center text-xl transition-all active:scale-95"
        aria-label="Open chat assistant"
      >
        💬
      </button>

      {/* Mobile bottom sheet (unmounts on close to reset chat state) */}
      {mobileOpen && (
        <MobileSheet catalog={catalog} onClose={() => setMobileOpen(false)} />
      )}
    </>
  )
}
