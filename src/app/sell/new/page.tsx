"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/Textarea"
import { Card } from "@/components/ui/Card"

interface Game {
  id: string
  name: string
  slug: string
  iconUrl: string
}

interface Category {
  id: string
  name: string
  slug: string
}

const RARITY_OPTIONS = [
  { value: "COMMON", label: "Common" },
  { value: "UNCOMMON", label: "Uncommon" },
  { value: "RARE", label: "Rare" },
  { value: "EPIC", label: "Epic" },
  { value: "LEGENDARY", label: "Legendary" },
  { value: "MYTHIC", label: "Mythic" },
]

const DELIVERY_OPTIONS = [
  { value: "manual", label: "Manual Delivery" },
  { value: "auto_code", label: "Auto Code" },
  { value: "in_game_trade", label: "In-Game Trade" },
]

export default function NewListingPage() {
  const router = useRouter()
  const [games, setGames] = useState<Game[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    gameId: "",
    categoryId: "",
    title: "",
    description: "",
    rarity: "COMMON",
    price: "",
    quantity: "1",
    images: [] as string[],
    deliveryMethod: "manual",
    deliveryInstructions: "",
    tags: "",
  })

  useEffect(() => {
    fetch("/api/games")
      .then((res) => res.json())
      .then(setGames)
  }, [])

  useEffect(() => {
    if (formData.gameId) {
      fetch(`/api/games/${games.find((g) => g.id === formData.gameId)?.slug}`)
        .then((res) => res.json())
        .then((game) => setCategories(game.categories || []))
    }
  }, [formData.gameId, games])

  useEffect(() => {
    if (!formData.gameId) {
      setCategories([])
    }
    setFormData((prev) => ({ ...prev, categoryId: "" }))
  }, [formData.gameId])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)
    const uploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (formData.images.length + uploadedUrls.length >= 5) break

      const formDataUpload = new FormData()
      formDataUpload.append("file", file)

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        })
        const data = await res.json()
        if (data.url) {
          uploadedUrls.push(data.url)
        }
      } catch (err) {
        console.error("Upload error:", err)
      }
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls],
    }))
    setUploading(false)
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const commissionRate = 0.07
  const priceNum = parseFloat(formData.price) || 0
  const earnings = priceNum - priceNum * commissionRate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (formData.images.length === 0) {
      setError("At least 1 image is required")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create listing")
      }

      const listing = await res.json()
      router.push(`/item/${listing.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const gameOptions = games.map((g) => ({ value: g.id, label: g.name }))
  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }))

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-foreground mb-8 lowercase">create new listing</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">game & category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="select game"
              value={formData.gameId}
              onChange={(e) => setFormData({ ...formData, gameId: e.target.value })}
              options={[{ value: "", label: "choose a game..." }, ...gameOptions]}
              required
            />
            <Select
              label="category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              options={[{ value: "", label: "select a game first..." }, ...categoryOptions]}
              disabled={!formData.gameId}
              required
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">item details</h2>
          <div className="space-y-4">
            <Input
              label="item title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., golden bee pet"
              required
            />
            <Textarea
              label="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="describe your item..."
              rows={4}
              required
            />
            <Select
              label="rarity"
              value={formData.rarity}
              onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
              options={RARITY_OPTIONS}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="price (usd)"
              type="number"
              step="0.01"
              min="0.50"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="4.99"
              required
            />
            <Input
              label="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>
          {formData.price && (
            <div className="p-3 bg-secondary rounded-lg text-sm">
              <span className="text-muted-foreground">you&apos;ll receive: </span>
              <span className="text-primary font-semibold">
                ${earnings.toFixed(2)}
              </span>
              <span className="text-muted-foreground"> after 7% fee</span>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">images</h2>
          <div className="flex flex-wrap gap-3">
            {formData.images.map((url, index) => (
              <div key={index} className="relative w-20 h-20">
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs"
                >
                  ×
                </button>
              </div>
            ))}
            {formData.images.length < 5 && (
              <label className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-muted-foreground text-2xl">+</span>
                )}
              </label>
            )}
          </div>
          <p className="text-xs text-muted-foreground">max 5 images, jpg/png/webp</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">delivery</h2>
          <div className="space-y-4">
            <Select
              label="delivery method"
              value={formData.deliveryMethod}
              onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value })}
              options={DELIVERY_OPTIONS}
            />
            <Textarea
              label="delivery instructions (secret - shown only after purchase)"
              value={formData.deliveryInstructions}
              onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
              placeholder="e.g., friend request me at: username123"
              rows={3}
              helperText="this will only be visible to the buyer after they complete payment"
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">tags</h2>
          <Input
            label="tags (comma-separated)"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="e.g., rare, golden, event"
            helperText="separate multiple tags with commas"
          />
        </section>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={loading || uploading}>
            {loading ? "creating..." : "create listing"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            cancel
          </Button>
        </div>
      </form>
    </div>
  )
}