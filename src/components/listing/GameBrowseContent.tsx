"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ListingGrid } from "@/components/listing/ListingGrid"
import Link from "next/link"

interface Game {
  id: string
  name: string
  slug: string
  coverUrl: string
  iconUrl: string
  categories: { id: string; name: string; slug: string }[]
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

interface GameBrowseContentProps {
  game: Game
  initialListings: Listing[]
  initialTotal: number
  initialPage: number
  initialPages: number
}

const gameEmojis: Record<string, string> = {
  "adopt-me": "🐾",
  "blox-fruits": "🍎",
  "murder-mystery-2": "🔪",
  "pet-simulator-x": "🐕",
  "brookhaven": "🏠",
  "da-hood": "🎭",
  "royale-high": "👑",
  "jailbreak": "🚔",
}

export function GameBrowseContent({ game, initialListings, initialTotal, initialPage, initialPages }: GameBrowseContentProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [listings, setListings] = useState(initialListings)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(initialPage)
  const [pages, setPages] = useState(initialPages)
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [search, setSearch] = useState("")

  const params = {
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
      if (search) queryParams.set("search", search)
      
      try {
        const res = await fetch(`/api/listings?gameId=${game.id}&${queryParams.toString()}`)
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
  }, [searchParams.toString(), game.id, search])

  const handleSort = (value: string) => {
    const url = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v && k !== "sort") url.set(k, v)
    })
    if (search) url.set("search", search)
    url.set("sort", value)
    router.push(`/browse/${game.slug}?${url.toString()}`)
  }

  const filteredListings = search
    ? listings.filter(l => l.title.toLowerCase().includes(search.toLowerCase()))
    : listings

  const gameEmoji = gameEmojis[game.slug] || "🎮"

  return (
    <main className="min-h-screen">
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-2 px-5 py-3 overflow-x-auto">
          <Link href="/browse" className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            back
          </Link>
          
          <div className="w-px h-4 bg-border mx-1" />
          
          <Link
            href={`/browse/${game.slug}`}
            className={`px-3 py-1.5 text-xs rounded-full transition-all whitespace-nowrap ${
              !params.categoryId 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            all
          </Link>
          
          {game.categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/browse/${game.slug}?categoryId=${cat.id}`}
              className={`px-3 py-1.5 text-xs rounded-full transition-all whitespace-nowrap ${
                params.categoryId === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {cat.name.toLowerCase()}
            </Link>
          ))}
          
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-full hover:bg-secondary/50 transition-colors">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline">filter</span>
            </button>
            <button 
              onClick={() => handleSort(params.sort === "price_asc" ? "price_desc" : "price_asc")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-full hover:bg-secondary/50 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span className="hidden sm:inline">{params.sort === "price_asc" ? "price ↓" : "price ↑"}</span>
            </button>
            <div className="flex border border-border rounded-full overflow-hidden">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-1.5 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/50"}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-1.5 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/50"}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text"
              placeholder="search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border/50 rounded-full placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-1 h-3 bg-primary rounded-full" />
            <span>{filteredListings.length} listings</span>
          </div>
        </div>

        <ListingGrid listings={filteredListings} viewMode={viewMode} gameEmoji={gameEmoji} />

        {filteredListings.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            no items found
          </div>
        )}

        <footer className="mt-10 text-center text-[10px] text-muted-foreground/50 tracking-widest">
          RBLX.MKT
        </footer>
      </div>
    </main>
  )
}