import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

async function getStats() {
  const [
    totalUsers,
    totalListings,
    totalOrders,
    pendingPayouts,
    openReports,
    activeListings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.order.count(),
    prisma.payout.count({ where: { status: "PENDING" } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
  ])

  const revenueResult = await prisma.order.aggregate({
    where: { status: "COMPLETED" },
    _sum: { commission: true },
  })

  return {
    totalUsers,
    totalListings,
    activeListings,
    totalOrders,
    pendingPayouts,
    openReports,
    revenue: revenueResult._sum.commission || 0,
  }
}

export default async function AdminDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")
  if (session.user.role !== "ADMIN") redirect("/")

  const stats = await getStats()

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-semibold text-foreground mb-8 lowercase">admin dashboard</h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-sm text-muted-foreground">total users</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.totalUsers}</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-sm text-muted-foreground">total listings</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.totalListings}</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-sm text-muted-foreground">active listings</p>
            <p className="text-2xl font-bold text-primary mt-1">{stats.activeListings}</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-sm text-muted-foreground">total orders</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.totalOrders}</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-sm text-muted-foreground">revenue</p>
            <p className="text-2xl font-bold text-primary mt-1">${stats.revenue.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-sm text-muted-foreground">pending payouts</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{stats.pendingPayouts}</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-sm text-muted-foreground">open reports</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{stats.openReports}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Link href="/admin/reports" className="rounded-2xl border border-border/50 bg-card p-6 hover:border-primary/40 transition-colors">
            <h3 className="font-semibold text-foreground mb-2">pending reports</h3>
            <p className="text-sm text-muted-foreground">{stats.openReports} reports need attention</p>
          </Link>
          <Link href="/admin/payouts" className="rounded-2xl border border-border/50 bg-card p-6 hover:border-primary/40 transition-colors">
            <h3 className="font-semibold text-foreground mb-2">pending payouts</h3>
            <p className="text-sm text-muted-foreground">{stats.pendingPayouts} payouts awaiting processing</p>
          </Link>
        </div>
      </main>
    </div>
  )
}