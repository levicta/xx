"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

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

interface ListingFiltersProps {
  games: Game[]
  categories: Category[]
}

const RARITY_OPTIONS = [
  { value: "COMMON", label: "Common" },
  { value: "UNCOMMON", label: "Uncommon" },
  { value: "RARE", label: "Rare" },
  { value: "EPIC", label: "Epic" },
  { value: "LEGENDARY", label: "Legendary" },
  { value: "MYTHIC", label: "Mythic" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
]

export function ListingFilters({ games, categories }: ListingFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState(() => ({
    search: searchParams.get("search") || "",
    gameId: searchParams.get("gameId") || "",
    categoryId: searchParams.get("categoryId") || "",
    rarity: searchParams.get("rarity") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "newest",
  }))

  useEffect(() => {
    setLocalFilters(() => ({
      search: searchParams.get("search") || "",
      gameId: searchParams.get("gameId") || "",
      categoryId: searchParams.get("categoryId") || "",
      rarity: searchParams.get("rarity") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      sort: searchParams.get("sort") || "newest",
    }))
  }, [searchParams])

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value }
    if (key === "gameId") {
      newFilters.categoryId = ""
    }
    setLocalFilters(newFilters)

    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    router.push(`/browse?${params.toString()}`)
  }

  const clearFilters = () => {
    setLocalFilters({
      search: "",
      gameId: "",
      categoryId: "",
      rarity: "",
      minPrice: "",
      maxPrice: "",
      sort: "newest",
    })
    router.push("/browse")
  }

  const hasActiveFilters = Object.entries(localFilters).some(
    ([k, v]) => k !== "sort" && v
  )

  const filterContent = (
    <div className="space-y-6">
      <div>
        <input
          type="text"
          placeholder="Search items..."
          value={localFilters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="w-full bg-card border border-border/50 rounded-[--radius-sm] px-4 py-2.5 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Game
        </label>
        <select
          value={localFilters.gameId}
          onChange={(e) => updateFilter("gameId", e.target.value)}
          className="w-full bg-card border border-border/50 rounded-[--radius-sm] px-4 py-2.5 text-foreground focus:outline-none focus:border-primary"
        >
          <option value="">All Games</option>
          {games.map((game) => (
            <option key={game.id} value={game.id}>
              {game.name}
            </option>
          ))}
        </select>
      </div>

      {localFilters.gameId && categories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Category
          </label>
          <select
            value={localFilters.categoryId}
            onChange={(e) => updateFilter("categoryId", e.target.value)}
            className="w-full bg-card border border-border/50 rounded-[--radius-sm] px-4 py-2.5 text-foreground focus:outline-none focus:border-primary"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Rarity
        </label>
        <div className="space-y-2">
          {RARITY_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rarity"
                checked={localFilters.rarity === opt.value}
                onChange={() => updateFilter("rarity", opt.value)}
                className="w-4 h-4 text-primary bg-card border-border focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Price Range
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={localFilters.minPrice}
            onChange={(e) => updateFilter("minPrice", e.target.value)}
            className="w-full bg-card border border-border/50 rounded-[--radius-sm] px-3 py-2 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary"
          />
          <input
            type="number"
            placeholder="Max"
            value={localFilters.maxPrice}
            onChange={(e) => updateFilter("maxPrice", e.target.value)}
            className="w-full bg-card border border-border/50 rounded-[--radius-sm] px-3 py-2 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full text-sm text-primary hover:underline"
        >
          Clear All Filters
        </button>
      )}
    </div>
  )

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 bg-card border border-border/50 rounded-[--radius-sm] py-2.5 text-muted-foreground"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
      </button>

      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24 bg-card border border-border/50 rounded-[16px] p-4">
          <h2 className="font-semibold text-foreground mb-4">Filters</h2>
          {filterContent}
        </div>
      </aside>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border/50 rounded-t-[--radius-lg] p-4 max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Filters</h2>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}
    </>
  )
}
