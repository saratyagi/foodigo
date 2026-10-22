import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import api from '../../api/axios'
import { getAdminFoods, createFood, updateFood, deleteFood, getAdminCategories } from '../../api/admin'
import { useToast } from '../../context/ToastContext'

const EMPTY = {
  name: '', description: '', price: '', category_id: '', restaurant_id: '',
  veg: false, available: true, rating: 4.0,
  calories: '', protein_g: '', carbs_g: '', fat_g: '', diet_tags: '', temp_tags: ''
}

function FoodModal({ food, categories, restaurants, onSave, onClose }) {
  const [form, setForm] = useState({ ...EMPTY, ...food })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      category_id: parseInt(form.category_id) || null,
      restaurant_id: parseInt(form.restaurant_id) || null,
      rating: parseFloat(form.rating) || 0,
      calories: form.calories !== '' ? parseInt(form.calories) : null,
      protein_g: form.protein_g !== '' ? parseFloat(form.protein_g) : null,
      carbs_g: form.carbs_g !== '' ? parseFloat(form.carbs_g) : null,
      fat_g: form.fat_g !== '' ? parseFloat(form.fat_g) : null,
    }
    try {
      if (food.id) await updateFood(food.id, payload)
      else await createFood(payload)
      onSave()
    } catch (err) {
      setError(err.response?.data?.detail || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-800">{food.id ? 'Edit Food' : 'Add Food'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none">✕</button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category *</label>
              <select
                value={form.category_id}
                onChange={e => set('category_id', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
              >
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Restaurant *</label>
              <select
                value={form.restaurant_id}
                onChange={e => set('restaurant_id', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
              >
                <option value="">Select restaurant</option>
                {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Price (₹) *</label>
              <input
                type="number" min="0" step="0.01"
                value={form.price}
                onChange={e => set('price', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Rating (0–5)</label>
              <input
                type="number" min="0" max="5" step="0.1"
                value={form.rating}
                onChange={e => set('rating', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
              <input type="checkbox" checked={form.veg} onChange={e => set('veg', e.target.checked)} className="rounded" />
              Veg
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
              <input type="checkbox" checked={form.available} onChange={e => set('available', e.target.checked)} className="rounded" />
              Available
            </label>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Nutrition (optional)</p>
            <div className="grid grid-cols-4 gap-3">
              {[
                { key: 'calories',  label: 'Calories',   step: '1' },
                { key: 'protein_g', label: 'Protein (g)', step: '0.1' },
                { key: 'carbs_g',   label: 'Carbs (g)',   step: '0.1' },
                { key: 'fat_g',     label: 'Fat (g)',     step: '0.1' },
              ].map(n => (
                <div key={n.key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{n.label}</label>
                  <input
                    type="number" min="0" step={n.step}
                    value={form[n.key]}
                    onChange={e => set(n.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Diet Tags (CSV)</label>
              <input
                value={form.diet_tags}
                onChange={e => set('diet_tags', e.target.value)}
                placeholder="vegan,keto,high-protein"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Weather Tags (CSV)</label>
              <input
                value={form.temp_tags}
                onChange={e => set('temp_tags', e.target.value)}
                placeholder="rainy,hot,winter"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
            >
              {saving ? 'Saving…' : (food.id ? 'Update Food' : 'Add Food')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ManageFoods() {
  const [foods, setFoods] = useState([])
  const [categories, setCategories] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [search, setSearch] = useState('')
  const toast = useToast()

  const load = () =>
    Promise.all([getAdminFoods(), getAdminCategories(), api.get('/restaurants/')])
      .then(([f, c, r]) => {
        setFoods(f.data)
        setCategories(c.data)
        setRestaurants(r.data)
      })
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]))

  const handleDelete = async id => {
    if (!window.confirm('Delete this food item?')) return
    try {
      await deleteFood(id)
      setFoods(f => f.filter(x => x.id !== id))
      toast.success('Food deleted.')
    } catch {
      toast.error('Delete failed.')
    }
  }

  const filtered = foods.filter(f =>
    search === '' || f.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-extrabold text-gray-800">Manage Foods</h2>
            <p className="text-sm text-gray-400">{foods.length} items</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search foods…"
              className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 w-48"
            />
            <button
              onClick={() => setModal({ ...EMPTY })}
              className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
            >
              + Add Food
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-lg" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-center">Veg</th>
                    <th className="px-4 py-3 text-center">Available</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(food => (
                    <tr key={food.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{food.name}</td>
                      <td className="px-4 py-3 text-gray-500">{catMap[food.category_id] || '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">₹{food.price}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`w-2.5 h-2.5 rounded-full inline-block ${food.veg ? 'bg-green-500' : 'bg-red-500'}`} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${food.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {food.available ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-3">
                        <button
                          onClick={() => setModal(food)}
                          className="text-blue-500 hover:text-blue-700 text-xs font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(food.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">No foods found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <FoodModal
          food={modal}
          categories={categories}
          restaurants={restaurants}
          onSave={() => { toast.success('Food saved!'); setModal(null); setLoading(true); load() }}
          onClose={() => setModal(null)}
        />
      )}
    </AdminLayout>
  )
}
