import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((message, type = 'info', options = {}) => {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`
    const durationMs = typeof options.durationMs === 'number' ? options.durationMs : 4000

    const toast = {
      id,
      message,
      type,
    }

    setToasts((prev) => [toast, ...prev].slice(0, 5))

    if (durationMs > 0) {
      window.setTimeout(() => removeToast(id), durationMs)
    }

    return id
  }, [removeToast])

  const value = useMemo(() => ({ showToast, removeToast }), [showToast, removeToast])

  const typeStyles = {
    success: 'border-green-200 bg-green-50 text-green-800 dark:border-green-800/40 dark:bg-green-900/20 dark:text-green-200',
    error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-200',
    info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800/40 dark:bg-blue-900/20 dark:text-blue-200',
  }

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed top-4 right-4 z-[9999] space-y-3 w-[92vw] max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`border rounded-lg shadow-md px-4 py-3 flex items-start justify-between gap-4 ${typeStyles[t.type] || typeStyles.info}`}
          >
            <div className="text-sm font-medium leading-snug break-words">{t.message}</div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="text-xs font-semibold opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastContext
