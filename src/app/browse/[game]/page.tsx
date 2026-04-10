import { Suspense } from "react"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { GameBrowseContent } from "@/components/listing/GameBrowseContent"

interface PageProps {
  params: Promise<{ game: string }>
  searchParams: Promise<{
    categoryId?: string
    rarity?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
    page?: string
  }>
}

async function getGame(slug: string) {
  return prisma.game.findUnique({
    where: { slug },
    include: { categories: { orderBy: { name: "asc" } } },
  })
}

async function getListings(params: {
  gameId: string
  categoryId?: string
  rarity?: string
  minPrice?: string
  maxPrice?: string
  sort?: string
  page?: string
}) {
  const page = parseInt(params.page || "1")
  const limit = 20

  const where: Record<string, unknown> = {
    status: "ACTIVE",
    gameId: params.gameId,
  }

  if (params.categoryId) where.categoryId = params.categoryId
  if (params.rarity) where.rarity = params.rarity
  if (params.minPrice || params.maxPrice) {
    where.price = {}
    if (params.minPrice) (where.price as Record<string, number>).gte = parseFloat(params.minPrice)
    if (params.maxPrice) (where.price as Record<string, number>).lte = parseFloat(params.maxPrice)
  }

  const orderBy: Record<string, string> = {}
  switch (params.sort) {
    case "price_asc": orderBy.price = "asc"; break
    case "price_desc": orderBy.price = "desc"; break
    case "popular": orderBy.viewCount = "desc"; break
    default: orderBy.createdAt = "desc"
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        game: { select: { id: true, name: true, slug: true, iconUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        seller: { select: { id: true, username: true, avatarUrl: true, isPro: true, isVerified: true, verificationLevel: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ])

  return { listings, total, page, pages: Math.ceil(total / limit) }
}

function GameBrowseSkeleton() {
  return (
    <div>
      <div className="h-64 skeleton" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-20 skeleton rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-[--bg-surface] border border-[--border] rounded-[16px] overflow-hidden">
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

export default async function GameBrowsePage({ params, searchParams }: PageProps) {
  const { game: gameSlug } = await params
  const filters = await searchParams

  const game = await getGame(gameSlug)
  if (!game) notFound()

  const { listings, total, page, pages } = await getListings({
    gameId: game.id,
    categoryId: filters.categoryId,
    rarity: filters.rarity,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sort: filters.sort,
    page: filters.page,
  })

  return (
    <Suspense fallback={<GameBrowseSkeleton />}>
      <GameBrowseContent
        game={game as never}
        initialListings={listings as never}
        initialTotal={total}
        initialPage={page}
        initialPages={pages}
      />
    </Suspense>
  )
}
