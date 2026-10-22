import { useState } from 'react'
import SurpriseModal from './SurpriseModal'

export default function SurpriseMe({ foods }) {
  const [pick, setPick] = useState(null)

  const roll = () => {
    if (!foods.length) return
    setPick(foods[Math.floor(Math.random() * foods.length)])
  }

  return (
    <>
      <button
        onClick={roll}
        disabled={!foods.length}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all shadow-sm"
      >
        <span>🎲</span>
        <span>Surprise Me</span>
      </button>

      {pick && (
        <SurpriseModal
          food={pick}
          onClose={() => setPick(null)}
          onReroll={roll}
        />
      )}
    </>
  )
}
