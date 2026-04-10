import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"
import { sendOrderConfirmation, sendNewSaleAlert } from "@/lib/email"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const orderId = paymentIntent.metadata.orderId

      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "PAID" },
        })

        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { 
            listing: true,
            buyer: { select: { email: true, username: true } },
            seller: { select: { email: true } },
          },
        })

        if (order) {
          await prisma.listing.update({
            where: { id: order.listingId },
            data: { quantitySold: { increment: order.quantity } },
          })

          await prisma.notification.create({
            data: {
              userId: order.sellerId,
              type: "NEW_ORDER",
              title: "New Sale!",
              body: `You sold ${order.listing.title} for $${order.totalPrice.toFixed(2)}`,
              link: `/orders/${order.id}`,
            },
          })

          sendOrderConfirmation(order.buyer.email, order.id, order.listing.title, order.totalPrice)
          sendNewSaleAlert(order.seller.email, order.listing.title, order.sellerEarnings, order.buyer.username)
        }
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const orderId = paymentIntent.metadata.orderId

      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED" },
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
