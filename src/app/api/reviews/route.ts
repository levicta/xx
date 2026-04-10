import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { orderId, rating, comment } = body

  if (!orderId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { review: true },
  })

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  if (order.buyerId !== session.user.id) {
    return NextResponse.json({ error: "Only buyer can review" }, { status: 403 })
  }

  if (order.status !== "COMPLETED") {
    return NextResponse.json({ error: "Can only review completed orders" }, { status: 400 })
  }

  if (order.review) {
    return NextResponse.json({ error: "Review already exists" }, { status: 400 })
  }

  const review = await prisma.review.create({
    data: {
      orderId,
      reviewerId: session.user.id,
      sellerId: order.sellerId,
      rating,
      comment: comment || null,
    },
    include: {
      reviewer: { select: { username: true } },
    },
  })

  return NextResponse.json(review)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sellerId = searchParams.get("sellerId")

  if (!sellerId) {
    return NextResponse.json({ error: "sellerId required" }, { status: 400 })
  }

  const reviews = await prisma.review.findMany({
    where: { sellerId },
    include: {
      reviewer: { select: { username: true, avatarUrl: true } },
      order: {
        include: {
          listing: { select: { title: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(reviews)
}