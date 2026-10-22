import { useEffect, useState } from 'react'
import api from '../../api/axios'
import FoodCard from '../food/FoodCard'

const RAINY_CODES = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99]

function weatherBucket(tempC, code) {
  if (RAINY_CODES.includes(code)) return 'rainy'
  if (tempC >= 30) return 'hot'
  if (tempC <= 15) return 'winter'
  return 'mild'
}

const CONFIG = {
  rainy:  { icon: '🌧️', label: 'Rainy day? Try these',   gradient: 'from-blue-500 to-indigo-500'   },
  hot:    { icon: '☀️',  label: 'Hot outside? Cool down', gradient: 'from-amber-400 to-orange-500'  },
  winter: { icon: '🥶',  label: 'Chilly out? Warm up',    gradient: 'from-sky-500 to-blue-600'      },
}

export default function WeatherSuggestions() {
  const [bucket, setBucket] = useState(null)
  const [foods, setFoods] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | done | hidden

  useEffect(() => {
    if (!navigator.geolocation) return
    setStatus('loading')

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,weathercode&timezone=auto`
          )
          const data = await res.json()
          const tempC = data.current.temperature_2m
          const code  = data.current.weathercode
          const b = weatherBucket(tempC, code)

          if (b === 'mild') { setStatus('hidden'); return }

          setBucket(b)
          const foodRes = await api.get(`/foods/weather?bucket=${b}`)
          if (foodRes.data.length === 0) { setStatus('hidden'); return }
          setFoods(foodRes.data.slice(0, 6))
          setStatus('done')
        } catch {
          setStatus('hidden')
        }
      },
      () => setStatus('hidden')
    )
  }, [])

  if (status !== 'done' || !bucket) return null

  const { icon, label, gradient } = CONFIG[bucket]

  return (
    <section>
      {/* Header strip */}
      <div className={`bg-gradient-to-r ${gradient} rounded-2xl px-5 py-3 flex items-center gap-2 mb-3`}>
        <span className="text-2xl">{icon}</span>
        <h2 className="font-bold text-white text-base">{label}</h2>
      </div>

      {/* Horizontal scroll of food cards */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {foods.map(food => (
          <div key={food.id} className="w-64 flex-shrink-0">
            <FoodCard food={food} />
          </div>
        ))}
      </div>
    </section>
  )
}
