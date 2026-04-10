import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/Badge"
import { ListingCard } from "@/components/listing/ListingCard"
import { ViewTracker } from "@/components/listing/ViewTracker"

interface PageProps {
  params: Promise<{ id: string }>
}

async function getListing(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: {
      game: { select: { id: true, name: true, slug: true, iconUrl: true } },
      category: { select: { id: true, name: true, slug: true } },
      seller: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          isPro: true,
          isVerified: true,
          verificationLevel: true,
          createdAt: true,
          _count: { select: { sales: true, listings: true } },
        },
      },
    },
  })
}

async function getMoreFromSeller(sellerId: string, excludeId: string) {
  return prisma.listing.findMany({
    where: { sellerId, id: { not: excludeId }, status: "ACTIVE" },
    include: {
      game: { select: { id: true, name: true, slug: true, iconUrl: true } },
      category: { select: { id: true, name: true, slug: true } },
      seller: { select: { id: true, username: true, avatarUrl: true, isPro: true, isVerified: true, verificationLevel: true } },
    },
    take: 4,
  })
}

async function getSimilarItems(gameId: string, categoryId: string, excludeId: string) {
  return prisma.listing.findMany({
    where: {
      id: { not: excludeId },
      gameId,
      categoryId,
      status: "ACTIVE",
    },
    include: {
      game: { select: { id: true, name: true, slug: true, iconUrl: true } },
      category: { select: { id: true, name: true, slug: true } },
      seller: { select: { id: true, username: true, avatarUrl: true, isPro: true, isVerified: true, verificationLevel: true } },
    },
    take: 4,
  })
}

async function incrementViewCount(id: string) {
  prisma.listing.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {})
}

const rarityColors: Record<string, string> = {
  COMMON: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  UNCOMMON: "bg-green-500/20 text-green-400 border-green-500/30",
  RARE: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  EPIC: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  LEGENDARY: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  MYTHIC: "bg-red-500/20 text-red-400 border-red-500/30",
}

export default async function ItemPage({ params }: PageProps) {
  const { id } = await params
  const listing = await getListing(id)

  if (!listing) notFound()

  incrementViewCount(id)

  const available = listing.quantity - listing.quantitySold
  const isOutOfStock = available <= 0

  const [moreFromSeller, similarItems] = await Promise.all([
    getMoreFromSeller(listing.sellerId, listing.id),
    getSimilarItems(listing.gameId, listing.categoryId, listing.id),
  ])

  return (
    <ViewTracker
      listing={{
        id: listing.id,
        title: listing.title,
        price: listing.price,
        images: listing.images,
        game: { name: listing.game.name, slug: listing.game.slug },
        seller: { username: listing.seller.username },
      }}
    >
      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            {/* Image Gallery */}
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
              {listing.images[0] ? (
                <img 
                  src={listing.images[0]} 
                  alt={listing.title}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="w-full aspect-square bg-secondary flex items-center justify-center text-4xl">
                  🎮
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-4">description</h2>
              <div className="text-foreground whitespace-pre-wrap text-sm">
                {listing.description}
              </div>
            </div>

            {/* Tags */}
            {listing.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {listing.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-secondary text-muted-foreground text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* More from seller */}
            {moreFromSeller.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-muted-foreground mb-4">more from {listing.seller.username}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {moreFromSeller.map((item) => (
                    <ListingCard key={item.id} listing={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Similar items */}
            {similarItems.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-muted-foreground mb-4">similar items</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {similarItems.map((item) => (
                    <ListingCard key={item.id} listing={item} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Buy card */}
          <div className="lg:col-span-2">
            <div className="sticky top-20">
              <div className="rounded-2xl border border-border/50 bg-card p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-1 bg-secondary text-muted-foreground rounded-full">
                    {listing.game.name}
                  </span>
                  <span className="text-xs px-2 py-1 bg-secondary text-muted-foreground rounded-full">
                    {listing.category.name}
                  </span>
                </div>

                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${rarityColors[listing.rarity]}`}
                >
                  {listing.rarity.toLowerCase()}
                </span>

                <h1 className="text-xl font-semibold text-foreground mt-3">
                  {listing.title}
                </h1>

                <div className="mt-4">
                  <span className="text-3xl font-bold text-primary">
                    ${listing.price.toFixed(2)}
                  </span>
                </div>

                <div className="mt-3 text-sm">
                  {isOutOfStock ? (
                    <span className="text-red-400 font-medium">out of stock</span>
                  ) : available <= 2 ? (
                    <span className="text-amber-400">only {available} left!</span>
                  ) : (
                    <span className="text-muted-foreground">{available} available</span>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    {listing.deliveryMethod === "manual"
                      ? "manual delivery"
                      : listing.deliveryMethod === "auto_code"
                      ? "instant auto code"
                      : "in-game trade"}
                  </span>
                </div>

                <Link
                  href={`/checkout?listingId=${listing.id}&quantity=1`}
                  className={`w-full mt-6 block text-center py-3 px-6 rounded-xl font-bold transition-colors ${
                    isOutOfStock
                      ? "bg-secondary text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:opacity-90"
                  }`}
                >
                  {isOutOfStock ? "out of stock" : `buy now — $${listing.price.toFixed(2)}`}
                </Link>

                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    secure
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    verified
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    refunds
                  </span>
                </div>

                <div className="mt-6 pt-6 border-t border-border/50">
                  <Link
                    href={`/profile/${listing.seller.username}`}
                    className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-semibold text-muted-foreground">
                      {listing.seller.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {listing.seller.username}
                        </span>
                        {listing.seller.isPro && (
                          <span className="text-xs px-1.5 py-0.5 bg-primary/20 text-primary rounded">pro</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {listing.seller._count.listings} listings · {listing.seller._count.sales} sales
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="mt-4 text-xs text-muted-foreground text-center">
                  member since {new Date(listing.seller.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </div>
              </div>

              <div className="mt-4 text-center">
                <button className="text-xs text-muted-foreground hover:text-red-400">
                  report this listing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ViewTracker>
  )
}