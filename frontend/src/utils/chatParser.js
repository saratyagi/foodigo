/**
 * Foodigo chat intent parser — zero cost, pure JS, no imports.
 *
 * parseChat(message, catalog) → ParsedQuery
 *
 * catalog: { foods: Food[], restaurants: Restaurant[] }
 *
 * ParsedQuery: {
 *   intent   : 'RECOMMEND' | 'LIST' | 'DETAIL' | 'COMPARE' | 'RESTAURANT_INFO' | 'UNKNOWN'
 *   filters  : { maxPrice, minPrice, veg, diet[], restaurantId, categorySlug, tempTag }
 *   sort     : 'rating' | 'price_asc' | 'price_desc' | 'calories_asc' | 'protein_desc'
 *   dishQuery: string | null   ← free-text remainder for fuzzy name match
 *   limit    : number
 * }
 */

// ── Vocabulary ─────────────────────────────────────────────────────────────

const DIET_TAGS = ['vegan', 'jain', 'dairy-free', 'gluten-free', 'high-protein', 'low-cal', 'keto']

// Maps user word → canonical category slug (matches CATEGORY_EMOJI keys)
const CATEGORY_MAP = {
  pizza: 'pizza', pizzas: 'pizza',
  burger: 'burgers', burgers: 'burgers', veggie: 'burgers',
  pasta: 'pasta', spaghetti: 'pasta', penne: 'pasta',
  noodle: 'noodles', noodles: 'noodles', chowmein: 'noodles', ramen: 'noodles', hakka: 'noodles',
  rice: 'rice', biryani: 'rice', biriyani: 'rice', birayni: 'rice', pulao: 'rice',
  indian: 'indian', curry: 'indian', masala: 'indian', paneer: 'indian', dal: 'indian', desi: 'indian', tikka: 'indian',
  dessert: 'desserts', desserts: 'desserts', sweet: 'desserts', cake: 'desserts', brownie: 'desserts', gulab: 'desserts',
  drink: 'drinks', drinks: 'drinks', juice: 'drinks', shake: 'drinks', lassi: 'drinks', beverage: 'drinks', chai: 'drinks',
}

// Maps weather word → temp_tag bucket
const TEMP_MAP = {
  rainy: ['rainy', 'rain', 'raining', 'monsoon', 'drizzle', 'wet'],
  hot:   ['hot', 'summer', 'heat', 'scorching', 'sweating', 'humid'],
  winter:['winter', 'cold', 'chilly', 'cozy', 'chill', 'freezing', 'warmth', 'warm up'],
}

// ── Levenshtein distance for typo tolerance ────────────────────────────────

function levenshtein(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

// Returns true if needle fuzzy-matches any word in haystack (edit distance ≤ 2)
function fuzzyIncludes(haystack, needle) {
  if (haystack.includes(needle)) return true
  const words = haystack.split(/\s+/)
  return words.some(w => w.length > 3 && needle.length > 3 && levenshtein(w, needle) <= 2)
}

// ── Main parser ────────────────────────────────────────────────────────────

export function parseChat(rawMessage, catalog = {}) {
  const msg = rawMessage.toLowerCase().replace(/['']/g, "'").trim()
  const { restaurants = [] } = catalog

  const filters = {
    maxPrice:     null,
    minPrice:     null,
    veg:          null,
    diet:         [],
    restaurantId: null,
    categorySlug: null,
    tempTag:      null,
  }
  let sort      = 'rating'
  let intent    = 'RECOMMEND'
  let dishQuery = null
  let limit     = 3

  // ── Pass 1: Filters ────────────────────────────────────────────────────

  // Price ceiling
  const maxM = msg.match(/(?:under|below|less\s+than|max(?:imum)?|upto|up\s+to|within|not\s+more\s+than)\s*₹?\s*(\d+)/)
  if (maxM) filters.maxPrice = parseInt(maxM[1], 10)

  // Price floor
  const minM = msg.match(/(?:over|above|more\s+than|at\s+least|min(?:imum)?)\s*₹?\s*(\d+)/)
  if (minM) filters.minPrice = parseInt(minM[1], 10)

  // "around ₹300" → ±20% window
  const aroundM = msg.match(/(?:around|roughly|about|approx(?:imately)?)\s*₹?\s*(\d+)/)
  if (aroundM && !filters.maxPrice && !filters.minPrice) {
    const n = parseInt(aroundM[1], 10)
    filters.minPrice = Math.floor(n * 0.8)
    filters.maxPrice = Math.ceil(n * 1.2)
  }

  // Veg / non-veg (non-veg checked first so "chicken" doesn't also set veg=true)
  if (/\b(non[- ]?veg(?:etarian)?|nonveg|chicken|mutton|meat|fish|egg|prawn|lamb|keema)\b/.test(msg)) {
    filters.veg = false
  } else if (/\b(veg(?:etarian)?|no\s+meat|no\s+chicken|no\s+fish|meatless|plant[- ]?based)\b/.test(msg)) {
    filters.veg = true
  }

  // Diet tags — canonical match
  for (const tag of DIET_TAGS) {
    const pat = tag.replace('-', '[- ]?')
    if (new RegExp(`\\b${pat}\\b`).test(msg)) {
      if (!filters.diet.includes(tag)) filters.diet.push(tag)
    }
  }
  // Aliases for diet tags
  if (/\b(low[- ]?cal(?:orie)?s?|diet food|light meal|light food)\b/.test(msg) && !filters.diet.includes('low-cal'))
    filters.diet.push('low-cal')
  if (/\b(high[- ]?protein|gym|fitness|protein[- ]?rich|muscle|bulking|post[- ]?workout)\b/.test(msg) && !filters.diet.includes('high-protein'))
    filters.diet.push('high-protein')

  // Category — scan each token against CATEGORY_MAP
  const tokens = msg.split(/[\s,]+/)
  for (const tok of tokens) {
    const clean = tok.replace(/[^a-z]/g, '')
    if (CATEGORY_MAP[clean]) { filters.categorySlug = CATEGORY_MAP[clean]; break }
  }
  // Multi-word categories
  if (!filters.categorySlug) {
    if (/fried\s+rice/.test(msg))  filters.categorySlug = 'rice'
    if (/ice\s+cream/.test(msg))   filters.categorySlug = 'desserts'
    if (/soft\s+drink/.test(msg))  filters.categorySlug = 'drinks'
    if (/biryani|biriyani|birayni|biryaani/.test(msg)) filters.categorySlug = 'rice'
  }

  // Restaurant — exact substring for short words, fuzzy (≤1) for long words
  // Avoids "best"↔"zesty" collisions (LD=2)
  for (const r of restaurants) {
    const parts = r.name.toLowerCase().split(/\s+/)
    const matched = parts.some(p => {
      if (msg.includes(p)) return true                          // exact
      if (p.length >= 6) return fuzzyIncludes(msg, p)          // fuzzy only for longer tokens
      return false
    })
    if (matched) { filters.restaurantId = r.id; break }
  }

  // Weather / mood temp tag
  for (const [tag, keywords] of Object.entries(TEMP_MAP)) {
    if (keywords.some(kw => msg.includes(kw))) { filters.tempTag = tag; break }
  }

  // ── Pass 2: Sort ───────────────────────────────────────────────────────

  let sortExplicit = false
  if (/\b(cheap(?:est)?|budget|low[- ]?price|affordable|inexpensive|economical|pocket[- ]?friendly|value)\b/.test(msg)) {
    sort = 'price_asc'; sortExplicit = true
  } else if (/\b(expensive|premium|luxury|high[- ]?end|pricey)\b/.test(msg)) {
    sort = 'price_desc'; sortExplicit = true
  } else if (/\b(health(?:y|iest)?|light(?:est)?|low[- ]?cal(?:orie)?|diet|fit|slim)\b/.test(msg) && !filters.diet.includes('high-protein')) {
    sort = 'calories_asc'; sortExplicit = true
  } else if (/\b(protein|gym|fit(?:ness)?|filling|high[- ]?protein|muscle|bulking)\b/.test(msg)) {
    sort = 'protein_desc'; sortExplicit = true
  } else if (/\b(best|top|popular|recommend(?:ed)?|highest[- ]?rated|most[- ]?popular|favourite|favorite|trending)\b/.test(msg)) {
    sort = 'rating'; sortExplicit = true
  }

  // ── Entity detection (before intent) ───────────────────────────────────

  const RESTAURANT_NOUNS = /\b(restaurants?|places?|outlets?|eatery|eateries|kitchens?|joints?|spots?)\b/

  // Restaurant sort — used when entity=RESTAURANT
  let restaurantSort = 'rating'
  if (/\b(fastest|quickest|quick\s+delivery|fast\s+delivery)\b/.test(msg)) {
    restaurantSort = 'delivery_time'
  } else if (/\b(cheap(?:est)?|budget|affordable|low[- ]?cost|economical|pocket[- ]?friendly|value)\b/.test(msg)) {
    restaurantSort = 'cost_asc'
  }

  // Entity is RESTAURANT when:
  //   • an explicit restaurant noun appears, OR
  //   • "fastest/quickest" + "delivery" implies comparing restaurants (not dishes)
  const entity =
    RESTAURANT_NOUNS.test(msg) ? 'RESTAURANT' :
    (restaurantSort === 'delivery_time' && /\bdelivery\b/.test(msg)) ? 'RESTAURANT' :
    'DISH'

  // ── Pass 3: Intent ─────────────────────────────────────────────────────

  if (/\b(vs\.?|versus|compare|comparison|difference\s+between|better(?:\s+than)?|which\s+(?:is|one))\b/.test(msg)) {
    intent = 'COMPARE'
    limit  = 2
  } else if (entity === 'RESTAURANT') {
    // Named restaurant → show its info
    if (filters.restaurantId !== null) {
      intent = 'RESTAURANT_INFO'
    } else if (restaurantSort === 'delivery_time') {
      intent = 'FASTEST_RESTAURANT'
    } else if (restaurantSort === 'cost_asc') {
      intent = 'CHEAPEST_RESTAURANT'
    } else {
      intent = 'BEST_RESTAURANT'
    }
    limit = 3
  } else {
    // Dish entity — existing logic
    if (/\b(delivery(?:\s+(?:time|fee|info|charge|details?))?|open(?:ing)?|hours|timings?|min(?:imum)?\s*order)\b/.test(msg)) {
      intent = 'RESTAURANT_INFO'
      limit  = 3
    } else if (/\b(what\s+is|tell\s+me\s+about|details?|info(?:rmation)?|more\s+about|describe|nutrition|calories|macros?)\b/.test(msg)) {
      intent = 'DETAIL'
      limit  = 1
    } else if (/\b(show(?:\s+me)?|list|all|every|what\s+are|which|available|options|give\s+me|menu)\b/.test(msg)) {
      intent = 'LIST'
      limit  = 6
    } else {
      intent = 'RECOMMEND'
      limit  = 3
    }
  }

  // ── Pass 4: Free-text dish-name fallback ──────────────────────────────

  // Strip known structural words to isolate dish name tokens
  let stripped = msg
    .replace(/(?:under|below|less\s+than|max(?:imum)?|upto|up\s+to|within|over|above|more\s+than|at\s+least|around|about|approx(?:imately)?)\s*₹?\s*\d+/g, '')
    .replace(/₹\s*\d+/g, '')
    .replace(/\b(veg(?:etarian)?|non[- ]?veg(?:etarian)?|nonveg|chicken|mutton|meat|fish)\b/g, '')
    .replace(/\b(cheap(?:est)?|budget|affordable|expensive|premium|best|top|popular|recommend(?:ed)?|healthy|light|protein|gym|fitness)\b/g, '')
    .replace(/\b(show(?:\s+me)?|list|all|every|what(?:\s+are)?|which|available|options|give\s+me|menu|tell\s+me|info(?:rmation)?|details?|more\s+about|describe)\b/g, '')
    .replace(/\b(want|need|get|find|looking\s+for|suggest|i|me|my|a|an|the|some|any|for|with|and|or|of|at|in|is|are|have|something|anything|please|hi|hello|hey|there|today|now|good|nice|great|rainy|rain|raining|monsoon|drizzle|wet|hot|summer|heat|winter|cold|chilly|cozy|chill|compare|versus|vs|between|difference|dish|dishes|option|options|item|items|food|foods|meal|meals|about|up)\b/g, '')
    .replace(/[^a-z\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

  // Remove category words already captured
  if (filters.categorySlug) {
    for (const [alias, slug] of Object.entries(CATEGORY_MAP)) {
      if (slug === filters.categorySlug) {
        stripped = stripped.replace(new RegExp(`\\b${alias}\\b`, 'g'), '').trim()
      }
    }
  }

  // Remove restaurant name words already captured
  if (filters.restaurantId) {
    const r = restaurants.find(x => x.id === filters.restaurantId)
    if (r) {
      r.name.toLowerCase().split(/\s+/).forEach(part => {
        stripped = stripped.replace(new RegExp(`\\b${part}\\b`, 'g'), '').trim()
      })
    }
  }

  if (stripped.length >= 4) dishQuery = stripped

  // ── UNKNOWN guard ──────────────────────────────────────────────────────

  const hasFilters =
    filters.maxPrice !== null || filters.minPrice !== null ||
    filters.veg !== null || filters.diet.length > 0 ||
    filters.restaurantId !== null || filters.categorySlug !== null ||
    filters.tempTag !== null

  if (!hasFilters && !dishQuery && !sortExplicit && intent === 'RECOMMEND') {
    intent = 'UNKNOWN'
  }

  return { intent, filters, sort, dishQuery, limit, entity, restaurantSort }
}

// ── Fuzzy dish search (used by query engine) ──────────────────────────────

export function fuzzyMatchDishes(foods, query) {
  if (!query) return []
  const q = query.toLowerCase()
  return foods
    .map(food => {
      const nameScore = fuzzyIncludes(food.name.toLowerCase(), q) ? 2 : 0
      const descScore = food.description && fuzzyIncludes(food.description.toLowerCase(), q) ? 1 : 0
      return { food, score: nameScore + descScore }
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || b.food.rating - a.food.rating)
    .map(x => x.food)
}
