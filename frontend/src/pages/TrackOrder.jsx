import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { trackOrder } from '../api/delivery'
import { getStatusColor } from '../utils/deliveryUtils'
import { useToast } from '../context/ToastContext'
import SkeletonLoader from '../components/common/SkeletonLoader'

const STATUS_ICONS = {
  Confirmed:          '📋',
  Preparing:          '🧑‍🍳',
  Cooking:            '🔥',
  'Out for Delivery': '🛵',
  Delivered:          '🎉',
  Cancelled:          '❌',
}

const STATUS_MSGS = {
  Preparing:          'Your order is being prepared! 🧑‍🍳',
  Cooking:            'Chef is cooking your food! 🔥',
  'Out for Delivery': 'Your order is on the way! 🛵',
  Delivered:          'Order delivered — enjoy your meal! 🎉',
}

const TERMINAL = ['Delivered', 'Cancelled']

function useCountdown(placedAt, etaStr) {
  const [remaining, setRemaining] = useState(null)

  useEffect(() => {
    if (!placedAt || !etaStr) return
    const etaMinutes = parseInt(etaStr)
    if (isNaN(etaMinutes)) return
    const deadline = new Date(placedAt).getTime() + etaMinutes * 60 * 1000
    const tick = () => setRemaining(Math.max(0, deadline - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [placedAt, etaStr])

  if (remaining === null) return null
  if (remaining === 0) return 'Arriving now!'
  const mins = Math.floor(remaining / 60000)
  const secs = Math.floor((remaining % 60000) / 1000)
  return `${mins}m ${secs.toString().padStart(2, '0')}s`
}

export default function TrackOrder() {
  const { id } = useParams()
  const toast = useToast()
  const [tracking, setTracking] = useState(null)
  const [loading, setLoading] = useState(true)
  const prevStatus = useRef(null)
  const timerRef = useRef(null)

  const countdown = useCountdown(tracking?.placed_at, tracking?.estimated_delivery)

  useEffect(() => {
    let mounted = true

    const poll = async () => {
      try {
        const { data } = await trackOrder(id)
        if (!mounted) return
        setTracking(data)
        if (prevStatus.current && prevStatus.current !== data.current_status) {
          const msg = STATUS_MSGS[data.current_status]
          if (msg) toast.info(msg)
        }
        prevStatus.current = data.current_status
        if (TERMINAL.includes(data.current_status)) {
          clearInterval(timerRef.current)
        }
      } catch {}
    }

    poll().finally(() => { if (mounted) setLoading(false) })
    timerRef.current = setInterval(poll, 5000)
    return () => {
      mounted = false
      clearInterval(timerRef.current)
    }
  }, [id])

  if (loading) return <SkeletonLoader variant="orders" />
  if (!tracking) return (
    <div className="text-center py-20 text-gray-400">Order not found.</div>
  )

  const isTerminal = TERMINAL.includes(tracking.current_status)

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">Track Order</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Order #{tracking.order_id}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(tracking.current_status)}`}>
          {STATUS_ICONS[tracking.current_status]} {tracking.current_status}
        </span>
      </div>

      {/* Live countdown */}
      {!isTerminal && countdown !== null && (
        <div className="mb-5 flex items-center gap-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl px-5 py-4">
          <span className="text-2xl">⏱️</span>
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Arriving in</p>
            <p className="font-bold text-lg text-gray-800 dark:text-gray-100 tabular-nums">{countdown}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Est. delivery</p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{tracking.estimated_delivery}</p>
          </div>
        </div>
      )}

      {/* Delivered banner */}
      {tracking.current_status === 'Delivered' && (
        <div className="mb-5 flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl px-5 py-4">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-bold text-green-700 dark:text-green-400">Delivered!</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Enjoy your meal</p>
          </div>
        </div>
      )}

      {/* Cancelled banner */}
      {tracking.current_status === 'Cancelled' && (
        <div className="mb-5 flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-5 py-4">
          <span className="text-2xl">❌</span>
          <div>
            <p className="font-bold text-red-700 dark:text-red-400">Order Cancelled</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Please contact support if you need help</p>
          </div>
        </div>
      )}

      {/* Animated timeline stepper */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-5">
        {tracking.timeline.map((step, idx) => {
          const isLast = idx === tracking.timeline.length - 1
          const isCurrent = step.status === tracking.current_status && !isTerminal
          return (
            <div key={step.status} className="flex gap-4">
              <div className="flex flex-col items-center">
                {/* Step dot */}
                <div className={`relative w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm transition-all duration-500 ${
                  step.done
                    ? 'bg-green-500 text-white shadow-md shadow-green-200 dark:shadow-green-900'
                    : isCurrent
                      ? 'bg-white dark:bg-gray-800 border-2 border-red-500 text-red-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                }`}>
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-60" />
                  )}
                  {step.done
                    ? <span className="text-sm font-bold">✓</span>
                    : <span className="text-base">{STATUS_ICONS[step.status] || '·'}</span>
                  }
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div className="relative w-0.5 flex-1 my-1 min-h-[28px] bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-full">
                    <div className={`absolute inset-0 bg-green-400 transition-transform duration-700 origin-top ${step.done ? 'scale-y-100' : 'scale-y-0'}`} />
                  </div>
                )}
              </div>

              {/* Label */}
              <div className={`pb-7 ${isLast ? 'pb-0' : ''}`}>
                <p className={`font-semibold text-sm transition-colors duration-300 ${
                  step.done
                    ? 'text-green-600 dark:text-green-400'
                    : isCurrent
                      ? 'text-red-500'
                      : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {step.status}
                </p>
                {isCurrent && (
                  <p className="text-xs text-gray-400 mt-0.5 animate-pulse">In progress…</p>
                )}
                {step.done && step.status !== tracking.current_status && (
                  <p className="text-xs text-gray-400 mt-0.5">Completed</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Order summary */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-5 py-4 mb-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Order Summary</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-300">
            {tracking.item_count} item{tracking.item_count !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-gray-400">{tracking.payment_method}</span>
            <span className="font-bold text-gray-800 dark:text-gray-100">₹{tracking.total}</span>
          </div>
        </div>
      </div>

      {/* Footer links */}
      <div className="flex gap-3">
        <Link
          to="/orders"
          className="flex-1 text-center py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          My Orders
        </Link>
        <Link
          to="/home"
          className="flex-1 text-center py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-bold text-white transition-colors"
        >
          Order More
        </Link>
      </div>
    </div>
  )
}
