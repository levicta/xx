import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { listingId, quantity = 1 } = body

    if (!listingId) {
      return NextResponse.json({ error: "Listing ID required" }, { status: 400 })
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        seller: { select: { commissionRate: true, isPro: true } },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    if (listing.status !== "ACTIVE") {
      return NextResponse.json({ error: "Listing is not available" }, { status: 400 })
    }

    const available = listing.quantity - listing.quantitySold
    if (available < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
    }

    if (listing.sellerId === session.user.id) {
      return NextResponse.json({ error: "Cannot buy your own listing" }, { status: 400 })
    }

    const commissionRate = listing.seller.isPro ? 0.03 : listing.seller.commissionRate
    const totalPrice = listing.price * quantity
    const commission = totalPrice * commissionRate
    const sellerEarnings = totalPrice - commission

    const order = await prisma.order.create({
      data: {
        listingId,
        buyerId: session.user.id,
        sellerId: listing.sellerId,
        quantity,
        totalPrice,
        commission,
        sellerEarnings,
        status: "PENDING_PAYMENT",
      },
    })

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: "usd",
      metadata: {
        orderId: order.id,
        listingId: listing.id,
        buyerId: session.user.id,
        sellerId: listing.sellerId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentId: paymentIntent.id },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 })
  }
}
