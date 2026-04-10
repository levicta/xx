"use client"

import { useState } from "react"
import { ReviewForm } from "@/components/order/ReviewForm"

interface ReviewSectionProps {
  orderId: string
  orderStatus: string
  isBuyer: boolean
  existingReview: {
    id: string
    rating: number
    comment: string | null
    createdAt: Date
    reviewer: { username: string }
  } | null
}

export function ReviewSection({ orderId, orderStatus, isBuyer, existingReview }: ReviewSectionProps) {
  const [review, setReview] = useState(existingReview)
  const [showForm, setShowForm] = useState(false)

  if (orderStatus !== "COMPLETED") return null
  if (!isBuyer) return null
  if (review) {
    return (
      <div className="mt-6 bg-[--bg-surface] border border-[--border] rounded-[16px] p-6">
        <h3 className="font-semibold text-[--text-primary] mb-4">Your Review</h3>
        <div className="flex items-center gap-2 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={`w-5 h-5 ${i < review.rating ? "text-[--accent-gold]" : "text-[--border]"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-sm text-[--text-muted] ml-2">
            {new Date(review.createdAt).toLocaleDateString()}
          </span>
        </div>
        {review.comment && (
          <p className="text-[--text-secondary]">{review.comment}</p>
        )}
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="mt-6">
        <ReviewForm orderId={orderId} onSuccess={() => setShowForm(false)} />
      </div>
    )
  }

  return (
    <div className="mt-6">
      <button
        onClick={() => setShowForm(true)}
        className="w-full py-3 bg-[--bg-surface] border border-[--border] hover:border-[--primary] text-[--text-primary] font-semibold rounded-[--radius-pill] transition-colors"
      >
        Leave a Review
      </button>
    </div>
  )
}