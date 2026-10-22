import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchAll } from '../api/search'
import FoodCard from '../components/food/FoodCard'
import RestaurantCard from '../components/restaurant/RestaurantCard'
import SkeletonLoader from '../components/common/SkeletonLoader'
import EmptyState from '../components/common/EmptyState'

const RATING_OPTS = [
  { label: 'Any',  value: '' },
  { label: '3.5+', value: '3.5' },
  { label: '4.0+', value: '4.0' },
  { label: '4.5+', value: '4.5' },
]

const VEG_OPTS = [
  { label: 'All',         value: '',      active: 'bg-gray-700 text-white border-transparent' },
  { label: '🟢 Veg',     value: 'true',  active: 'bg-green-600 text-white border-transparent' },
  { label: '🔴 Non-Veg', value: 'false', active: 'bg-red-700 text-white border-transparent' },
]

export default function Search() {
  const [params, setParams] = useSearchParams()

  const q         = params.get('q')          || ''
  const tab       = params.get('tab')        || 'all'
  const veg       = params.get('veg')        || ''
  const sort      = params.get('sort')       || ''
  const minRating = params.get('min_rating') || ''

  const [inputVal,  setInputVal]  = useState(q)
  const [minPrice,  setMinPrice]  = useState(params.get('min_price') || '')
  const [maxPrice,  setMaxPrice]  = useState(params.get('max_price') || '')
  const [results,   setResults]   = useState({ foods: [], restaurants: [] })
  const [loading,   setLoading]   = useState(false)
  const debounceRef = useRef(null)

  const setParam = (key, val) => {
    setParams(prev => {
      const next = new URLSearchParams(prev)
      if (val === '' || val === null) next.delete(key)
      else next.set(key, val)
      return next
    }, { replace: true })
  }

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await searchAll({
        q:          q         || undefined,
        veg:        veg       || undefined,
        sort:       sort      || undefined,
        min_price:  params.get('min_price') || undefined,
        max_price:  params.get('max_price') || undefined,
        min_rating: minRating || undefined,
      })
      setResults(data)
    } catch {
      setResults({ foods: [], restaurants: [] })
    } finally {
      setLoading(false)
    }
  }, [q, veg, sort, minRating, params.get('min_price'), params.get('max_price')])

  useEffect(() => { fetch() }, [fetch])

  // Keep text input in sync when URL q changes externally (e.g. Navbar submit)
  useEffect(() => { setInputVal(q) }, [q])

  const handleInput = (e) => {
    const val = e.target.value
    setInputVal(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setParam('q', val), 350)
  }

  const applyPrice = () => {
    setParams(prev => {
      const next = new URLSearchParams(prev)
      if (minPrice) next.set('min_price', minPrice); else next.delete('min_price')
      if (maxPrice) next.set('max_price', maxPrice); else next.delete('max_price')
      return next
    }, { replace: true })
  }

  const clearAll = () => {
    setInputVal('')
    setMinPrice('')
    setMaxPrice('')
    setParams({}, { replace: true })
  }

  const foods       = results.foods       || []
  const restaurants = results.restaurants || []
  const total       = foods.length + restaurants.length

  const TABS = [
    { key: 'all',         label: `All (${total})` },
    { key: 'foods',       label: `Dishes (${foods.length})` },
    { key: 'restaurants', label: `Restaurants (${restaurants.length})` },
  ]

  const showFoods = tab === 'all' || tab === 'foods'
  const showRests = tab === 'all' || tab === 'restaurants'
  const hasActive = q || veg || sort || minRating || minPrice || maxPrice

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Search input */}
      <div className="relative mb-5">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">🔍</span>
        <input
          autoFocus
          type="text"
          value={inputVal}
          onChange={handleInput}
          placeholder="Search dishes, restaurants, cuisines…"
          className="w-full pl-11 pr-10 py-3 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        />
        {inputVal && (
          <button
            onClick={() => { setInputVal(''); setParam('q', '') }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200 dark:border-gray-700">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setParam('tab', t.key === 'all' ? '' : t.key)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">

        {/* Veg pills */}
        {VEG_OPTS.map(o => (
          <button
            key={o.value}
            onClick={() => setParam('veg', o.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              veg === o.value
                ? o.active
                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-red-400'
            }`}
          >
            {o.label}
          </button>
        ))}

        {/* Rating pills */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400 mr-0.5">★</span>
          {RATING_OPTS.map(r => (
            <button
              key={r.value}
              onClick={() => setParam('min_rating', r.value)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                minRating === r.value
                  ? 'bg-yellow-500 text-white border-transparent'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-yellow-400'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Price range + sort — push to right on larger screens */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-gray-400">₹</span>
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            onBlur={applyPrice}
            className="w-16 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-400"
          />
          <span className="text-xs text-gray-400">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            onBlur={applyPrice}
            className="w-16 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-400"
          />

          <select
            value={sort}
            onChange={e => setParam('sort', e.target.value)}
            className="px-2.5 py-1.5 rounded-lg text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-400"
          >
            <option value="">Sort: Relevance</option>
            <option value="rating">Top Rated</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
          </select>

          {hasActive && (
            <button
              onClick={clearAll}
              className="text-xs text-red-500 hover:text-red-600 font-semibold px-2 py-1.5 rounded-lg border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <SkeletonLoader />
      ) : total === 0 ? (
        <EmptyState
          icon="🔍"
          title={q ? `No results for "${q}"` : 'Start searching'}
          description={
            q
              ? 'Try different keywords or adjust your filters.'
              : 'Search for dishes, restaurants, or cuisines above.'
          }
        />
      ) : (
        <div className="space-y-8">

          {/* Restaurant results */}
          {showRests && restaurants.length > 0 && (
            <section>
              {tab === 'all' && (
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">
                  Restaurants
                  <span className="ml-2 text-sm font-normal text-gray-400">({restaurants.length})</span>
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurants.map(r => (
                  <RestaurantCard key={r.id} restaurant={r} />
                ))}
              </div>
            </section>
          )}

          {/* Food results */}
          {showFoods && foods.length > 0 && (
            <section>
              {tab === 'all' && (
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">
                  Dishes
                  <span className="ml-2 text-sm font-normal text-gray-400">({foods.length})</span>
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {foods.map(f => (
                  <FoodCard key={f.id} food={f} />
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  )
}
