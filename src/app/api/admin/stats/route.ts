import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 })
    }

    const [
      totalUsers,
      totalListings,
      totalOrders,
      pendingPayouts,
      openReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.order.count(),
      prisma.payout.count({ where: { status: "PENDING" } }),
      prisma.report.count({ where: { status: "OPEN" } }),
    ])

    const revenueResult = await prisma.order.aggregate({
      where: { status: "COMPLETED" },
      _sum: { commission: true },
    })

    return NextResponse.json({
      totalUsers,
      totalListings,
      totalOrders,
      pendingPayouts,
      openReports,
      revenue: revenueResult._sum.commission || 0,
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
