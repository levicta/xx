import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 })
    }

    const { id } = await params

    await prisma.report.update({
      where: { id },
      data: { status: "RESOLVED" },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Resolve report error:", error)
    return NextResponse.json({ error: "Failed to resolve report" }, { status: 500 })
  }
}
