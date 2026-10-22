import { useEffect } from 'react'
import { DIET_OPTIONS } from '../../utils/dietUtils'

const MACROS = [
  { key: 'calories',  label: 'Calories',  unit: 'kcal', dv: 2000, color: 'bg-orange-400' },
  { key: 'protein_g', label: 'Protein',   unit: 'g',    dv: 50,   color: 'bg-blue-400'   },
  { key: 'carbs_g',   label: 'Carbs',     unit: 'g',    dv: 275,  color: 'bg-yellow-400' },
  { key: 'fat_g',     label: 'Fat',       unit: 'g',    dv: 78,   color: 'bg-red-400'    },
]

export default function NutritionModal({ food, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const dietTags = (food.diet_tags || '').split(',').map(t => t.trim()).filter(Boolean)
  const matchedOptions = DIET_OPTIONS.filter(o => {
    if (o.key === 'high-protein') return (food.protein_g || 0) >= 20
    if (o.key === 'low-cal')      return (food.calories   || 0) <= 300
    return dietTags.includes(o.key)
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base">{food.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">Per serving · nutritional info</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none ml-3"
          >
            ×
          </button>
        </div>

        {/* Macro bars */}
        <div className="space-y-4">
          {MACROS.map(({ key, label, unit, dv, color }) => {
            const val = food[key] || 0
            const pct = Math.min(100, Math.round((val / dv) * 100))
            return (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {val} {unit}
                    <span className="text-gray-300 dark:text-gray-600 ml-1">({pct}% DV)</span>
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Diet tags */}
        {matchedOptions.length > 0 && (
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Dietary tags</p>
            <div className="flex flex-wrap gap-2">
              {matchedOptions.map(o => (
                <span
                  key={o.key}
                  className="flex items-center gap-1 px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-medium"
                >
                  {o.emoji} {o.label}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="mt-4 text-center text-[10px] text-gray-300 dark:text-gray-600">
          DV = Daily Value based on a 2000 kcal diet
        </p>
      </div>
    </div>
  )
}
