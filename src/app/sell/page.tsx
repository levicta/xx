import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function getStats(userId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    activeListings,
    pendingOrders,
    totalEarnings,
    monthEarnings,
    recentOrders,
  ] = await Promise.all([
    prisma.listing.count({
      where: { sellerId: userId, status: "ACTIVE" },
    }),
    prisma.order.count({
      where: {
        sellerId: userId,
        status: { in: ["PAID", "DELIVERING", "DELIVERED"] },
      },
    }),
    prisma.order.aggregate({
      where: { sellerId: userId, status: "COMPLETED" },
      _sum: { sellerEarnings: true },
    }),
    prisma.order.aggregate({
      where: {
        sellerId: userId,
        status: "COMPLETED",
        completedAt: { gte: startOfMonth },
      },
      _sum: { sellerEarnings: true },
    }),
    prisma.order.findMany({
      where: { sellerId: userId },
      include: {
        listing: { select: { title: true } },
        buyer: { select: { username: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  return {
    activeListings,
    pendingOrders,
    totalEarnings: totalEarnings._sum.sellerEarnings || 0,
    monthEarnings: monthEarnings._sum.sellerEarnings || 0,
    recentOrders,
  }
}

async function getEarningsChart(userId: string) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const orders = await prisma.order.findMany({
    where: {
      sellerId: userId,
      status: "COMPLETED",
      completedAt: { gte: thirtyDaysAgo },
    },
    select: {
      completedAt: true,
      sellerEarnings: true,
    },
    orderBy: { completedAt: "asc" },
  })

  const earningsByDay: Record<string, number> = {}
  
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const key = date.toISOString().split("T")[0]
    earningsByDay[key] = 0
  }

  orders.forEach((order) => {
    if (order.completedAt) {
      const key = order.completedAt.toISOString().split("T")[0]
      if (earningsByDay[key] !== undefined) {
        earningsByDay[key] += order.sellerEarnings
      }
    }
  })

  return Object.entries(earningsByDay)
    .map(([date, earnings]) => ({ date, earnings }))
    .reverse()
}

function SellerLandingPage() {
  return (
    <div className="min-h-screen">
      <section className="py-[100px]">
        <div className="max-w-[960px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 lg:w-[55%]">
              <span className="inline-block px-3 py-1 bg-[var(--primary)] text-white text-xs font-medium rounded-full mb-6">
                for sellers
              </span>
              <h1 className="font-black tracking-tight text-foreground" style={{ fontFamily: 'Nunito, sans-serif', letterSpacing: '-1px', fontSize: '42px', lineHeight: 1.1, maxWidth: '500px' }}>
                start making money on rblx.mkt
              </h1>
              <p className="text-base text-muted-foreground max-w-[420px] leading-relaxed mb-6">
                Reach thousands of Roblox players who buy items daily from sellers like you. List in 60 seconds, get paid in days.
              </p>
              <Link 
                href="/sell/onboarding"
                className="inline-block px-8 py-3.5 bg-[var(--primary)] text-white font-bold text-base rounded-full hover:opacity-90 transition-opacity"
              >
                start selling →
              </Link>
              <div className="flex items-center gap-4 mt-6 text-xs text-muted-foreground">
                <span>🔒 Stripe payments</span>
                <span>·</span>
                <span>💸 93% kept</span>
                <span>·</span>
                <span>⚡ Free to list</span>
              </div>
            </div>
            
            <div className="flex-1 lg:w-[45%] flex justify-center relative min-h-[280px]">
              <div className="absolute top-4 left-1/2 -translate-x-8 bg-card border border-border/50 rounded-2xl p-4 w-[200px] transform rotate-[-3deg] shadow-lg" style={{ opacity: 0.65 }}>
                <div className="w-full h-32 bg-secondary rounded-lg mb-3 flex items-center justify-center text-3xl">🐝</div>
                <p className="text-sm font-medium text-foreground">Gifted Riley Bee</p>
                <p className="text-xs text-muted-foreground mb-2">Bee Swarm</p>
                <p className="text-lg font-bold text-primary">$12.00</p>
              </div>
              <div className="absolute top-16 left-1/2 translate-x-8 bg-card border border-border/50 rounded-2xl p-4 w-[200px] transform rotate-[1deg] shadow-xl z-10">
                <div className="w-full h-32 bg-secondary rounded-lg mb-3 flex items-center justify-center text-3xl">🐉</div>
                <p className="text-sm font-medium text-foreground">Neon Dragon</p>
                <p className="text-xs text-muted-foreground mb-2">Adopt Me</p>
                <p className="text-lg font-bold text-primary">$24.99</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card border-y border-border py-6">
        <div className="max-w-[960px] mx-auto px-6">
          <div className="flex items-center justify-center gap-0">
            <div className="flex-1 text-center py-2">
              <p className="text-sm font-semibold text-foreground">free to list</p>
              <p className="text-xs text-muted-foreground">no monthly fees</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex-1 text-center py-2">
              <p className="text-sm font-semibold text-foreground">7% commission</p>
              <p className="text-xs text-muted-foreground">lowest in roblox</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex-1 text-center py-2">
              <p className="text-sm font-semibold text-foreground">1–3 day payouts</p>
              <p className="text-xs text-muted-foreground">paypal or cashapp</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-[100px]">
        <div className="max-w-[960px] mx-auto px-6">
          <h2 className="text-[32px] font-black text-foreground text-center mb-10" style={{ fontFamily: 'Nunito, sans-serif' }}>
            why rblx.mkt?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-2xl p-6" style={{ alignItems: 'flex-start', minHeight: '280px', justifyContent: 'flex-start' }}>
              <div className="w-11 h-11 rounded-xl bg-[#FBEAF0] flex items-center justify-center text-xl mb-4">🚀</div>
              <h3 className="text-base font-semibold text-foreground mb-2">list in 60 seconds</h3>
              <p className="text-sm text-muted-foreground">Create a listing with photos, price, and delivery method in under a minute.</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6" style={{ alignItems: 'flex-start', minHeight: '280px', justifyContent: 'flex-start' }}>
              <div className="w-11 h-11 rounded-xl bg-[#FBEAF0] flex items-center justify-center text-xl mb-4">🔒</div>
              <h3 className="text-base font-semibold text-foreground mb-2">100% payment protection</h3>
              <p className="text-sm text-muted-foreground">Stripe handles all payments. You never touch card data and chargebacks can't touch you.</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6" style={{ alignItems: 'flex-start', minHeight: '280px', justifyContent: 'flex-start' }}>
              <div className="w-11 h-11 rounded-xl bg-[#FBEAF0] flex items-center justify-center text-xl mb-4">💸</div>
              <h3 className="text-base font-semibold text-foreground mb-2">fast payouts</h3>
              <p className="text-sm text-muted-foreground">Request a payout anytime. Funds hit your PayPal or CashApp in 1–3 business days.</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6" style={{ alignItems: 'flex-start', minHeight: '280px', justifyContent: 'flex-start' }}>
              <div className="w-11 h-11 rounded-xl bg-[#FBEAF0] flex items-center justify-center text-xl mb-4">⭐</div>
              <h3 className="text-base font-semibold text-foreground mb-2">build your reputation</h3>
              <p className="text-sm text-muted-foreground">Earn reviews from buyers. Top sellers get a verified badge and appear higher in search.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-[100px] bg-card border-t border-b border-border">
        <div className="max-w-[960px] mx-auto px-6">
          <h2 className="text-[32px] font-black text-foreground text-center mb-12" style={{ fontFamily: 'Nunito, sans-serif' }}>
            how it works
          </h2>
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 relative">
            <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 border-t-2 border-dashed border-border -z-10" style={{ borderColor: 'var(--border)' }} />
            
            <div className="flex-1 text-center">
              <div className="mb-4 font-black text-[var(--primary)]" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '64px', lineHeight: 1 }}>01</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">create your listing</h3>
              <p className="text-sm text-muted-foreground">Add photos, set your price, choose delivery method. Takes under a minute.</p>
            </div>
            
            <div className="flex-1 text-center">
              <div className="mb-4 font-black text-[var(--primary)]" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '64px', lineHeight: 1 }}>02</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">buyer pays securely</h3>
              <p className="text-sm text-muted-foreground">Stripe collects payment. Funds are held safely until you deliver.</p>
            </div>
            
            <div className="flex-1 text-center">
              <div className="mb-4 font-black text-[var(--primary)]" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '64px', lineHeight: 1 }}>03</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">deliver & get paid</h3>
              <p className="text-sm text-muted-foreground">Mark as delivered, buyer confirms, your balance is credited. Request payout anytime.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-[100px]">
        <div className="max-w-[860px] mx-auto px-6">
          <div className="bg-primary rounded-[20px] p-12 text-center" style={{ backgroundColor: 'oklch(0.75 0.12 350)' }}>
            <h2 className="text-[36px] font-black text-white mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
              ready to start selling?
            </h2>
            <p className="text-base mb-8" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Join rblx.mkt today. Free to list, 60 seconds to set up.
            </p>
            <Link 
              href="/sell/onboarding"
              className="inline-block px-8 py-3.5 bg-white text-[var(--primary)] font-bold text-base rounded-full hover:opacity-90 transition-opacity"
            >
              start selling →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default async function SellerPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true, role: true },
  })

  if (user?.onboardingCompleted) {
    const [stats, chartData] = await Promise.all([
      getStats(session.user.id),
      getEarningsChart(session.user.id),
    ])

    const maxEarnings = Math.max(...chartData.map(d => d.earnings), 0)

    return (
      <main>
        <h1 className="text-2xl font-semibold text-foreground mb-8 lowercase">seller dashboard</h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-sm text-muted-foreground">active listings</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{stats.activeListings}</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-sm text-muted-foreground">pending orders</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{stats.pendingOrders}</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-sm text-muted-foreground">total earned</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">${stats.totalEarnings.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-sm text-muted-foreground">this month</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">${stats.monthEarnings.toFixed(2)}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-6 mb-8">
          <h2 className="font-semibold text-foreground mb-4">earnings (last 30 days)</h2>
          <div className="h-48 flex items-end justify-between gap-1">
            {chartData.map((day, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-primary/20 transition-colors hover:bg-primary/30"
                style={{
                  height: maxEarnings > 0 ? `${(day.earnings / maxEarnings) * 100}%` : "0%",
                  minHeight: day.earnings > 0 ? "4px" : "0",
                }}
                title={`${day.date}: $${day.earnings.toFixed(2)}`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
            <span>30 days ago</span>
            <span>today</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">recent orders</h2>
            <Link href="/sell/orders" className="text-sm text-primary hover:underline">
              view all →
            </Link>
          </div>
          
          {stats.recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">no orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-muted-foreground border-b border-border/50">
                    <th className="pb-3 font-medium">order</th>
                    <th className="pb-3 font-medium">buyer</th>
                    <th className="pb-3 font-medium">amount</th>
                    <th className="pb-3 font-medium">status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 text-foreground">{order.listing.title}</td>
                      <td className="py-3 text-muted-foreground">{order.buyer.username}</td>
                      <td className="py-3 font-semibold text-primary">${order.totalPrice.toFixed(2)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === "COMPLETED" ? "bg-primary/20 text-primary" :
                          order.status === "PAID" ? "bg-blue-500/20 text-blue-400" :
                          order.status === "DELIVERING" ? "bg-amber-500/20 text-amber-400" :
                          "bg-secondary text-muted-foreground"
                        }`}>
                          {order.status.toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    )
  }

  return <SellerLandingPage />
}