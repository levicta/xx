import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

async function getListings() {
  return prisma.listing.findMany({
    include: {
      game: { select: { name: true } },
      seller: { select: { username: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-primary/20 text-primary",
  PAUSED: "bg-amber-400/20 text-amber-400",
  SOLD_OUT: "bg-red-400/20 text-red-400",
  PENDING_REVIEW: "bg-blue-400/20 text-blue-400",
  REMOVED: "bg-muted/20 text-muted-foreground",
}

export default async function AdminListingsPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")
  if (session.user.role !== "ADMIN") redirect("/")

  const listings = await getListings()

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-foreground mb-8 lowercase">
          listings moderation
        </h1>

        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-muted-foreground border-b border-border/50 bg-card/50">
                <th className="p-4 font-medium">Item</th>
                <th className="p-4 font-medium">Game</th>
                <th className="p-4 font-medium">Seller</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id} className="border-b border-border/50 last:border-0">
                  <td className="p-4">
                    <p className="text-foreground font-medium">{listing.title}</p>
                    <p className="text-xs text-muted-foreground/70">{listing.rarity}</p>
                  </td>
                  <td className="p-4 text-muted-foreground">{listing.game.name}</td>
                  <td className="p-4 text-muted-foreground">{listing.seller.username}</td>
                  <td className="p-4 font-mono text-primary">${listing.price.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[listing.status]}`}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {listing.status !== "REMOVED" && (
                      <form action={`/api/admin/listings/${listing.id}/remove`} method="POST">
                        <button className="px-3 py-1 text-xs bg-red-400/20 text-red-400 rounded-2xl hover:bg-red-400/30">
                          Remove
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}