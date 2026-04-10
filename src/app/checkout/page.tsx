import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { CheckoutFormWrapper } from "@/components/checkout/CheckoutForm"

interface PageProps {
  searchParams: Promise<{ listingId?: string; quantity?: string }>
}

async function getListing(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: {
      game: { select: { name: true, slug: true } },
      seller: { select: { username: true } },
    },
  })
}

async function createPaymentIntent(listingId: string, quantity: number, userId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      seller: { select: { commissionRate: true, isPro: true } },
    },
  })

  if (!listing) throw new Error("Listing not found")
  if (listing.sellerId === userId) throw new Error("Cannot buy your own listing")

  const available = listing.quantity - listing.quantitySold
  if (available < quantity) throw new Error("Insufficient stock")

  const commissionRate = listing.seller.isPro ? 0.03 : listing.seller.commissionRate
  const totalPrice = listing.price * quantity
  const commission = totalPrice * commissionRate
  const sellerEarnings = totalPrice - commission

  const order = await prisma.order.create({
    data: {
      listingId,
      buyerId: userId,
      sellerId: listing.sellerId,
      quantity,
      totalPrice,
      commission,
      sellerEarnings,
      status: "PENDING_PAYMENT",
    },
  })

  const Stripe = (await import("stripe")).default
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-04-30.basil",
  })

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalPrice * 100),
    currency: "usd",
    metadata: {
      orderId: order.id,
      listingId: listing.id,
      buyerId: userId,
      sellerId: listing.sellerId,
    },
    automatic_payment_methods: { enabled: true },
  })

  await prisma.order.update({
    where: { id: order.id },
    data: { stripePaymentId: paymentIntent.id },
  })

  return { clientSecret: paymentIntent.client_secret, orderId: order.id, totalPrice }
}

function CheckoutLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="h-8 w-48 bg-muted rounded animate-pulse mb-8" />
      <div className="h-64 bg-muted rounded-2xl animate-pulse" />
    </div>
  )
}

async function CheckoutContent({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const { listingId, quantity = "1" } = await searchParams

  if (!listingId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground mb-4">missing listing</h1>
        <p className="text-muted-foreground">please select an item to purchase.</p>
      </div>
    )
  }

  const listing = await getListing(listingId)

  if (!listing || listing.status !== "ACTIVE") notFound()

  const { clientSecret, orderId, totalPrice } = await createPaymentIntent(
    listingId,
    parseInt(quantity),
    session.user.id
  )

  if (!clientSecret) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground mb-4">payment error</h1>
        <p className="text-muted-foreground">unable to initialize payment. please try again.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <h1 className="text-2xl font-semibold text-foreground mb-8 lowercase">checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <h2 className="font-semibold text-foreground mb-4">order summary</h2>
          <div className="flex gap-4">
            {listing.images[0] && (
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
            <div>
              <h3 className="font-medium text-foreground">{listing.title}</h3>
              <p className="text-sm text-muted-foreground">{listing.game.name}</p>
              <p className="text-xs text-muted-foreground">sold by {listing.seller.username}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/50 flex justify-between">
            <span className="text-muted-foreground">total</span>
            <span className="font-bold text-primary">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-foreground mb-4">payment details</h2>
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <CheckoutFormWrapper
              clientSecret={clientSecret}
              orderId={orderId}
              amount={totalPrice}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent searchParams={searchParams} />
    </Suspense>
  )
}
