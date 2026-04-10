"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Filter, Eye, X } from "lucide-react"

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
  quantity: number
  quantitySold: number
  rarity: string
  images: string[]
  viewCount: number
  game: { id: string; name: string; slug: string }
  category: { id: string; name: string }
  seller: { id: string; username: string; isPro: boolean }
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

const rarityColors: Record<string, string> = {
  COMMON: "bg-gray-500/20 text-gray-400",
  UNCOMMON: "bg-green-500/20 text-green-400",
  RARE: "bg-blue-500/20 text-blue-400",
  EPIC: "bg-purple-500/20 text-purple-400",
  LEGENDARY: "bg-amber-500/20 text-amber-400",
  MYTHIC: "bg-red-500/20 text-red-400",
}

function BrowseContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [games, setGames] = useState<Game[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState("")

  const params = {
    gameId: searchParams.get("gameId") || "",
    rarity: searchParams.get("rarity") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "newest",
    page: searchParams.get("page") || "1",
    search: searchParams.get("search") || "",
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const queryParams = new URLSearchParams()
        Object.entries(params).forEach(([k, v]) => {
          if (v) queryParams.set(k, v)
        })
        queryParams.set("limit", "20")

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
    Object.entries({ ...params, ...updates, page: "1" }).forEach(([k, v]) => {
      if (v) url.set(k, v)
    })
    router.push(`/browse?${url.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams({ search: searchInput })
  }

  const handleSort = (value: string) => {
    const url = new URLSearchParams()
    Object.entries({ ...params, sort: value }).forEach(([k, v]) => {
      if (v) url.set(k, v)
    })
    router.push(`/browse?${url.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const url = new URLSearchParams()
    Object.entries({ ...params, page: String(newPage) }).forEach(([k, v]) => {
      if (v) url.set(k, v)
    })
    router.push(`/browse?${url.toString()}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const getPaginationWindow = () => {
    const maxVisible = 7
    if (pages <= maxVisible) return Array.from({ length: pages }, (_, i) => i + 1)
    if (page <= 3) return Array.from({ length: maxVisible }, (_, i) => i + 1)
    if (page >= pages - 2) return Array.from({ length: maxVisible }, (_, i) => pages - maxVisible + 1 + i)
    return Array.from({ length: maxVisible }, (_, i) => page - 3 + i)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (params.rarity) count++
    if (params.minPrice || params.maxPrice) count++
    if (params.search) count++
    return count
  }

  const currentGame = games.find(g => g.id === params.gameId)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <div className="w-56 shrink-0 hidden lg:block">
            <div className="h-96 skeleton rounded-xl" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="h-14 skeleton rounded-xl" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card border border-border/50 rounded-xl overflow-hidden">
                  <div className="aspect-[4/3] skeleton" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 skeleton w-3/4" />
                    <div className="h-5 skeleton w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">games</h3>
            <div className="space-y-1">
              <button
                onClick={() => updateParams({ gameId: "" })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!params.gameId ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
              >
                All Games
              </button>
              {games.map((game) => (
                <button
                  key={game.id}
                  onClick={() => updateParams({ gameId: game.id })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${params.gameId === game.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
                >
                  <span>{gameEmojis[game.slug] || "🎮"}</span>
                  <span className="truncate flex-1">{game.name}</span>
                  <span className="text-xs opacity-50">{game._count.listings}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">rarity</h3>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => updateParams({ rarity: "" })} className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${!params.rarity ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:text-foreground"}`}>
                Any
              </button>
              {rarities.map((r) => (
                <button
                  key={r}
                  onClick={() => updateParams({ rarity: r })}
                  className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${params.rarity === r ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:text-foreground"}`}
                >
                  {r.toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">price</h3>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="0" value={params.minPrice} onChange={(e) => updateParams({ minPrice: e.target.value })} className="w-full px-2 py-1.5 text-sm bg-secondary/50 rounded-md text-foreground placeholder:text-muted-foreground/50" />
              <span className="text-muted-foreground">—</span>
              <input type="number" placeholder="999" value={params.maxPrice} onChange={(e) => updateParams({ maxPrice: e.target.value })} className="w-full px-2 py-1.5 text-sm bg-secondary/50 rounded-md text-foreground placeholder:text-muted-foreground/50" />
            </div>
          </div>
        </aside>

        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-background p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filters</h3>
                <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Game</h4>
                  <select value={params.gameId} onChange={(e) => updateParams({ gameId: e.target.value })} className="w-full px-3 py-2 text-sm bg-card border border-border/50 rounded-lg">
                    <option value="">All Games</option>
                    {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Rarity</h4>
                  <select value={params.rarity} onChange={(e) => updateParams({ rarity: e.target.value })} className="w-full px-3 py-2 text-sm bg-card border border-border/50 rounded-lg">
                    <option value="">Any</option>
                    {rarities.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground truncate">{currentGame ? currentGame.name : "Browse"}</h1>
              <p className="text-sm text-muted-foreground mt-1">{total.toLocaleString()} items{currentGame && <span> in {currentGame.name}</span>}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowFilters(true)} className="lg:hidden p-2 rounded-lg bg-card border border-border/50 text-muted-foreground relative">
                <Filter className="w-4 h-4" />
                {getActiveFiltersCount() > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">{getActiveFiltersCount()}</span>}
              </button>
              <form onSubmit={handleSearch} className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Search..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-40 pl-9 pr-3 py-2 text-sm bg-card border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground/50" />
              </form>
              <select value={params.sort} onChange={(e) => handleSort(e.target.value)} className="px-3 py-2 text-sm bg-card border border-border/50 rounded-lg text-foreground">
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="popular">Popular</option>
              </select>
            </div>
          </div>

          {(params.rarity || params.minPrice || params.maxPrice || params.search) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {params.search && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-full">"{params.search}"<button onClick={() => updateParams({ search: "" })}><X className="w-3 h-3" /></button></span>}
              {params.rarity && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-full">{params.rarity.toLowerCase()}<button onClick={() => updateParams({ rarity: "" })}><X className="w-3 h-3" /></button></span>}
              {(params.minPrice || params.maxPrice) && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-full">${params.minPrice || "0"} — ${params.maxPrice || "∞"}<button onClick={() => updateParams({ minPrice: "", maxPrice: "" })}><X className="w-3 h-3" /></button></span>}
              <button onClick={() => updateParams({ rarity: "", minPrice: "", maxPrice: "", search: "" })} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => {
              const available = listing.quantity - listing.quantitySold
              const emoji = gameEmojis[listing.game.slug] || "🎮"
              return (
                <Link key={listing.id} href={`/item/${listing.id}`} className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-200">
                  <div className="aspect-[4/3] bg-secondary/30 relative">
                    {listing.images[0] ? <Image src={listing.images[0]} alt={listing.title} fill sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center"><span className="text-4xl opacity-20">{emoji}</span></div>}
                    <span className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full font-medium ${rarityColors[listing.rarity]}`}>{listing.rarity}</span>
                    <div className="absolute bottom-2 right-2"><span className="text-[10px] px-1.5 py-0.5 bg-black/50 text-white rounded flex items-center gap-1"><Eye className="w-2.5 h-2.5" />{listing.viewCount}</span></div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors line-clamp-2">{listing.title}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold text-primary">${listing.price.toFixed(2)}</span>
                      <span className={`text-[10px] ${available > 0 ? "text-muted-foreground" : "text-red-400"}`}>{available > 0 ? `${available} left` : "Sold"}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1"><span>{emoji}</span><span className="truncate max-w-[60px]">{listing.game.name}</span></div>
                      <div className="flex items-center gap-1">{listing.seller.isPro && <span className="text-[9px] px-1 bg-primary/20 text-primary rounded">PRO</span>}<span>@{listing.seller.username}</span></div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {listings.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center"><Search className="w-8 h-8 text-muted-foreground" /></div>
              <h3 className="text-lg font-medium text-foreground mb-2">No items found</h3>
              <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters</p>
              <button onClick={() => updateParams({ rarity: "", minPrice: "", maxPrice: "", search: "", gameId: "" })} className="text-sm text-primary hover:underline">Clear all filters</button>
            </div>
          )}

          {pages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-8">
              <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1} className="p-2 rounded-lg bg-card border border-border/50 text-muted-foreground hover:text-foreground disabled:opacity-50">←</button>
              {getPaginationWindow().map((pageNum) => (
                <button key={pageNum} onClick={() => handlePageChange(pageNum)} className={`w-10 h-10 rounded-lg text-sm font-medium ${page === pageNum ? "bg-primary text-primary-foreground" : "bg-card border border-border/50 text-muted-foreground hover:text-foreground"}`}>{pageNum}</button>
              ))}
              <button onClick={() => handlePageChange(page + 1)} disabled={page >= pages} className="p-2 rounded-lg bg-card border border-border/50 text-muted-foreground hover:text-foreground disabled:opacity-50">→</button>
            </div>
          )}

          <footer className="mt-12 text-center text-[10px] text-muted-foreground/50 tracking-widest">RBLX.MKT</footer>
        </main>
      </div>
    </div>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-6"><div className="h-14 skeleton rounded-xl mb-6" /><div className="grid grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => (<div key={i} className="bg-card border border-border/50 rounded-lg overflow-hidden"><div className="aspect-[4/3] skeleton" /><div className="p-3 space-y-2"><div className="h-4 skeleton w-3/4" /><div className="h-5 skeleton w-1/3" /></div></div>))}</div></div>}>
      <BrowseContent />
    </Suspense>
  )
}