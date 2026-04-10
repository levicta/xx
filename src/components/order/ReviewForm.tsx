"use client"

import { useState } from "react"

interface ReviewFormProps {
  orderId: string
  onSuccess?: () => void
}

export function ReviewForm({ orderId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, rating, comment: comment || null }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to submit review")
      }

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[--bg-surface] border border-[--border] rounded-[16px] p-6">
      <h3 className="font-semibold text-[--text-primary] mb-4">Leave a Review</h3>
      
      <div className="flex items-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="focus:outline-none"
          >
            <svg
              className={`w-8 h-8 ${
                star <= rating ? "text-[--accent-gold]" : "text-[--border]"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-[--text-secondary]">
            {rating} star{rating !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a comment (optional)"
        className="w-full p-3 bg-[--bg-elevated] border border-[--border] rounded-[--radius-sm] text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:border-[--primary] resize-none"
        rows={3}
      />

      {error && <p className="mt-2 text-sm text-[--accent-red]">{error}</p>}

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="mt-4 w-full py-3 bg-[--brand] hover:bg-[--brand-dim] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-[--radius-pill] transition-colors"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  )
}