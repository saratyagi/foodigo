import { useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { items } = useCart()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const searchRef = useRef(null)

  const cartCount = items.reduce((sum, i) => sum + i.qty, 0)
  const active   = 'text-red-500 font-semibold'
  const inactive = 'hover:text-red-500 transition-colors'

  const handleLogout = () => { logout(); navigate('/') }

  const handleSearch = (e) => {
    e.preventDefault()
    const q = searchRef.current?.value.trim()
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`)
    else   navigate('/search')
  }

  return (
    <nav className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4 justify-between">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-red-500 flex items-center gap-1 flex-shrink-0">
          🍕 <span>Foodigo</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-700 dark:text-gray-300">
          <NavLink to="/home"         className={({ isActive }) => isActive ? active : inactive}>Home</NavLink>
          <NavLink to="/categories"   className={({ isActive }) => isActive ? active : inactive}>Categories</NavLink>
          <NavLink to="/restaurants"  className={({ isActive }) => isActive ? active : inactive}>Restaurants</NavLink>
          <NavLink to="/meal-builder" className={({ isActive }) => isActive ? active : inactive}>Build Meal</NavLink>
        </div>

        {/* Inline search — desktop only */}
        <form onSubmit={handleSearch} className="hidden md:flex relative flex-1 max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">🔍</span>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search dishes or restaurants…"
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
          />
        </form>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user && (
            <Link to="/cart" className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-red-500">
              <span className="text-xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="hidden md:flex items-center gap-3 text-sm">
              <Link to="/profile" className="font-medium text-gray-700 dark:text-gray-300 hover:text-red-500">
                👤 {user.name.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors">
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-500">
                Login
              </Link>
              <Link to="/signup" className="bg-red-500 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-red-600 transition-colors">
                Sign Up
              </Link>
            </div>
          )}

          {/* Hamburger */}
          <button className="md:hidden p-2 text-gray-700 dark:text-gray-300" onClick={() => setOpen(o => !o)}>
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-4 flex flex-col gap-4 text-sm font-medium text-gray-700 dark:text-gray-300">
          {/* Mobile search */}
          <form onSubmit={(e) => { e.preventDefault(); const q = e.target.q.value.trim(); setOpen(false); navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search') }}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                name="q"
                type="text"
                placeholder="Search…"
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          </form>

          <NavLink to="/home"         onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/categories"   onClick={() => setOpen(false)}>Categories</NavLink>
          <NavLink to="/restaurants"  onClick={() => setOpen(false)}>Restaurants</NavLink>
          <NavLink to="/search"       onClick={() => setOpen(false)}>Search</NavLink>
          <NavLink to="/meal-builder" onClick={() => setOpen(false)}>Build Meal</NavLink>
          {user ? (
            <>
              <NavLink to="/orders"    onClick={() => setOpen(false)}>My Orders</NavLink>
              <NavLink to="/favorites" onClick={() => setOpen(false)}>Favorites</NavLink>
              <NavLink to="/profile"   onClick={() => setOpen(false)}>Profile</NavLink>
              <button onClick={() => { setOpen(false); handleLogout() }} className="text-left text-red-500">Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login"  onClick={() => setOpen(false)}>Login</NavLink>
              <NavLink to="/signup" onClick={() => setOpen(false)}>Sign Up</NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
