import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-red-500 via-orange-500 to-yellow-400 text-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <span className="text-6xl block mb-4 animate-bounce select-none">🍕</span>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
          Craving something<br />delicious?
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl mx-auto">
          Order from the best restaurants near you — delivered hot and fast.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/home"
            className="bg-white text-red-500 font-bold px-8 py-3 rounded-xl hover:bg-gray-50 transition-colors shadow-lg"
          >
            Order Now
          </Link>
          <Link
            to="/restaurants"
            className="border-2 border-white text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
    </section>
  )
}
