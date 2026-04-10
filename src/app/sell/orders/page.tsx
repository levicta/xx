import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function getSellerOrders(userId: string) {
  return prisma.order.findMany({
    where: { sellerId: userId },
    include: {
      listing: { select: { title: true, images: true } },
      buyer: { select: { username: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: "bg-muted/50 text-muted-foreground",
  PAID: "bg-blue-500/20 text-blue-400",
  DELIVERING: "bg-amber-500/20 text-amber-400",
  DELIVERED: "bg-primary/20 text-primary",
  COMPLETED: "bg-primary/20 text-primary",
  DISPUTED: "bg-red-500/20 text-red-400",
  REFUNDED: "bg-muted/50 text-muted-foreground",
  CANCELLED: "bg-muted/50 text-muted-foreground",
}

export default async function SellerOrdersPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const orders = await getSellerOrders(session.user.id)

  return (
    <main>
        <h1 className="text-2xl font-semibold text-foreground mb-8 lowercase">sales & orders</h1>

        {orders.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-border/50 bg-card p-8">
            <p className="text-muted-foreground">you haven't made any sales yet.</p>
            <Link 
              href="/sell/new"
              className="mt-4 font-semibold text-foreground hover:text-foreground/80"
            >
              create your first listing
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-muted-foreground border-b border-border/50 bg-secondary/50">
                    <th className="p-4 font-medium">order id</th>
                    <th className="p-4 font-medium">item</th>
                    <th className="p-4 font-medium">buyer</th>
                    <th className="p-4 font-medium">amount</th>
                    <th className="p-4 font-medium">earnings</th>
                    <th className="p-4 font-medium">status</th>
                    <th className="p-4 font-medium">date</th>
                    <th className="p-4 font-medium">action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-border/50 last:border-0">
                      <td className="p-4 font-mono text-sm text-foreground">
                        #{order.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {order.listing.images[0] && (
                            <img
                              src={order.listing.images[0]}
                              alt={order.listing.title}
                              className="w-10 h-10 object-cover rounded-lg"
                            />
                          )}
                          <span className="text-foreground">{order.listing.title}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{order.buyer.username}</td>
                      <td className="p-4 font-semibold text-foreground">${order.totalPrice.toFixed(2)}</td>
                      <td className="p-4 font-semibold text-primary">${order.sellerEarnings.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${statusColors[order.status]}`}>
                          {order.status.toLowerCase().replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          view
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
  )
}