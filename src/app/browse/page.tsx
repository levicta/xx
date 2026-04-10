import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

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

async function getGames() {
  return prisma.game.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { listings: { where: { status: "ACTIVE" } } } },
    },
    orderBy: { name: "asc" },
  })
}

async function getListings() {
  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    include: {
      game: { select: { id: true, name: true, slug: true, iconUrl: true } },
      category: { select: { id: true, name: true, slug: true } },
      seller: { select: { id: true, username: true, avatarUrl: true, isPro: true, isVerified: true, verificationLevel: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 12,
  })
  const total = await prisma.listing.count({ where: { status: "ACTIVE" } })
  return { listings, total }
}

function BrowseSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-5 py-4">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-lg p-4">
            <div className="w-10 h-10 skeleton rounded-full mb-3" />
            <div className="h-4 skeleton w-3/4 mb-1" />
            <div className="h-3 skeleton w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function BrowsePage() {
  const [games, { listings, total }] = await Promise.all([getGames(), getListings()])

  return (
    <Suspense fallback={<BrowseSkeleton />}>
      <main className="px-5 py-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground">all games</h1>
              <p className="text-xs text-muted-foreground mt-1">{total} listings across {games.length} games</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
            {games.map((game) => (
              <Link
                key={game.id}
                href={`/browse/${game.slug}`}
                className="group flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50 hover:border-primary/40 hover:bg-card transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg shrink-0">
                  {gameEmojis[game.slug] || "🎮"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {game.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {game._count.listings} listings
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="text-sm font-semibold text-foreground mb-4">recent listings</h2>
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
                      <span className="text-2xl opacity-30">{gameEmojis[listing.game.slug] || "🎮"}</span>
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
          </div>

          <footer className="mt-10 text-center text-[10px] text-muted-foreground/50 tracking-widest">
            RBLX.MKT
          </footer>
        </main>
    </Suspense>
  )
}