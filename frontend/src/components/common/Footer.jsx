import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <p className="text-white text-lg font-bold mb-2">🍕 Foodigo</p>
          <p className="text-sm">Delicious food delivered fast to your doorstep.</p>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Browse</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/restaurants" className="hover:text-white transition-colors">Restaurants</Link></li>
            <li><Link to="/categories"  className="hover:text-white transition-colors">Categories</Link></li>
            <li><Link to="/search"      className="hover:text-white transition-colors">Search</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Account</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/profile"   className="hover:text-white transition-colors">Profile</Link></li>
            <li><Link to="/orders"    className="hover:text-white transition-colors">My Orders</Link></li>
            <li><Link to="/favorites" className="hover:text-white transition-colors">Favorites</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Promo Codes</p>
          <ul className="space-y-2 text-sm font-mono">
            <li className="text-yellow-400">WELCOME50 — ₹50 off</li>
            <li className="text-yellow-400">SAVE20 — 20% off</li>
          </ul>
        </div>
      </div>
      <p className="text-center text-xs text-gray-600 mt-8">© 2025 Foodigo · Delhi, India</p>
    </footer>
  )
}
