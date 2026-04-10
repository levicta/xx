import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { action } = body

    const order = await prisma.order.findUnique({
      where: { id },
      include: { listing: true },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const isBuyer = order.buyerId === session.user.id
    const isSeller = order.sellerId === session.user.id

    if (!isBuyer && !isSeller) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    if (action === "mark_delivered") {
      if (!isSeller) {
        return NextResponse.json({ error: "Only seller can mark delivered" }, { status: 403 })
      }
      if (order.status !== "PAID") {
        return NextResponse.json({ error: "Order must be paid first" }, { status: 400 })
      }

      await prisma.order.update({
        where: { id },
        data: { status: "DELIVERING", deliveredAt: new Date() },
      })

      await prisma.notification.create({
        data: {
          userId: order.buyerId,
          type: "ITEM_DELIVERED",
          title: "Item Delivered",
          body: `Your ${order.listing.title} has been delivered!`,
          link: `/orders/${order.id}`,
        },
      })

      return NextResponse.json({ success: true })
    }

    if (action === "confirm_receipt") {
      if (!isBuyer) {
        return NextResponse.json({ error: "Only buyer can confirm receipt" }, { status: 403 })
      }
      if (order.status !== "DELIVERING") {
        return NextResponse.json({ error: "Item must be delivered first" }, { status: 400 })
      }

      await prisma.$transaction([
        prisma.order.update({
          where: { id },
          data: { status: "COMPLETED", completedAt: new Date() },
        }),
        prisma.user.update({
          where: { id: order.sellerId },
          data: { balance: { increment: order.sellerEarnings } },
        }),
      ])

      await prisma.notification.create({
        data: {
          userId: order.sellerId,
          type: "ORDER_COMPLETED",
          title: "Order Completed",
          body: `You earned $${order.sellerEarnings.toFixed(2)} from the sale of ${order.listing.title}`,
          link: `/orders/${order.id}`,
        },
      })

      return NextResponse.json({ success: true })
    }

    if (action === "open_dispute") {
      if (!isBuyer && !isSeller) {
        return NextResponse.json({ error: "Only parties can open dispute" }, { status: 403 })
      }
      if (order.status === "COMPLETED" || order.status === "REFUNDED") {
        return NextResponse.json({ error: "Cannot dispute completed order" }, { status: 400 })
      }

      await prisma.order.update({
        where: { id },
        data: { status: "DISPUTED" },
      })

      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      })

      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: "DISPUTE_OPENED",
          title: "Dispute Opened",
          body: `Dispute opened for order ${order.id} - ${order.listing.title}`,
          link: `/admin/reports`,
        })),
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
