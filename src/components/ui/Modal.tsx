"use client"

import { HTMLAttributes, useEffect, useRef } from "react"

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  title?: string
}

export function Modal({ 
  className = "", 
  isOpen, 
  onClose, 
  title,
  children,
  ...props 
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div 
        className={`
          relative bg-[--bg-surface] border border-[--border] rounded-[16px] 
          shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto
          animate-in fade-in zoom-in-95 duration-120
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-[--border]">
            <h2 className="text-lg font-semibold text-[--text-primary] font-[family-name:var(--font-syne)]">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-[--text-muted] hover:text-[--text-primary] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
