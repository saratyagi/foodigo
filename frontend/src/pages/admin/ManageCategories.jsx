import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from '../../api/admin'
import { useToast } from '../../context/ToastContext'

const EMPTY = { name: '', image: '' }

function CatModal({ cat, onSave, onClose }) {
  const [form, setForm] = useState({ ...EMPTY, ...cat })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (cat.id) await updateCategory(cat.id, form)
      else await createCategory(form)
      onSave()
    } catch (err) {
      setError(err.response?.data?.detail || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-800">{cat.id ? 'Edit Category' : 'Add Category'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none">✕</button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Image URL</label>
            <input
              value={form.image}
              onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            {form.image && (
              <img
                src={form.image}
                alt="preview"
                className="mt-2 h-16 w-16 rounded-lg object-cover bg-gray-100"
                onError={e => { e.currentTarget.style.display = 'none' }}
              />
            )}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
            >
              {saving ? 'Saving…' : (cat.id ? 'Update' : 'Add Category')}
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

export default function ManageCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const toast = useToast()

  const load = () =>
    getAdminCategories()
      .then(r => setCategories(r.data))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const handleDelete = async id => {
    if (!window.confirm('Delete this category? Foods linked to it may be affected.')) return
    try {
      await deleteCategory(id)
      setCategories(c => c.filter(x => x.id !== id))
      toast.success('Category deleted.')
    } catch {
      toast.error('Delete failed — category may still have foods linked to it.')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-gray-800">Manage Categories</h2>
            <p className="text-sm text-gray-400">{categories.length} categories</p>
          </div>
          <button
            onClick={() => setModal({ ...EMPTY })}
            className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            + Add Category
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-lg" />)}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3 text-left">ID</th>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left hidden md:table-cell">Image URL</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-400 font-mono text-xs">#{cat.id}</td>
                    <td className="px-6 py-3 font-medium text-gray-800">
                      <div className="flex items-center gap-3">
                        {cat.image
                          ? <img src={cat.image} alt="" className="w-8 h-8 rounded-lg object-cover bg-gray-100 flex-shrink-0" onError={e => { e.currentTarget.style.display = 'none' }} />
                          : <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0" />
                        }
                        {cat.name}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-400 text-xs truncate max-w-[200px] hidden md:table-cell">
                      {cat.image || '—'}
                    </td>
                    <td className="px-6 py-3 text-right space-x-3">
                      <button onClick={() => setModal(cat)} className="text-blue-500 hover:text-blue-700 text-xs font-semibold">Edit</button>
                      <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Delete</button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400 text-sm">No categories yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <CatModal
          cat={modal}
          onSave={() => { toast.success('Category saved!'); setModal(null); setLoading(true); load() }}
          onClose={() => setModal(null)}
        />
      )}
    </AdminLayout>
  )
}
