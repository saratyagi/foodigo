import { DIET_OPTIONS } from '../../utils/dietUtils'

export default function DietFilterBar({ selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {DIET_OPTIONS.map(({ key, label, emoji }) => {
        const active = selected.includes(key)
        return (
          <button
            key={key}
            onClick={() => onToggle(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              active
                ? 'bg-green-600 border-green-600 text-white shadow-sm'
                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-green-500 hover:text-green-600 dark:hover:text-green-400'
            }`}
          >
            <span>{emoji}</span>
            <span>{label}</span>
            {active && <span className="ml-0.5 opacity-80">×</span>}
          </button>
        )
      })}
      {selected.length > 0 && (
        <button
          onClick={() => selected.forEach(k => onToggle(k))}
          className="px-3 py-1.5 rounded-full text-xs text-red-500 border border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
