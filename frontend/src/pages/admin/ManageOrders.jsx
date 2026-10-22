import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { getAdminOrders, updateOrderStatus } from '../../api/admin'
import { useToast } from '../../context/ToastContext'

const STATUSES = ['Confirmed', 'Preparing', 'Cooking', 'Out for Delivery', 'Delivered', 'Cancelled']

const STATUS_COLOR = {
  Confirmed:            'text-blue-700 bg-blue-50',
  Preparing:            'text-yellow-700 bg-yellow-50',
  Cooking:              'text-orange-700 bg-orange-50',
  'Out for Delivery':   'text-purple-700 bg-purple-50',
  Delivered:            'text-green-700 bg-green-50',
  Cancelled:            'text-red-700 bg-red-50',
}

export default function ManageOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState({})
  const [filterStatus, setFilterStatus] = useState('All')
  const toast = useToast()

  useEffect(() => {
    getAdminOrders()
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false))
  }, [])

  const handleStatusChange = async (orderId, status) => {
    setUpdating(u => ({ ...u, [orderId]: true }))
    try {
      await updateOrderStatus(orderId, status)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
      toast.success('Status updated.')
    } catch {
      toast.error('Status update failed.')
    } finally {
      setUpdating(u => ({ ...u, [orderId]: false }))
    }
  }

  const filtered = filterStatus === 'All' ? orders : orders.filter(o => o.status === filterStatus)

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-extrabold text-gray-800">Manage Orders</h2>
            <p className="text-sm text-gray-400">{orders.length} total orders</p>
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
          >
            <option value="All">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-sm">No orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-5 py-3 text-left">Order</th>
                    <th className="px-5 py-3 text-left">User ID</th>
                    <th className="px-5 py-3 text-left">Date</th>
                    <th className="px-5 py-3 text-right">Total</th>
                    <th className="px-5 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-800">#{o.id}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs font-mono">{o.user_id}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {new Date(o.created_at).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-800">₹{o.total}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={o.status}
                            onChange={e => handleStatusChange(o.id, e.target.value)}
                            disabled={updating[o.id]}
                            className={`text-xs font-semibold px-2 py-1.5 rounded-lg border border-transparent
                              focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer
                              disabled:opacity-50 disabled:cursor-not-allowed
                              ${STATUS_COLOR[o.status] || 'text-gray-600 bg-gray-50'}`}
                          >
                            {STATUSES.map(s => (
                              <option key={s} value={s} className="text-gray-800 bg-white">{s}</option>
                            ))}
                          </select>
                          {updating[o.id] && (
                            <span className="text-xs text-gray-400 animate-pulse">saving…</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
