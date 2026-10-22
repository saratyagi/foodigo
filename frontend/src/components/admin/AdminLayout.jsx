import { NavLink, useNavigate } from 'react-router-dom'

const NAV = [
  { to: '/admin/dashboard',   label: 'Dashboard',  icon: '📊' },
  { to: '/admin/foods',       label: 'Foods',       icon: '🍔' },
  { to: '/admin/categories',  label: 'Categories',  icon: '📂' },
  { to: '/admin/orders',      label: 'Orders',      icon: '📦' },
  { to: '/admin/users',       label: 'Users',       icon: '👥' },
]

export default function AdminLayout({ children }) {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-14 lg:w-56 flex-shrink-0 bg-gray-900 text-white flex flex-col fixed top-0 left-0 bottom-0 z-40">
        <div className="flex items-center gap-3 px-3 lg:px-5 h-16 border-b border-gray-700/50">
          <span className="text-2xl">🍕</span>
          <span className="hidden lg:block font-extrabold text-lg tracking-tight">Foodigo</span>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium
                 ${isActive
                   ? 'bg-red-500 text-white'
                   : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`
              }
            >
              <span className="text-lg flex-shrink-0">{n.icon}</span>
              <span className="hidden lg:block">{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-2 pb-4 space-y-1 border-t border-gray-700/50 pt-4">
          <NavLink
            to="/home"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors text-sm"
          >
            <span className="text-lg">🌐</span>
            <span className="hidden lg:block">Back to Site</span>
          </NavLink>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors text-sm"
          >
            <span className="text-lg">🚪</span>
            <span className="hidden lg:block">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-14 lg:ml-56 flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between sticky top-0 z-30">
          <h1 className="font-bold text-gray-800 text-lg">Admin Panel</h1>
          <span className="text-sm text-gray-400">Foodigo Admin</span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
