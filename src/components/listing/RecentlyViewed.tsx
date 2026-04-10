"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getRecentlyViewed, RecentlyViewedItem } from "@/lib/recentlyViewed"

export function RecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setItems(getRecentlyViewed())
  }, [])

  if (!mounted || items.length === 0) return null

  return (
    <div className="mb-12">
      <h2
        className="flex items-center gap-3 mb-4"
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: "var(--foreground)",
          borderLeft: "3px solid var(--primary)",
          paddingLeft: "12px",
        }}
      >
        recently viewed
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/item/${item.id}`}
            className="flex-shrink-0 w-40 bg-card border border-border rounded-lg p-4 hover:border-[--primary] transition-colors"
          >
            <p className="text-xs text-muted-foreground mb-1">{item.gameName}</p>
            <p className="text-sm font-bold text-card-foreground truncate">{item.title}</p>
            <p className="text-base font-bold text-primary mt-2">${item.price.toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}