/**
 * Foodigo chat query engine — Phase 2.
 * Pure JS. No network. No imports from React/router.
 *
 * runQuery(parsedQuery, catalog) → ChatResponse
 *
 * catalog: { foods: Food[], restaurants: Restaurant[], categories: Category[] }
 *
 * ChatResponse: {
 *   type          : 'RECOMMEND' | 'LIST' | 'COMPARE' | 'DETAIL' | 'RESTAURANT_INFO'
 *                 | 'BEST_RESTAURANT' | 'FASTEST_RESTAURANT' | 'CHEAPEST_RESTAURANT'
 *                 | 'NO_RESULTS' | 'UNKNOWN'
 *   text          : string         ← one-line summary rendered above the cards
 *   dishes        : Food[]         ← dish cards (may be empty)
 *   restaurantList: Restaurant[]   ← restaurant cards for list intents
 *   restaurant    : Restaurant | null  ← single restaurant for RESTAURANT_INFO
 *   fallback      : Food[] | null  ← closest alternatives when NO_RESULTS
 * }
 */

import { fuzzyMatchDishes } from './chatParser.js'

// ── Category slug → canonical DB name ─────────────────────────────────────

const SLUG_TO_CATNAME = {
  pizza:    'Pizza',
  burgers:  'Burgers',
  pasta:    'Pasta',
  indian:   'Indian',
  rice:     'Rice',
  noodles:  'Noodles',
  desserts: 'Desserts',
  drinks:   'Drinks',
}

// ── Sort comparators ───────────────────────────────────────────────────────

const SORTERS = {
  rating:       (a, b) => b.rating - a.rating,
  price_asc:    (a, b) => a.price - b.price,
  price_desc:   (a, b) => b.price - a.price,
  calories_asc: (a, b) => (a.calories ?? 9999) - (b.calories ?? 9999),
  protein_desc: (a, b) => (b.protein_g ?? 0) - (a.protein_g ?? 0),
}

// ── Tag helpers (diet_tags / temp_tags are CSV strings) ───────────────────

function csvTags(str) {
  return (str ?? '').split(',').map(t => t.trim()).filter(Boolean)
}

function hasDietTag(food, tag)  { return csvTags(food.diet_tags).includes(tag) }
function hasTempTag(food, tag)  { return csvTags(food.temp_tags).includes(tag) }

// ── Core filter ────────────────────────────────────────────────────────────

function applyFilters(foods, filters, categories) {
  // Resolve category slug → ID once
  let categoryId = null
  if (filters.categorySlug) {
    const target = SLUG_TO_CATNAME[filters.categorySlug]?.toLowerCase()
    const cat = categories.find(c => c.name.toLowerCase() === target)
    if (cat) categoryId = cat.id
  }

  return foods.filter(food => {
    if (!food.available) return false
    if (filters.veg !== null && food.veg !== filters.veg) return false
    if (filters.maxPrice !== null && food.price > filters.maxPrice) return false
    if (filters.minPrice !== null && food.price < filters.minPrice) return false
    if (categoryId !== null && food.category_id !== categoryId) return false
    if (filters.restaurantId !== null && food.restaurant_id !== filters.restaurantId) return false
    if (filters.diet.length > 0 && !filters.diet.every(tag => hasDietTag(food, tag))) return false
    if (filters.tempTag && !hasTempTag(food, filters.tempTag)) return false
    return true
  })
}

// ── Reason string for a single recommendation ─────────────────────────────

function buildReason(food, sort, restaurant) {
  const parts = []
  if (sort === 'protein_desc' && food.protein_g)
    parts.push(`${food.protein_g}g protein`)
  else if (sort === 'calories_asc' && food.calories)
    parts.push(`only ${food.calories} kcal`)
  else if (sort === 'price_asc')
    parts.push(`most affordable at ₹${food.price}`)
  else
    parts.push(`rated ${food.rating}`)
  if (restaurant)
    parts.push(`from ${restaurant.name}`)
  return parts.join(', ')
}

// ── Summary line for multi-dish results ───────────────────────────────────

function buildSummary(results, matched, filters, restaurants, intent, sort = 'rating') {
  const vegLabel  = filters.veg === true ? 'veg ' : filters.veg === false ? 'non-veg ' : ''
  const catLabel  = filters.categorySlug ? `${SLUG_TO_CATNAME[filters.categorySlug]} ` : ''
  const priceLabel= filters.maxPrice ? ` under ₹${filters.maxPrice}` : ''
  const dietLabel = filters.diet.length ? ` · ${filters.diet.join(', ')}` : ''
  const restName  = filters.restaurantId ? restaurants.find(r => r.id === filters.restaurantId)?.name : null
  const restLabel = restName ? ` at ${restName}` : ''
  const tempLabel = filters.tempTag ? ` for a ${filters.tempTag} day` : ''
  const moreLabel = matched.length > results.length ? ` (${matched.length} total)` : ''
  const n = results.length

  const sortLabel = sort === 'price_asc'    ? ', cheapest first'
                 : sort === 'price_desc'   ? ', priciest first'
                 : sort === 'calories_asc' ? ', lightest first'
                 : sort === 'protein_desc' ? ', highest protein first'
                 : ''
  if (intent === 'LIST') {
    return `${n} ${vegLabel}${catLabel}option${n !== 1 ? 's' : ''}${priceLabel}${dietLabel}${restLabel}${tempLabel}${moreLabel}.`
  }
  return `Top ${n} ${vegLabel}${catLabel}pick${n !== 1 ? 's' : ''}${priceLabel}${dietLabel}${restLabel}${tempLabel}${sortLabel}.`
}

// ── Main export ────────────────────────────────────────────────────────────

export function runQuery(parsed, catalog) {
  const { foods = [], restaurants = [], categories = [] } = catalog
  const { intent, filters, sort, dishQuery, limit, restaurantSort = 'rating' } = parsed

  // ── UNKNOWN ────────────────────────────────────────────────────────────

  if (intent === 'UNKNOWN') {
    return {
      type: 'UNKNOWN',
      text: 'I can help with the menu, prices, and recommendations — try one of the chips below.',
      dishes: [],
      restaurantList: [],
      restaurant: null,
      fallback: null,
    }
  }

  // ── BEST_RESTAURANT / FASTEST_RESTAURANT / CHEAPEST_RESTAURANT ─────────

  if (intent === 'BEST_RESTAURANT' || intent === 'FASTEST_RESTAURANT' || intent === 'CHEAPEST_RESTAURANT') {
    let restList = [...restaurants]

    // Filter by category if set ("best place for pizza" → only restaurants serving pizza)
    if (filters.categorySlug) {
      const catTarget = SLUG_TO_CATNAME[filters.categorySlug]?.toLowerCase()
      const cat = categories.find(c => c.name.toLowerCase() === catTarget)
      if (cat) {
        const servingIds = new Set(
          foods.filter(f => f.available && f.category_id === cat.id).map(f => f.restaurant_id)
        )
        restList = restList.filter(r => servingIds.has(r.id))
      }
    }

    if (restaurantSort === 'delivery_time') {
      const toMin = s => parseInt((s || '999 mins').replace(/\D+/g, '')) || 999
      restList.sort((a, b) => toMin(a.delivery_time) - toMin(b.delivery_time))
    } else if (restaurantSort === 'cost_asc') {
      restList.sort((a, b) => (a.price_for_two ?? 9999) - (b.price_for_two ?? 9999))
    } else {
      restList.sort((a, b) => b.rating - a.rating)
    }

    const results = restList.slice(0, limit)
    const sortLabel = restaurantSort === 'delivery_time' ? ', fastest first'
                    : restaurantSort === 'cost_asc'      ? ', cheapest first' : ''
    const catLabel  = filters.categorySlug ? ` serving ${SLUG_TO_CATNAME[filters.categorySlug]}` : ''

    return {
      type: intent,
      text: results.length > 0
        ? `${results.length} restaurant${results.length !== 1 ? 's' : ''}${catLabel}${sortLabel}.`
        : 'No matching restaurants found.',
      dishes: [],
      restaurantList: results,
      restaurant: null,
      fallback: null,
    }
  }

  // ── RESTAURANT_INFO ────────────────────────────────────────────────────

  if (intent === 'RESTAURANT_INFO') {
    const r = restaurants.find(x => x.id === filters.restaurantId) ?? null
    if (r) {
      const topDishes = foods
        .filter(f => f.available && f.restaurant_id === r.id)
        .sort(SORTERS.rating).slice(0, 3)
      const feeLabel = r.delivery_fee === 0 ? 'free delivery' : `₹${r.delivery_fee} delivery`
      return {
        type: 'RESTAURANT_INFO',
        text: `${r.name} · ${r.delivery_time} · Min ₹${r.min_order} · ${feeLabel} · ${r.open_hours}`,
        dishes: topDishes,
        restaurantList: [],
        restaurant: r,
        fallback: null,
      }
    }
    // No restaurant found — show all
    return {
      type: 'LIST',
      text: `${restaurants.length} restaurants available.`,
      dishes: [],
      restaurantList: [],
      restaurant: null,
      fallback: null,
    }
  }

  // ── Filter ─────────────────────────────────────────────────────────────

  let matched = applyFilters(foods, filters, categories)

  // ── Fuzzy dish-name overlay ────────────────────────────────────────────

  if (dishQuery) {
    const fuzzyHits = fuzzyMatchDishes(foods, dishQuery)
    if (matched.length === 0) {
      // Fall back to fuzzy results, still honour price / veg constraints
      matched = fuzzyHits.filter(f => {
        if (!f.available) return false
        if (filters.veg !== null && f.veg !== filters.veg) return false
        if (filters.maxPrice !== null && f.price > filters.maxPrice) return false
        if (filters.minPrice !== null && f.price < filters.minPrice) return false
        return true
      })
      if (matched.length === 0) matched = fuzzyHits
    } else {
      // Boost fuzzy hits to the top of the filtered set
      const hitIds = new Set(fuzzyHits.map(f => f.id))
      matched.sort((a, b) => {
        const aHit = hitIds.has(a.id) ? 0 : 1
        const bHit = hitIds.has(b.id) ? 0 : 1
        return aHit - bHit
      })
    }
  }

  // ── Sort ───────────────────────────────────────────────────────────────

  matched = [...matched].sort(SORTERS[sort] ?? SORTERS.rating)

  // ── COMPARE ────────────────────────────────────────────────────────────

  if (intent === 'COMPARE') {
    // Split dishQuery word-by-word so "cheese burst pepperoni" finds
    // "Cheese Burst Pizza" AND "Pepperoni Pizza" as separate dishes.
    const seen = new Set()
    const pair = []
    if (dishQuery) {
      const words = dishQuery.split(/\s+/).filter(w => w.length >= 4)
      for (const word of words) {
        for (const f of fuzzyMatchDishes(foods, word)) {
          if (!seen.has(f.id)) { seen.add(f.id); pair.push(f); break }  // one dish per word
        }
        if (pair.length === 2) break
      }
    }
    // Top-rated fallback to fill remaining slots (only if word search found < 2)
    if (pair.length < 2) {
      for (const f of matched) {
        if (!seen.has(f.id)) { seen.add(f.id); pair.push(f) }
        if (pair.length === 2) break
      }
    }

    if (pair.length === 2) {
      const [a, b] = pair
      const cheaper = a.price <= b.price ? a : b
      const pricier = a.price <= b.price ? b : a
      const priceDiff = pricier.price - cheaper.price

      const lines = []
      lines.push(`${cheaper.name} is ₹${priceDiff} cheaper`)
      if (a.calories && b.calories) {
        const lighter = a.calories <= b.calories ? a : b
        const calDiff = Math.abs(a.calories - b.calories)
        if (calDiff >= 20) lines.push(`${lighter.name} is lighter (${lighter.calories} kcal)`)
      }
      if (a.protein_g && b.protein_g) {
        const diff = Math.abs(a.protein_g - b.protein_g)
        if (diff >= 2) {
          const richer = a.protein_g >= b.protein_g ? a : b
          lines.push(`${richer.name} has more protein (${richer.protein_g}g)`)
        }
      }
      if (!a.veg && b.veg) lines.push(`${b.name} is veg`)
      else if (a.veg && !b.veg) lines.push(`${a.name} is veg`)

      return {
        type: 'COMPARE',
        text: lines.join('; ') + '.',
        dishes: pair,
        restaurant: null,
        fallback: null,
      }
    }

    return {
      type: 'NO_RESULTS',
      text: "Name two dishes to compare, e.g. 'compare Butter Chicken vs Paneer Biryani'.",
      dishes: [],
      restaurant: null,
      fallback: null,
    }
  }

  // ── DETAIL ─────────────────────────────────────────────────────────────

  if (intent === 'DETAIL') {
    // "tell me about Desi Tadka" — restaurantId set, no dish query → show restaurant info
    if (filters.restaurantId !== null && !dishQuery) {
      const r = restaurants.find(x => x.id === filters.restaurantId) ?? null
      if (r) {
        const topDishes = foods.filter(f => f.available && f.restaurant_id === r.id).sort(SORTERS.rating).slice(0, 3)
        const feeLabel = r.delivery_fee === 0 ? 'free delivery' : `₹${r.delivery_fee} delivery`
        return {
          type: 'RESTAURANT_INFO',
          text: `${r.name} · ${r.delivery_time} · Min ₹${r.min_order} · ${feeLabel} · ${r.open_hours}`,
          dishes: topDishes,
          restaurantList: [],
          restaurant: r,
          fallback: null,
        }
      }
    }

    const dish = matched[0] ?? null
    if (dish) {
      const r = restaurants.find(x => x.id === dish.restaurant_id) ?? null
      const tags = csvTags(dish.diet_tags)
      const parts = [`₹${dish.price}`, `⭐ ${dish.rating}`]
      if (dish.calories) parts.push(`${dish.calories} kcal`)
      if (dish.protein_g) parts.push(`${dish.protein_g}g protein`)
      if (dish.carbs_g) parts.push(`${dish.carbs_g}g carbs`)
      if (dish.fat_g) parts.push(`${dish.fat_g}g fat`)
      if (tags.length) parts.push(tags.join(', '))
      if (r) parts.push(`from ${r.name}`)
      return {
        type: 'DETAIL',
        text: `${dish.name} · ${parts.join(' · ')}`,
        dishes: [dish],
        restaurantList: [],
        restaurant: r,
        fallback: null,
      }
    }
  }

  // ── NO RESULTS ─────────────────────────────────────────────────────────

  if (matched.length === 0) {
    // Relax price constraint first to find alternatives
    const relaxedFilters = { ...filters, maxPrice: null, minPrice: null }
    let fallback = applyFilters(foods, relaxedFilters, categories)
      .sort(SORTERS.rating).slice(0, 3)

    // If still nothing (e.g. no matching category + restaurant), relax veg too
    if (fallback.length === 0) {
      fallback = applyFilters(foods, { ...relaxedFilters, veg: null }, categories)
        .sort(SORTERS.rating).slice(0, 3)
    }

    let text = ''
    if (filters.maxPrice !== null && fallback.length > 0) {
      const cheapest = [...fallback].sort(SORTERS.price_asc)[0]
      text = `Nothing found under ₹${filters.maxPrice}. Closest is ${cheapest.name} at ₹${cheapest.price}.`
    } else {
      text = 'No dishes match those filters.'
    }
    if (fallback.length > 0) text += ' Here are some alternatives:'

    return {
      type: 'NO_RESULTS',
      text,
      dishes: [],
      restaurant: null,
      fallback,
    }
  }

  // ── RECOMMEND / LIST ───────────────────────────────────────────────────

  const results = matched.slice(0, limit)

  let text = ''
  if (intent === 'RECOMMEND' && results.length === 1) {
    const dish = results[0]
    const r = restaurants.find(x => x.id === dish.restaurant_id) ?? null
    const reason = buildReason(dish, sort, r)
    text = `${dish.name} — ₹${dish.price} ⭐ ${dish.rating}. ${reason[0].toUpperCase()}${reason.slice(1)}.`
  } else {
    text = buildSummary(results, matched, filters, restaurants, intent, sort)
  }

  return {
    type: intent === 'LIST' ? 'LIST' : 'RECOMMEND',
    text,
    dishes: results,
    restaurant: null,
    fallback: null,
  }
}
