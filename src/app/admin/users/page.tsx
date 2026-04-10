import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

async function getUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isPro: true,
      createdAt: true,
      _count: {
        select: { listings: true, sales: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

const roleColors: Record<string, string> = {
  BUYER: "bg-muted/20 text-muted-foreground",
  SELLER: "bg-primary/20 text-primary",
  ADMIN: "bg-red-400/20 text-red-400",
}

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")
  if (session.user.role !== "ADMIN") redirect("/")

  const users = await getUsers()

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-foreground mb-8 lowercase">
          user management
        </h1>

        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-muted-foreground border-b border-border/50 bg-card/50">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Pro</th>
                <th className="p-4 font-medium">Listings</th>
                <th className="p-4 font-medium">Sales</th>
                <th className="p-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border/50 last:border-0">
                  <td className="p-4">
                    <p className="text-foreground font-medium">{user.username}</p>
                  </td>
                  <td className="p-4 text-muted-foreground text-sm">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {user.isPro ? "✓" : "—"}
                  </td>
                  <td className="p-4 text-muted-foreground">{user._count.listings}</td>
                  <td className="p-4 text-muted-foreground">{user._count.sales}</td>
                  <td className="p-4 text-sm text-muted-foreground/70">
                    {new Date(user.createdAt).toLocaleDateString()}
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