"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ListingGrid } from "@/components/listing/ListingGrid"

interface Game {
  id: string
  name: string
  slug: string
  iconUrl: string
}

interface Listing {
  id: string
  title: string
  price: number
  quantity: number
  quantitySold: number
  rarity: string
  images: string[]
  game: { id: string; name: string; slug: string; iconUrl: string }
  category: { id: string; name: string; slug: string }
  seller: { id: string; username: string; avatarUrl: string | null; isPro: boolean }
  viewCount: number
  isBoosted: boolean
}

interface BrowseContentProps {
  initialListings: Listing[]
  initialTotal: number
  initialPage: number
  initialPages: number
  games: Game[]
}

export function BrowseContent({ initialListings, initialTotal, initialPage, initialPages, games }: BrowseContentProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [listings, setListings] = useState(initialListings)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(initialPage)
  const [pages, setPages] = useState(initialPages)
  const [loading, setLoading] = useState(false)

  const params = {
    search: searchParams.get("search") || "",
    gameId: searchParams.get("gameId") || "",
    categoryId: searchParams.get("categoryId") || "",
    rarity: searchParams.get("rarity") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "newest",
    page: searchParams.get("page") || "1",
  }

  useEffect(() => {
    async function fetchListings() {
      setLoading(true)
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([k, v]) => {
        if (v) queryParams.set(k, v)
      })
      
      try {
        const res = await fetch(`/api/listings?${queryParams.toString()}`)
        const data = await res.json()
        setListings(data.listings || [])
        setTotal(data.pagination?.total || 0)
        setPage(data.pagination?.page || 1)
        setPages(data.pagination?.pages || 1)
      } catch (error) {
        console.error("Failed to fetch listings:", error)
      }
      setLoading(false)
    }

    fetchListings()
  }, [searchParams.toString()])

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "popular", label: "Most Popular" },
  ]

  const handleSortChange = (value: string) => {
    const url = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v && k !== "sort") url.set(k, v)
    })
    url.set("sort", value)
    router.push(`/browse?${url.toString()}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-syne)] text-[--text-primary]">
          Browse Items
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[--text-secondary]">
            {loading ? "Loading..." : `${total} items found`}
          </span>
          <select
            value={params.sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="bg-[--bg-surface] border border-[--border] rounded-[--radius-sm] px-3 py-2 text-sm text-[--text-primary]"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-[--bg-surface] border border-[--border] rounded-[16px] p-5">
            <h2 className="font-semibold text-[--text-primary] mb-5">Filters</h2>
            <BrowseFilters games={games} />
          </div>
        </div>

        <button
          onClick={() => setLoading(true)}
          className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 bg-[--bg-surface] border border-[--border] rounded-[--radius-sm] py-2.5 text-[--text-secondary]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>

        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-[--bg-surface] border border-[--border] rounded-[14px] overflow-hidden">
                  <div className="aspect-square skeleton" />
                  <div className="p-[14px] space-y-2">
                    <div className="h-4 skeleton w-3/4" />
                    <div className="h-3 skeleton w-1/2" />
                    <div className="h-6 skeleton w-1/4 mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ListingGrid listings={listings} />
          )}
          
          {pages > 1 && !loading && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/browse?${new URLSearchParams({ ...params, page: String(p) }).toString()}`}
                  className={`px-4 py-2 rounded-[--radius-sm] ${
                    p === page
                      ? "bg-[--brand] text-black"
                      : "bg-[--bg-surface] text-[--text-secondary] hover:bg-[--bg-elevated]"
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BrowseFilters({ games }: { games: Game[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key === "gameId") {
      params.delete("categoryId")
    }
    router.push(`/browse?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/browse")
  }

  const hasActiveFilters = Array.from(searchParams.entries()).some(
    ([k]) => k !== "sort"
  )

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search items..."
        defaultValue={searchParams.get("search") || ""}
        onChange={(e) => updateFilter("search", e.target.value)}
        className="w-full bg-[--bg-elevated] border border-[--border] rounded-[--radius-sm] px-3 py-2 text-sm text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:border-[--brand]"
      />

      <select
        defaultValue={searchParams.get("gameId") || ""}
        onChange={(e) => updateFilter("gameId", e.target.value)}
        className="w-full bg-[--bg-elevated] border border-[--border] rounded-[--radius-sm] px-3 py-2 text-sm text-[--text-primary] focus:outline-none focus:border-[--brand]"
      >
        <option value="">All Games</option>
        {games.map((game) => (
          <option key={game.id} value={game.id}>
            {game.name}
          </option>
        ))}
      </select>

      <div>
        <label className="block text-xs font-medium text-[--text-secondary] mb-2">Rarity</label>
        <div className="space-y-1">
          {["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"].map((r) => (
            <label key={r} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rarity"
                checked={searchParams.get("rarity") === r}
                onChange={() => updateFilter("rarity", r)}
                className="w-3 h-3 text-[--brand] bg-[--bg-elevated] border-[--border]"
              />
              <span className="text-xs text-[--text-secondary]">{r}</span>
            </label>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full text-xs text-[--brand] hover:underline"
        >
          Clear All Filters
        </button>
      )}
    </div>
  )
}
