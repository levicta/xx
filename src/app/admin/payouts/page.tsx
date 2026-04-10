import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

async function getPayouts() {
  return prisma.payout.findMany({
    where: { status: { in: ["PENDING", "PROCESSING"] } },
    include: {
      user: { select: { username: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  })
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-400/20 text-amber-400",
  PROCESSING: "bg-blue-400/20 text-blue-400",
  COMPLETED: "bg-primary/20 text-primary",
  FAILED: "bg-red-400/20 text-red-400",
}

export default async function AdminPayoutsPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")
  if (session.user.role !== "ADMIN") redirect("/")

  const payouts = await getPayouts()

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-foreground mb-8 lowercase">
          payout management
        </h1>

        {payouts.length === 0 ? (
          <div className="bg-card border border-border/50 rounded-2xl p-12 text-center">
            <p className="text-muted-foreground">No pending payouts</p>
          </div>
        ) : (
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-muted-foreground border-b border-border/50 bg-card/50">
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Method</th>
                  <th className="p-4 font-medium">Address</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout.id} className="border-b border-border/50 last:border-0">
                    <td className="p-4">
                      <p className="text-foreground">{payout.user.username}</p>
                      <p className="text-xs text-muted-foreground/70">{payout.user.email}</p>
                    </td>
                    <td className="p-4 font-mono text-primary">${payout.amount.toFixed(2)}</td>
                    <td className="p-4 text-muted-foreground capitalize">{payout.method}</td>
                    <td className="p-4 text-sm text-muted-foreground/70 font-mono max-w-[200px] truncate">
                      {payout.address}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <form action={`/api/admin/payouts/${payout.id}/process`} method="POST">
                        <button className="px-3 py-1 text-xs bg-primary text-black font-semibold rounded-2xl hover:bg-primary/80">
                          Mark Processed
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}