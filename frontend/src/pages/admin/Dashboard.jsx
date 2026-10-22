import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { getStats, getAdminOrders } from '../../api/admin'

const STATUS_COLOR = {
  Confirmed:            'bg-blue-100 text-blue-700',
  Preparing:            'bg-yellow-100 text-yellow-700',
  Cooking:              'bg-orange-100 text-orange-700',
  'Out for Delivery':   'bg-purple-100 text-purple-700',
  Delivered:            'bg-green-100 text-green-700',
  Cancelled:            'bg-red-100 text-red-700',
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getStats(), getAdminOrders()])
      .then(([s, o]) => {
        setStats(s.data)
        setOrders(o.data.slice(0, 8))
      })
      .finally(() => setLoading(false))
  }, [])

  const CARDS = stats ? [
    { label: 'Total Users',   value: stats.total_users,                   icon: '👥', color: 'from-blue-400 to-blue-600' },
    { label: 'Total Orders',  value: stats.total_orders,                  icon: '📦', color: 'from-orange-400 to-orange-600' },
    { label: 'Orders Today',  value: stats.orders_today,                  icon: '🛍️', color: 'from-purple-400 to-purple-600' },
    { label: 'Revenue Today', value: `₹${stats.revenue_today.toFixed(0)}`, icon: '💰', color: 'from-green-400 to-green-600' },
  ] : []

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800">Dashboard</h2>
          <p className="text-sm text-gray-400 mt-0.5">Overview of Foodigo operations</p>
        </div>

        {/* Stat cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CARDS.map(c => (
              <div key={c.label} className={`bg-gradient-to-br ${c.color} rounded-2xl p-5 text-white`}>
                <p className="text-3xl mb-2">{c.icon}</p>
                <p className="text-2xl font-extrabold">{c.value}</p>
                <p className="text-sm opacity-80 mt-0.5">{c.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Recent Orders</h3>
            <Link to="/admin/orders" className="text-sm text-red-500 hover:underline">View all →</Link>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <p className="text-center text-gray-400 py-10 text-sm">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-6 py-3 text-left">Order</th>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-right">Total</th>
                    <th className="px-6 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-800">#{o.id}</td>
                      <td className="px-6 py-3 text-gray-400 text-xs">
                        {new Date(o.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-gray-800">₹{o.total}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[o.status] || 'bg-gray-100 text-gray-600'}`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: '/admin/foods',       label: 'Manage Foods',      icon: '🍔' },
            { to: '/admin/categories',  label: 'Categories',         icon: '📂' },
            { to: '/admin/orders',      label: 'All Orders',         icon: '📦' },
            { to: '/admin/users',       label: 'Users',              icon: '👥' },
          ].map(l => (
            <Link
              key={l.to}
              to={l.to}
              className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-red-300 hover:shadow-sm transition-all group"
            >
              <p className="text-2xl mb-1">{l.icon}</p>
              <p className="text-sm font-medium text-gray-700 group-hover:text-red-500 transition-colors">{l.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
