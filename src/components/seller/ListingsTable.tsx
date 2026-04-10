"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Listing {
  id: string
  title: string
  price: number
  quantity: number
  quantitySold: number
  status: string
  viewCount: number
  images: string[]
  game: { name: string }
  category: { name: string }
}

interface ListingsTableProps {
  initialListings: Listing[]
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-[--brand]/20 text-[--brand]",
  PAUSED: "bg-[--accent-gold]/20 text-[--accent-gold]",
  SOLD_OUT: "bg-[--accent-red]/20 text-[--accent-red]",
  PENDING_REVIEW: "bg-[--accent-blue]/20 text-[--accent-blue]",
}

export function ListingsTable({ initialListings }: ListingsTableProps) {
  const router = useRouter()
  const [listings, setListings] = useState(initialListings)
  const [loading, setLoading] = useState<string | null>(null)

  const handleToggle = async (id: string) => {
    setLoading(id)
    try {
      const res = await fetch(`/api/listings/${id}/toggle`, { method: "POST" })
      if (res.ok) {
        setListings(listings.map(l => 
          l.id === id 
            ? { ...l, status: l.status === "ACTIVE" ? "PAUSED" : "ACTIVE" }
            : l
        ))
      }
    } catch (error) {
      console.error("Failed to toggle:", error)
    }
    setLoading(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return
    
    setLoading(id)
    try {
      const res = await fetch(`/api/listings/${id}/delete`, { method: "POST" })
      if (res.ok) {
        setListings(listings.filter(l => l.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete:", error)
    }
    setLoading(null)
  }

  return (
    <div className="bg-[--bg-surface] border border-[--border] rounded-[16px] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-[--text-secondary] border-b border-[--border] bg-[--bg-elevated]">
              <th className="p-4 font-medium">Item</th>
              <th className="p-4 font-medium">Game</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Views</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => {
              const available = listing.quantity - listing.quantitySold
              return (
                <tr key={listing.id} className="border-b border-[--border] last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {listing.images[0] && (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-12 h-12 object-cover rounded-[--radius-sm]"
                        />
                      )}
                      <div>
                        <p className="font-medium text-[--text-primary]">{listing.title}</p>
                        <p className="text-xs text-[--text-muted]">{listing.category.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-[--text-secondary]">{listing.game.name}</td>
                  <td className="p-4 font-mono text-[--brand]">${listing.price.toFixed(2)}</td>
                  <td className="p-4 text-[--text-secondary]">
                    {available}/{listing.quantity}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[listing.status]}`}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="p-4 text-[--text-secondary]">{listing.viewCount}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/sell/listings/${listing.id}/edit`)}
                        className="px-3 py-1 text-xs bg-[--bg-elevated] text-[--text-secondary] rounded hover:bg-[--border] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggle(listing.id)}
                        disabled={loading === listing.id}
                        className="px-3 py-1 text-xs bg-[--bg-elevated] text-[--text-secondary] rounded hover:bg-[--border] transition-colors disabled:opacity-50"
                      >
                        {listing.status === "ACTIVE" ? "Pause" : "Resume"}
                      </button>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        disabled={loading === listing.id}
                        className="px-3 py-1 text-xs bg-[--accent-red]/20 text-[--accent-red] rounded hover:bg-[--accent-red]/30 transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
