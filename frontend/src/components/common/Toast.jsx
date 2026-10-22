const COLORS = {
  success: 'bg-green-500',
  error:   'bg-red-500',
  info:    'bg-blue-500',
}

export default function Toast({ message, type = 'success', onClose }) {
  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${COLORS[type]}`}>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="text-white/80 hover:text-white text-lg leading-none">✕</button>
    </div>
  )
}
