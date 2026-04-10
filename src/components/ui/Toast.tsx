"use client"

import { useEffect, useState } from "react"

interface ToastProps {
  message: string
  type?: "success" | "error" | "info"
  onClose: () => void
  duration?: number
}

export function Toast({ message, type = "info", onClose, duration = 3000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 150)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const types = {
    success: "bg-[--brand] text-black",
    error: "bg-[--accent-red] text-white",
    info: "bg-[--accent-blue] text-white",
  }

  return (
    <div 
      className={`
        fixed top-4 right-4 z-[100] px-4 py-3 rounded-[16px] shadow-lg
        transform transition-all duration-150
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
        ${types[type]}
      `}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="opacity-70 hover:opacity-100">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
