import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { OrderStatusStepper } from "@/components/order/OrderStatusStepper"
import { MessageThread } from "@/components/order/MessageThread"
import { OrderActions } from "@/components/order/OrderActions"
import { ReviewSection } from "@/components/order/ReviewSection"
import Link from "next/link"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ success?: string }>
}

async function getOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      listing: {
        include: {
          game: { select: { name: true, slug: true } },
        },
      },
      buyer: { select: { id: true, username: true, avatarUrl: true } },
      seller: { select: { id: true, username: true, avatarUrl: true } },
      review: {
        include: {
          reviewer: { select: { username: true } },
        },
      },
    },
  })
}

async function getMessages(id: string) {
  return prisma.message.findMany({
    where: { orderId: id },
    orderBy: { createdAt: "asc" },
  })
}

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: "text-muted-foreground",
  PAID: "text-blue-400",
  DELIVERING: "text-amber-400",
  DELIVERED: "text-primary",
  COMPLETED: "text-primary",
  DISPUTED: "text-red-400",
  REFUNDED: "text-muted-foreground",
  CANCELLED: "text-muted-foreground",
}

function OrderPageSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="h-8 w-32 bg-muted rounded animate-pulse mb-8" />
      <div className="h-24 bg-muted rounded-2xl mb-6" />
      <div className="grid gap-4">
        <div className="h-32 bg-muted rounded-2xl" />
        <div className="h-48 bg-muted rounded-2xl" />
      </div>
    </div>
  )
}

async function OrderPageContent({ id, success }: { id: string; success?: string }) {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const order = await getOrder(id)

  if (!order) notFound()

  const isBuyer = order.buyerId === session.user.id
  const isSeller = order.sellerId === session.user.id

  if (!isBuyer && !isSeller) {
    redirect("/")
  }

  const isLocked = order.status === "COMPLETED" || order.status === "REFUNDED"

  const handleAction = async (action: string) => {
    "use server"
    const res = await fetch(`/api/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || "Action failed")
    }
  }

  const showDeliveryInstructions = 
    order.status === "PAID" || 
    order.status === "DELIVERING" || 
    order.status === "DELIVERED" || 
    order.status === "COMPLETED"

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      {success && (
        <div className="mb-6 p-4 bg-primary/10 border border-primary rounded-2xl text-center">
          <span className="text-primary font-semibold">✓ payment successful!</span>
          <p className="text-sm text-muted-foreground mt-1">
            your seller has been notified and will deliver your item soon.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-muted-foreground">order</p>
          <h1 className="text-2xl font-bold text-foreground">
            #{order.id.slice(-8).toUpperCase()}
          </h1>
        </div>
        <div className={`text-sm font-semibold ${statusColors[order.status]}`}>
          {order.status.toLowerCase().replace("_", " ")}
        </div>
      </div>

      <div className="mb-6">
        <OrderStatusStepper status={order.status} />
      </div>

      <div className="rounded-2xl border border-border/50 bg-card p-6 mb-6">
        <div className="flex gap-4">
          {order.listing.images[0] && (
            <img
              src={order.listing.images[0]}
              alt={order.listing.title}
              className="w-24 h-24 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <h2 className="font-semibold text-foreground">{order.listing.title}</h2>
            <p className="text-sm text-muted-foreground">{order.listing.game.name}</p>
            <p className="text-sm text-muted-foreground">
              quantity: {order.quantity} × ${order.listing.price.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">total</p>
            <p className="text-xl font-bold text-primary">
              ${order.totalPrice.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              {isBuyer ? "sold by" : "purchased by"}
            </p>
            <Link href={`/profile/${isBuyer ? order.seller.username : order.buyer.username}`} className="font-medium text-foreground hover:text-primary">
              {isBuyer ? order.seller.username : order.buyer.username}
            </Link>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">date</p>
            <p className="text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {showDeliveryInstructions && order.listing.deliveryInstructions && (
        <div className="rounded-2xl border border-border/50 bg-card p-6 mb-6">
          <h3 className="font-semibold text-foreground mb-2">delivery instructions</h3>
          <div className="p-4 bg-secondary rounded-lg text-muted-foreground">
            {order.listing.deliveryInstructions}
          </div>
        </div>
      )}

      <div className="mb-6">
        <MessageThread orderId={id} isLocked={isLocked} />
      </div>

      <OrderActions 
        orderId={id} 
        status={order.status} 
        isBuyer={isBuyer} 
        isSeller={isSeller} 
      />

      <ReviewSection
        orderId={id}
        orderStatus={order.status}
        isBuyer={isBuyer}
        existingReview={order.review}
      />
    </div>
  )
}

export default async function OrderPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { success } = await searchParams

  return (
    <Suspense fallback={<OrderPageSkeleton />}>
      <OrderPageContent id={id} success={success} />
    </Suspense>
  )
}