import { useState } from 'react'
import api from '../../api/axios'

const LABELS = ['Home', 'Work', 'Other']

export default function AddressForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    label: 'Home', name: '', phone: '', line: '', city: '', pincode: '', is_default: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/addresses/', form)
      onSave(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save address')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-900">
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Label tabs */}
      <div className="flex gap-2">
        {LABELS.map(l => (
          <button
            key={l} type="button"
            onClick={() => setForm(f => ({ ...f, label: l }))}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              form.label === l
                ? 'bg-red-500 text-white border-transparent'
                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { name: 'name',    label: 'Full Name',      type: 'text',    col: 1 },
          { name: 'phone',   label: 'Phone',          type: 'tel',     col: 1 },
          { name: 'line',    label: 'Street Address', type: 'text',    col: 2 },
          { name: 'city',    label: 'City',           type: 'text',    col: 1 },
          { name: 'pincode', label: 'Pincode',        type: 'text',    col: 1 },
        ].map(f => (
          <div key={f.name} className={f.col === 2 ? 'col-span-2' : ''}>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{f.label}</label>
            <input
              name={f.name} type={f.type} required
              value={form[f.name]} onChange={handle}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
        <input type="checkbox" name="is_default" checked={form.is_default} onChange={handle} className="accent-red-500" />
        Set as default address
      </label>

      <div className="flex gap-2 pt-1">
        <button
          type="submit" disabled={loading}
          className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-bold py-2 rounded-lg transition-colors"
        >
          {loading ? 'Saving…' : 'Save Address'}
        </button>
        <button
          type="button" onClick={onCancel}
          className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
