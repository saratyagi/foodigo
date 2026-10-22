import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function Profile() {
  const { user, loginUser } = useAuth()
  const { favoriteIds } = useFavorites()
  const toast = useToast()

  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [orderCount, setOrderCount] = useState(null)
  const [addresses, setAddresses] = useState([])

  useEffect(() => {
    api.get('/orders/').then(r => setOrderCount(r.data.length)).catch(() => {})
    api.get('/addresses/').then(r => setAddresses(r.data)).catch(() => {})
  }, [])

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.patch('/auth/me', form)
      loginUser(localStorage.getItem('token'), data)
      toast.success('Profile updated!')
      setEditing(false)
    } catch {
      toast.error('Update failed.')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Avatar + basic info */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center text-white font-extrabold text-xl flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold text-gray-800 dark:text-gray-100">{user.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              user.role === 'admin'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              {user.role}
            </span>
            <span className="text-xs text-gray-400">Joined {formatDate(user.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Orders',     value: orderCount ?? '…', icon: '🛍️' },
          { label: 'Favourites', value: favoriteIds.size,  icon: '❤️' },
          { label: 'Addresses',  value: addresses.length,  icon: '📍' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-xl font-extrabold text-gray-800 dark:text-gray-100">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Edit profile */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 dark:text-gray-100">Profile Details</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-red-500 hover:underline"
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</label>
              <input
                value={form.phone || ''}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="+91 9876543210"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit" disabled={saving}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => { setEditing(false); setForm({ name: user.name, phone: user.phone || '' }) }}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 text-sm">
            {[
              { label: 'Name',  value: user.name },
              { label: 'Email', value: user.email },
              { label: 'Phone', value: user.phone || '—' },
            ].map(row => (
              <div key={row.label} className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{row.label}</span>
                <span className="font-medium text-gray-800 dark:text-gray-100">{row.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved addresses */}
      {addresses.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-3">Saved Addresses</h2>
          <div className="space-y-2">
            {addresses.map(addr => (
              <div key={addr.id} className="flex items-start gap-2 text-sm">
                <span className="text-gray-400 mt-0.5">📍</span>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{addr.label}: </span>
                  <span className="text-gray-500 dark:text-gray-400">{addr.line}, {addr.city} — {addr.pincode}</span>
                  {addr.is_default && (
                    <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-medium">Default</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
