"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"

interface Game {
  id: string
  name: string
  slug: string
  _count: { listings: number }
}

interface Listing {
  id: string
  title: string
  price: number
  rarity: string
  images: string[]
  game: { id: string; name: string; slug: string }
  seller: { id: string; username: string }
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

const rarities = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"]

function BrowseContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [games, setGames] = useState<Game[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const params = {
    gameId: searchParams.get("gameId") || "",
    rarity: searchParams.get("rarity") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "newest",
    page: searchParams.get("page") || "1",
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const queryParams = new URLSearchParams()
        Object.entries(params).forEach(([k, v]) => {
          if (v) queryParams.set(k, v)
        })
        queryParams.set("limit", "24")

        const [gamesRes, listingsRes] = await Promise.all([
          fetch("/api/games"),
          fetch(`/api/listings?${queryParams.toString()}`)
        ])

        const gamesData = await gamesRes.json()
        const listingsData = await listingsRes.json()

        setGames(gamesData.games || [])
        setListings(listingsData.listings || [])
        setTotal(listingsData.pagination?.total || 0)
        setPage(listingsData.pagination?.page || 1)
        setPages(listingsData.pagination?.pages || 1)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      }
      setLoading(false)
    }

    fetchData()
  }, [searchParams.toString()])

  const updateParams = (updates: Record<string, string>) => {
    const url = new URLSearchParams()
    Object.entries({ ...params, ...updates }).forEach(([k, v]) => {
      if (v) url.set(k, v)
    })
    router.push(`/browse?${url.toString()}`)
  }

  const handleSort = (value: string) => {
    const url = new URLSearchParams()
    Object.entries({ ...params, sort: value }).forEach(([k, v]) => {
      if (v) url.set(k, v)
    })
    router.push(`/browse?${url.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    updateParams({ page: String(newPage) })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-4">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card border border-border/50 rounded-lg p-4">
              <div className="w-10 h-10 skeleton rounded-full mb-3" />
              <div className="h-4 skeleton w-3/4 mb-1" />
              <div className="h-3 skeleton w-1/2" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-card border border-border/50 rounded-lg overflow-hidden">
              <div className="aspect-square skeleton" />
              <div className="p-3">
                <div className="h-4 skeleton w-3/4 mb-2" />
                <div className="h-5 skeleton w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-5 py-4">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-xl font-semibold text-foreground">all games</h1>
        <span className="text-xs text-muted-foreground">{total} listings</span>
        
        <div className="ml-auto flex items-center gap-2">
          <select
            value={params.sort}
            onChange={(e) => handleSort(e.target.value)}
            className="text-xs px-3 py-1.5 bg-card border border-border/50 rounded-full text-muted-foreground focus:outline-none focus:border-primary/50"
          >
            <option value="newest">newest</option>
            <option value="price_asc">price: low to high</option>
            <option value="price_desc">price: high to low</option>
            <option value="popular">most popular</option>
          </select>
          
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

      <div className="flex gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateParams({ gameId: "" })}
            className={`px-3 py-1.5 text-xs rounded-full transition-all ${
              !params.gameId 
                ? "bg-primary text-primary-foreground" 
                : "bg-card border border-border/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            all games
          </button>
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => updateParams({ gameId: game.id })}
              className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                params.gameId === game.id
                  ? "bg-primary text-primary-foreground" 
                  : "bg-card border border-border/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {game.name.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <select
          value={params.rarity}
          onChange={(e) => updateParams({ rarity: e.target.value })}
          className="text-xs px-3 py-1.5 bg-card border border-border/50 rounded-full text-muted-foreground focus:outline-none"
        >
          <option value="">all rarities</option>
          {rarities.map((r) => (
            <option key={r} value={r}>{r.toLowerCase()}</option>
          ))}
        </select>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>price:</span>
          <input
            type="number"
            placeholder="min"
            value={params.minPrice}
            onChange={(e) => updateParams({ minPrice: e.target.value })}
            className="w-16 px-2 py-1 bg-card border border-border/50 rounded-full text-center text-foreground placeholder:text-muted-foreground/50"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="max"
            value={params.maxPrice}
            onChange={(e) => updateParams({ maxPrice: e.target.value })}
            className="w-16 px-2 py-1 bg-card border border-border/50 rounded-full text-center text-foreground placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {listings.map((listing) => {
          const emoji = gameEmojis[listing.game.slug] || "🎮"
          return (
            <Link
              key={listing.id}
              href={`/item/${listing.id}`}
              className="group rounded-lg bg-card border border-border/50 hover:border-primary/40 hover:shadow-sm overflow-hidden transition-all cursor-pointer"
            >
              <div className="aspect-square bg-secondary/50 relative flex items-center justify-center">
                {listing.images[0] ? (
                  <Image
                    src={listing.images[0]}
                    alt={listing.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-2xl opacity-30">{emoji}</span>
                )}
                <span className="absolute top-1 left-1 text-[8px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                  {listing.rarity.toLowerCase()}
                </span>
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{listing.title}</p>
                <p className="text-sm font-semibold text-primary mt-0.5">${listing.price.toFixed(2)}</p>
                <p className="text-[9px] text-muted-foreground truncate">@{listing.seller.username}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {listings.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          no items found
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 text-xs bg-card border border-border/50 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            prev
          </button>
          
          {Array.from({ length: Math.min(5, pages) }, (_, i) => {
            let pageNum: number
            if (pages <= 5) {
              pageNum = i + 1
            } else if (page <= 3) {
              pageNum = i + 1
            } else if (page >= pages - 2) {
              pageNum = pages - 4 + i
            } else {
              pageNum = page - 2 + i
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                  page === pageNum
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {pageNum}
              </button>
            )
          })}
          
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= pages}
            className="px-3 py-1.5 text-xs bg-card border border-border/50 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            next
          </button>
        </div>
      )}

      <footer className="mt-10 text-center text-[10px] text-muted-foreground/50 tracking-widest">
        RBLX.MKT
      </footer>
    </main>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-5 py-4">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card border border-border/50 rounded-lg p-4">
              <div className="w-10 h-10 skeleton rounded-full mb-3" />
              <div className="h-4 skeleton w-3/4 mb-1" />
              <div className="h-3 skeleton w-1/2" />
            </div>
          ))}
        </div>
      </div>
    }>
      <BrowseContent />
    </Suspense>
  )
}