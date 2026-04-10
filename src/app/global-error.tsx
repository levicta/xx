"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error:", error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[--bg-surface] flex items-center justify-center">
          <span className="text-4xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-syne)] text-[--text-primary] mb-2">
          Something Went Wrong
        </h1>
        <p className="text-[--text-secondary] mb-8 max-w-md">
          We encountered an unexpected error. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-[--brand] text-black font-semibold rounded-[--radius-pill] hover:bg-[--brand-dim] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
