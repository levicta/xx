import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function getListings(userId: string) {
  return prisma.listing.findMany({
    where: { sellerId: userId },
    include: {
      game: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-primary/20 text-primary",
  PAUSED: "bg-amber-500/20 text-amber-400",
  SOLD_OUT: "bg-red-500/20 text-red-400",
  PENDING_REVIEW: "bg-blue-500/20 text-blue-400",
}

export default async function SellerListingsPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const listings = await getListings(session.user.id)

  return (
    <main>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-foreground lowercase">my listings</h1>
          <Link
            href="/sell/new"
            className="text-sm font-medium text-primary hover:text-primary/80"
          >
            + new listing
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-border/50 bg-card p-8">
            <p className="text-muted-foreground">you haven't created any listings yet.</p>
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
                    <th className="p-4 font-medium">item</th>
                    <th className="p-4 font-medium">game</th>
                    <th className="p-4 font-medium">price</th>
                    <th className="p-4 font-medium">stock</th>
                    <th className="p-4 font-medium">status</th>
                    <th className="p-4 font-medium">views</th>
                    <th className="p-4 font-medium">actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => {
                    const available = listing.quantity - listing.quantitySold
                    return (
                      <tr key={listing.id} className="border-b border-border/50 last:border-0">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {listing.images[0] && (
                              <img
                                src={listing.images[0]}
                                alt={listing.title}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            )}
                            <div>
                              <p className="font-medium text-foreground">{listing.title}</p>
                              <p className="text-xs text-muted-foreground">{listing.category.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{listing.game.name}</td>
                        <td className="p-4 font-semibold text-primary">${listing.price.toFixed(2)}</td>
                        <td className="p-4 text-muted-foreground">
                          {available}/{listing.quantity}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${statusColors[listing.status]}`}>
                            {listing.status.toLowerCase().replace("_", " ")}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{listing.viewCount}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Link
                              href={`/sell/listings/${listing.id}/edit`}
                              className="px-3 py-1 text-xs bg-secondary text-muted-foreground rounded hover:bg-secondary/80 transition-colors"
                            >
                              edit
                            </Link>
                            <form action={`/api/listings/${listing.id}/toggle`} method="POST">
                              <button
                                type="submit"
                                className="px-3 py-1 text-xs bg-secondary text-muted-foreground rounded hover:bg-secondary/80 transition-colors"
                              >
                                {listing.status === "ACTIVE" ? "pause" : "resume"}
                              </button>
                            </form>
                            <form action={`/api/listings/${listing.id}/delete`} method="POST">
                              <button
                                type="submit"
                                className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                              >
                                delete
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
  )
}