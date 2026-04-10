import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        game: {
          select: { id: true, name: true, slug: true, iconUrl: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        seller: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            isPro: true,
            createdAt: true,
            _count: {
              select: { sales: true },
            },
          },
        },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    await prisma.listing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    const { deliveryInstructions, ...listingWithoutSecret } = listing

    return NextResponse.json(listingWithoutSecret)
  } catch (error) {
    console.error("Error fetching listing:", error)
    return NextResponse.json({ error: "Failed to fetch listing" }, { status: 500 })
  }
}
