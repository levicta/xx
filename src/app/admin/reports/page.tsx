import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

async function getReports() {
  return prisma.report.findMany({
    where: { status: { in: ["OPEN", "REVIEWING"] } },
    include: {
      reporter: { select: { username: true } },
    },
    orderBy: { createdAt: "asc" },
  })
}

const statusColors: Record<string, string> = {
  OPEN: "bg-red-400/20 text-red-400",
  REVIEWING: "bg-amber-400/20 text-amber-400",
  RESOLVED: "bg-primary/20 text-primary",
  DISMISSED: "bg-muted/20 text-muted-foreground",
}

export default async function AdminReportsPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")
  if (session.user.role !== "ADMIN") redirect("/")

  const reports = await getReports()

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-foreground mb-8 lowercase">
          reports queue
        </h1>

        {reports.length === 0 ? (
          <div className="bg-card border border-border/50 rounded-2xl p-12 text-center">
            <p className="text-muted-foreground">No pending reports</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-card border border-border/50 rounded-2xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[report.status]}`}>
                        {report.status}
                      </span>
                      <span className="text-sm text-muted-foreground/70">
                        Reported {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-medium text-foreground">{report.reason}</p>
                    {report.details && (
                      <p className="mt-2 text-sm text-muted-foreground">{report.details}</p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground/70">
                      Target: {report.targetType} (ID: {report.targetId}) • Reporter: {report.reporter.username}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <form action={`/api/admin/reports/${report.id}/resolve`} method="POST">
                      <button className="px-3 py-1 text-xs bg-primary/20 text-primary rounded-2xl hover:bg-primary/30">
                        Resolve
                      </button>
                    </form>
                    <form action={`/api/admin/reports/${report.id}/dismiss`} method="POST">
                      <button className="px-3 py-1 text-xs bg-card border border-border/50 text-muted-foreground rounded-2xl hover:bg-card/80">
                        Dismiss
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}