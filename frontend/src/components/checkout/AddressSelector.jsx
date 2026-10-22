import { useState } from 'react'
import AddressForm from './AddressForm'

export default function AddressSelector({ addresses, selectedId, onSelect, onNewAddress }) {
  const [showForm, setShowForm] = useState(false)

  const handleSave = addr => {
    onNewAddress(addr)
    setShowForm(false)
  }

  return (
    <div className="space-y-3">
      {addresses.length === 0 && !showForm && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No saved addresses. Add one below.</p>
      )}

      {addresses.map(addr => (
        <label
          key={addr.id}
          className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
            selectedId === addr.id
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <input
            type="radio" name="address" value={addr.id}
            checked={selectedId === addr.id}
            onChange={() => onSelect(addr.id)}
            className="mt-0.5 accent-red-500"
          />
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {addr.label} — {addr.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {addr.line}, {addr.city} — {addr.pincode}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{addr.phone}</p>
          </div>
          {addr.is_default && (
            <span className="ml-auto text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
              Default
            </span>
          )}
        </label>
      ))}

      {showForm ? (
        <AddressForm onSave={handleSave} onCancel={() => setShowForm(false)} />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:border-red-400 hover:text-red-500 transition-colors"
        >
          + Add New Address
        </button>
      )}
    </div>
  )
}
