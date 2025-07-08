"use client"

import { useState, useCallback } from "react"

interface Toast {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

let toastCount = 0

export function useToast() {
  const [toasts, setToasts] = useState<(Toast & { id: number })[]>([])

  const toast = useCallback(({ title, description, variant = "default" }: Toast) => {
    const id = toastCount++
    const newToast = { id, title, description, variant }

    setToasts((prev) => [...prev, newToast])

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return { toast, toasts }
}

// Simple toast component for demo
export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg backdrop-blur-sm border ${
            toast.variant === "destructive"
              ? "bg-red-500/20 border-red-500/50 text-red-200"
              : "bg-green-500/20 border-green-500/50 text-green-200"
          }`}
        >
          <div className="font-semibold">{toast.title}</div>
          {toast.description && <div className="text-sm opacity-90">{toast.description}</div>}
        </div>
      ))}
    </div>
  )
}

export const toast = (options: Toast) => {
  // This is a simplified version for the demo
  console.log("Toast:", options)
}
