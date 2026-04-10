"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

interface Category {
  id: string
  name: string
  slug: string
}

interface Game {
  id: string
  name: string
  slug: string
  coverUrl: string
  iconUrl: string
  categories: Category[]
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
  seller: { id: string; username: string; avatarUrl: string | null; isPro: boolean; isVerified: boolean; verificationLevel: number }
  viewCount: number
  isBoosted: boolean
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

const rarityColors: Record<string, string> = {
  COMMON: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  UNCOMMON: "bg-green-500/20 text-green-400 border-green-500/30",
  RARE: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  EPIC: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  LEGENDARY: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  MYTHIC: "bg-red-500/20 text-red-400 border-red-500/30",
}

export default function GameBrowsePage({ params }: { params: Promise<{ game: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const gameSlug = resolvedParams.game

  const [game, setGame] = useState<Game | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)

  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [rarityFilter, setRarityFilter] = useState<string>("")
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [_pages, _setPages] = useState(1) // eslint-disable-line @typescript-eslint/no-unused-vars

  const pageSize = 20

  useEffect(() => {
    async function fetchGame() {
      try {
        const res = await fetch(`/api/games/${gameSlug}`)
        if (res.ok) {
          const data = await res.json()
          setGame(data)
        }
      } catch (error) {
        console.error("Failed to fetch game:", error)
      }
    }
    fetchGame()
  }, [gameSlug])

  useEffect(() => {
    const categoryId = searchParams.get("categoryId") || ""
    const rarity = searchParams.get("rarity") || ""
    const minP = searchParams.get("minPrice") || ""
    const maxP = searchParams.get("maxPrice") || ""
    const sort = searchParams.get("sort") || "newest"
    const page = parseInt(searchParams.get("page") || "1")

    setSelectedCategory(categoryId)
    setRarityFilter(rarity)
    setMinPrice(minP)
    setMaxPrice(maxP)
    setSortBy(sort)
    setCurrentPage(page)
  }, [searchParams])

  useEffect(() => {
    async function fetchListings() {
      if (!game) return
      
      setLoading(true)
      try {
        const queryParams = new URLSearchParams()
        queryParams.set("gameId", game.id)
        if (selectedCategory) queryParams.set("categoryId", selectedCategory)
        if (rarityFilter) queryParams.set("rarity", rarityFilter)
        if (minPrice) queryParams.set("minPrice", minPrice)
        if (maxPrice) queryParams.set("maxPrice", maxPrice)
        queryParams.set("sort", sortBy)
        queryParams.set("page", currentPage.toString())
        queryParams.set("limit", pageSize.toString())

        const res = await fetch(`/api/listings?${queryParams.toString()}`)
        const data = await res.json()
        
        setListings(data.listings || [])
        setTotalItems(data.pagination?.total || 0)
        _setPages(data.pagination?._pages || 1)
      } catch (error) {
        console.error("Failed to fetch listings:", error)
      }
      setLoading(false)
      setInitialLoad(false)
    }

    if (game) {
      fetchListings()
    }
  }, [game, selectedCategory, rarityFilter, minPrice, maxPrice, sortBy, currentPage])

  const handleBack = () => {
    router.push("/browse")
  }

  const handleCategoryClick = (categoryId: string) => {
    const url = new URLSearchParams()
    if (categoryId) url.set("categoryId", categoryId)
    if (rarityFilter) url.set("rarity", rarityFilter)
    if (minPrice) url.set("minPrice", minPrice)
    if (maxPrice) url.set("maxPrice", maxPrice)
    url.set("sort", sortBy)
    url.set("page", "1")
    
    router.push(`/browse/${gameSlug}?${url.toString()}`)
  }

  const handleRarityChange = (value: string) => {
    const url = new URLSearchParams()
    if (selectedCategory) url.set("categoryId", selectedCategory)
    if (value) url.set("rarity", value)
    if (minPrice) url.set("minPrice", minPrice)
    if (maxPrice) url.set("maxPrice", maxPrice)
    url.set("sort", sortBy)
    url.set("page", "1")
    
    router.push(`/browse/${gameSlug}?${url.toString()}`)
  }

  const handlePriceChange = (type: "min" | "max", value: string) => {
    const url = new URLSearchParams()
    if (selectedCategory) url.set("categoryId", selectedCategory)
    if (rarityFilter) url.set("rarity", rarityFilter)
    if (type === "min" && value) url.set("minPrice", value)
    else if (minPrice) url.set("minPrice", minPrice)
    if (type === "max" && value) url.set("maxPrice", value)
    else if (maxPrice) url.set("maxPrice", maxPrice)
    url.set("sort", sortBy)
    url.set("page", "1")
    
    router.push(`/browse/${gameSlug}?${url.toString()}`)
  }

  const handleSortChange = (value: string) => {
    const url = new URLSearchParams()
    if (selectedCategory) url.set("categoryId", selectedCategory)
    if (rarityFilter) url.set("rarity", rarityFilter)
    if (minPrice) url.set("minPrice", minPrice)
    if (maxPrice) url.set("maxPrice", maxPrice)
    url.set("sort", value)
    url.set("page", "1")
    
    router.push(`/browse/${gameSlug}?${url.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const url = new URLSearchParams()
    if (selectedCategory) url.set("categoryId", selectedCategory)
    if (rarityFilter) url.set("rarity", rarityFilter)
    if (minPrice) url.set("minPrice", minPrice)
    if (maxPrice) url.set("maxPrice", maxPrice)
    url.set("sort", sortBy)
    url.set("page", page.toString())
    
    router.push(`/browse/${gameSlug}?${url.toString()}`)
  }

  const clearFilters = () => {
    router.push(`/browse/${gameSlug}`)
  }

  const gameEmoji = game ? (gameEmojis[game.slug] || "🎮") : "🎮"

  const totalPages = Math.ceil(totalItems / pageSize)

  if (initialLoad) {
    return (
      <div className="min-h-screen">
        <div className="h-14 skeleton border-b border-border/50" />
        <div className="px-4 py-4">
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-20 skeleton rounded-full shrink-0" />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card border border-border/50 rounded-xl overflow-hidden">
                <div className="aspect-square skeleton" />
                <div className="p-3 space-y-2">
                  <div className="h-4 skeleton w-3/4" />
                  <div className="h-3 skeleton w-1/2" />
                  <div className="h-6 skeleton w-1/4 mt-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-14 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-colors shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            back
          </button>
          
          <div className="w-px h-5 bg-border shrink-0" />
          
          <button
            onClick={() => handleCategoryClick("")}
            className={`px-3 py-1.5 text-xs rounded-full transition-all whitespace-nowrap shrink-0 ${
              !selectedCategory 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-border"
            }`}
          >
            all
          </button>
          
          {game?.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`px-3 py-1.5 text-xs rounded-full transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-border"
              }`}
            >
              {cat.name.toLowerCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto">
          <select
            value={rarityFilter}
            onChange={(e) => handleRarityChange(e.target.value)}
            className="px-2.5 py-1.5 text-xs text-muted-foreground bg-card border border-border rounded-full shrink-0 focus:outline-none focus:border-primary/50"
          >
            <option value="">rarity</option>
            <option value="COMMON">common</option>
            <option value="UNCOMMON">uncommon</option>
            <option value="RARE">rare</option>
            <option value="EPIC">epic</option>
            <option value="LEGENDARY">legendary</option>
            <option value="MYTHIC">mythic</option>
          </select>

          <div className="flex items-center gap-1 shrink-0">
            <input
              type="number"
              placeholder="min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={() => handlePriceChange("min", minPrice)}
              className="w-16 px-2 py-1.5 text-xs text-muted-foreground bg-card border border-border rounded-full shrink-0 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
            />
            <span className="text-xs text-muted-foreground">-</span>
            <input
              type="number"
              placeholder="max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={() => handlePriceChange("max", maxPrice)}
              className="w-16 px-2 py-1.5 text-xs text-muted-foreground bg-card border border-border rounded-full shrink-0 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-2.5 py-1.5 text-xs text-muted-foreground bg-card border border-border rounded-full shrink-0 focus:outline-none focus:border-primary/50"
          >
            <option value="newest">newest</option>
            <option value="price_asc">price ↑</option>
            <option value="price_desc">price ↓</option>
            <option value="popular">popular</option>
          </select>

          {(rarityFilter || minPrice || maxPrice) && (
            <button
              onClick={clearFilters}
              className="px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-colors shrink-0"
            >
              clear
            </button>
          )}
        </div>
      </header>

      <main className="px-4 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
          <span className="w-1 h-3 bg-primary rounded-full" />
          <span>{totalItems} items found</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card border border-border/50 rounded-xl overflow-hidden">
                <div className="aspect-square skeleton" />
                <div className="p-3 space-y-2">
                  <div className="h-4 skeleton w-3/4" />
                  <div className="h-3 skeleton w-1/2" />
                  <div className="h-6 skeleton w-1/4 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 mb-4 rounded-full bg-elevated flex items-center justify-center">
              <span className="text-5xl opacity-30">{gameEmoji}</span>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">no items found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
              try adjusting your filters or search terms
            </p>
            {(rarityFilter || minPrice || maxPrice || selectedCategory) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-xs rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/item/${listing.id}`}
                  className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="aspect-square bg-secondary/50 relative flex items-center justify-center overflow-hidden">
                    {listing.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl opacity-30">{gameEmoji}</span>
                    )}
                    <span className={`absolute top-2 left-2 text-[9px] px-2 py-0.5 rounded-full font-medium border ${
                      rarityColors[listing.rarity] || rarityColors.COMMON
                    }`}>
                      {listing.rarity.toLowerCase()}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{listing.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{listing.category.name}</p>
                    <p className="text-base font-semibold text-primary mt-1">${listing.price.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground truncate mt-1">@{listing.seller.username}</p>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-8">
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  const pageNum = i + 1
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 text-xs rounded-full transition-all ${
                        currentPage === pageNum
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary/50 border border-border"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-xs text-muted-foreground">...</span>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className={`w-8 h-8 text-xs rounded-full transition-all ${
                        currentPage === totalPages
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary/50 border border-border"
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}

        <footer className="mt-12 text-center text-[10px] text-muted-foreground/50 tracking-widest">
          RBLX.MKT
        </footer>
      </main>
    </div>
  )
}