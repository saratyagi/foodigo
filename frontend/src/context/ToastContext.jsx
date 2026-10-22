import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

const Ctx = createContext(null)

const CONFIG = {
  success: { icon: '✓', bg: 'bg-green-600' },
  error:   { icon: '✕', bg: 'bg-red-600'   },
  info:    { icon: 'ℹ', bg: 'bg-blue-600'  },
  warn:    { icon: '⚠', bg: 'bg-amber-500' },
}

function ToastItem({ t, onDismiss }) {
  const { icon, bg } = CONFIG[t.type] || CONFIG.info
  return (
    <div className={`toast-enter flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium min-w-[260px] max-w-sm pointer-events-auto ${bg}`}>
      <span className="font-bold flex-shrink-0 w-4 text-center">{icon}</span>
      <span className="flex-1 leading-snug">{t.message}</span>
      <button
        onClick={onDismiss}
        className="text-white/70 hover:text-white transition-colors flex-shrink-0 text-base leading-none ml-1"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback(id => {
    setToasts(t => t.filter(x => x.id !== id))
  }, [])

  const show = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t.slice(-3), { id, message, type }])
    setTimeout(() => dismiss(id), duration)
  }, [dismiss])

  const toast = useMemo(() => ({
    success: (msg, dur) => show(msg, 'success', dur),
    error:   (msg, dur) => show(msg, 'error',   dur),
    info:    (msg, dur) => show(msg, 'info',     dur),
    warn:    (msg, dur) => show(msg, 'warn',     dur),
  }), [show])

  return (
    <Ctx.Provider value={toast}>
      {children}
      {createPortal(
        <div className="fixed bottom-6 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
          {toasts.map(t => (
            <ToastItem key={t.id} t={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </div>,
        document.body
      )}
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)
