import Link from "next/link"

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

interface ListingGridProps {
  listings: Listing[]
  viewMode?: "grid" | "list"
  gameEmoji?: string
}

const rarityColors: Record<string, string> = {
  COMMON: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  UNCOMMON: "bg-green-500/20 text-green-400 border-green-500/30",
  RARE: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  EPIC: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  LEGENDARY: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  MYTHIC: "bg-red-500/20 text-red-400 border-red-500/30",
}

export function ListingGrid({ listings, viewMode = "grid", gameEmoji = "🎮" }: ListingGridProps) {
  const actualViewMode = viewMode || "grid"
  const actualGameEmoji = gameEmoji || "🎮"
  
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 mb-4 rounded-full bg-[--bg-elevated] flex items-center justify-center">
          <svg className="w-12 h-12 text-[--text-muted]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-[--text-primary] mb-2">no items found</h3>
        <p className="text-sm text-[--text-secondary] text-center max-w-md">
          try adjusting your filters or search terms
        </p>
      </div>
    )
  }

  if (actualViewMode === "grid") {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/item/${listing.id}`}
            className="group rounded-lg bg-card border border-border/50 hover:border-primary/40 hover:shadow-sm overflow-hidden transition-all cursor-pointer"
          >
            <div className="aspect-square bg-secondary/50 relative flex items-center justify-center">
              {listing.images[0] ? (
                <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl opacity-30">{actualGameEmoji}</span>
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
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {listings.map((listing) => (
        <Link
          key={listing.id}
          href={`/item/${listing.id}`}
          className="group flex items-center gap-3 p-2 rounded-lg bg-card/50 border border-border/50 hover:border-primary/40 hover:bg-card transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0 overflow-hidden">
            {listing.images[0] ? (
              <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-base opacity-50">{actualGameEmoji}</span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{listing.title}</p>
              <span className="text-[8px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">{listing.rarity.toLowerCase()}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">@{listing.seller.username}</p>
          </div>
          
          <p className="text-sm font-semibold text-primary shrink-0">${listing.price.toFixed(2)}</p>
          
          <button className="px-3 py-1.5 text-xs rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors opacity-0 group-hover:opacity-100">
            buy
          </button>
        </Link>
      ))}
    </div>
  )
}