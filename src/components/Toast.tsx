import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type Kind = 'success' | 'error'
const ToastContext = createContext<(message: string, kind?: Kind) => void>(() => {})

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; message: string; kind: Kind }[]>([])

  const push = useCallback((message: string, kind: Kind = 'success') => {
    const id = Date.now() + Math.random()
    setItems(list => [...list, { id, message, kind }])
    setTimeout(() => setItems(list => list.filter(i => i.id !== id)), 4500)
  }, [])

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed left-1/2 top-4 z-[100] flex -translate-x-1/2 flex-col gap-2 px-4" role="status" aria-live="polite">
        {items.map(i => (
          <div key={i.id} className={`rounded-md border px-4 py-3 text-sm shadow-lg ${i.kind === 'error' ? 'border-red-500/50 bg-red-950 text-red-100' : 'border-line bg-panel text-white'}`}>
            {i.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
