"use client"

import { useEffect } from "react"
import { addToRecentlyViewed } from "@/lib/recentlyViewed"

interface ViewTrackerProps {
  listing: {
    id: string
    title: string
    price: number
    images: string[]
    game: { name: string; slug: string }
    seller: { username: string }
  }
  children: React.ReactNode
}

export function ViewTracker({ listing, children }: ViewTrackerProps) {
  useEffect(() => {
    addToRecentlyViewed({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      image: listing.images[0] || "",
      gameName: listing.game.name,
      gameSlug: listing.game.slug,
      sellerUsername: listing.seller.username,
    })
  }, [listing.id, listing.title, listing.price, listing.images, listing.game.name, listing.game.slug, listing.seller.username])

  return <>{children}</>
}