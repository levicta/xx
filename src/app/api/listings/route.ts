import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const gameId = searchParams.get("gameId")
    const categoryId = searchParams.get("categoryId")
    const rarity = searchParams.get("rarity")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const sort = searchParams.get("sort") || "newest"
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {
      status: "ACTIVE",
    }

    if (gameId) where.gameId = gameId
    if (categoryId) where.categoryId = categoryId
    if (rarity) where.rarity = rarity
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice)
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice)
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const orderBy: Record<string, string> = {}
    switch (sort) {
      case "price_asc":
        orderBy.price = "asc"
        break
      case "price_desc":
        orderBy.price = "desc"
        break
      case "popular":
        orderBy.viewCount = "desc"
        break
      default:
        orderBy.createdAt = "desc"
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          game: { select: { id: true, name: true, slug: true, iconUrl: true } },
          category: { select: { id: true, name: true, slug: true } },
          seller: { select: { id: true, username: true, avatarUrl: true, isPro: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ])

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching listings:", error)
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      price,
      quantity,
      rarity,
      images,
      gameId,
      categoryId,
      deliveryMethod,
      deliveryInstructions,
      tags,
    } = body

    if (!title || !description || !price || !gameId || !categoryId || !deliveryMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!images || images.length === 0) {
      return NextResponse.json({ error: "At least 1 image required" }, { status: 400 })
    }

    if (price < 0.5) {
      return NextResponse.json({ error: "Price must be at least $0.50" }, { status: 400 })
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity) || 1,
        rarity: rarity || "COMMON",
        images,
        gameId,
        categoryId,
        sellerId: session.user.id,
        deliveryMethod,
        deliveryInstructions: deliveryInstructions || null,
        tags: tags || [],
      },
    })

    return NextResponse.json(listing)
  } catch (error) {
    console.error("Error creating listing:", error)
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 })
  }
}
