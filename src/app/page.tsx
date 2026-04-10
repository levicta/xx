import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { RecentlyViewed } from "@/components/listing/RecentlyViewed"

interface GameWithCount {
  id: string
  name: string
  slug: string
  _count: { listings: number }
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

async function getGames(): Promise<GameWithCount[]> {
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

async function getStats() {
  const [totalListings, totalSellers, totalGames] = await Promise.all([
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { role: { equals: "SELLER" } } }),
    prisma.game.count({ where: { isActive: true } }),
  ])
  const adminCount = await prisma.user.count({ where: { role: { equals: "ADMIN" } } })
  return { totalListings, totalSellers: totalSellers + adminCount, totalGames }
}

export default async function HomePage() {
  const [games, stats] = await Promise.all([getGames(), getStats()])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[960px] mx-auto px-6 py-20">
        <p className="text-center mb-6 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          roblox marketplace
        </p>

        <h1 className="text-center mb-4 text-4xl md:text-5xl font-bold text-foreground leading-tight">
          buy &amp; sell in-game items
        </h1>

        <p className="text-center mb-8 text-muted-foreground">
          select a game to browse listings
        </p>

        <div className="max-w-[520px] mx-auto mb-12">
          <div className="flex items-center px-4 bg-card border border-border/50 rounded-full">
            <svg className="w-5 h-5 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="search games..."
              className="flex-1 px-3 py-4 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="flex items-center gap-3 text-sm font-bold text-foreground border-l-[3px] border-primary pl-3">
            games ({games.length})
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/browse/${game.slug}`}
              className="group flex items-center gap-3 bg-card border border-border/50 rounded-2xl p-4 hover:border-primary/40 transition-all"
            >
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full text-xl">
                {gameEmojis[game.slug] || "🎮"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">
                  {game.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {game._count.listings} listings
                </p>
              </div>
              <svg className="flex-shrink-0 w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        <RecentlyViewed />

        <div className="text-center text-sm text-muted-foreground mt-8">
          <span className="font-semibold text-foreground">{stats.totalListings.toLocaleString()} items</span>
          <span className="mx-3">|</span>
          <span className="font-semibold text-foreground">{stats.totalSellers.toLocaleString()} sellers</span>
          <span className="mx-3">|</span>
          <span className="font-semibold text-foreground">{stats.totalGames} games</span>
        </div>
      </div>
    </div>
  )
}
