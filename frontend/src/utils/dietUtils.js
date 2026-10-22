export const DIET_OPTIONS = [
  { key: 'high-protein', label: 'High Protein', emoji: '💪' },
  { key: 'low-cal',      label: 'Low Cal',      emoji: '🥗' },
  { key: 'vegan',        label: 'Vegan',         emoji: '🌱' },
  { key: 'gluten-free',  label: 'Gluten-Free',   emoji: '🌾' },
  { key: 'dairy-free',   label: 'Dairy-Free',    emoji: '🥛' },
  { key: 'keto',         label: 'Keto',          emoji: '🥑' },
  { key: 'jain',         label: 'Jain',          emoji: '🙏' },
]

export function matchesDiet(food, filters) {
  for (const f of filters) {
    if (f === 'high-protein') {
      if ((food.protein_g || 0) < 20) return false
    } else if (f === 'low-cal') {
      if ((food.calories || 9999) > 300) return false
    } else {
      const tags = (food.diet_tags || '').split(',').map(t => t.trim()).filter(Boolean)
      if (!tags.includes(f)) return false
    }
  }
  return true
}
