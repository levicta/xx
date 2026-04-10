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

    const { id } = await params

    const listing = await prisma.listing.findUnique({
      where: { id },
    })

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    if (listing.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const newStatus = listing.status === "ACTIVE" ? "PAUSED" : "ACTIVE"

    await prisma.listing.update({
      where: { id },
      data: { status: newStatus },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error toggling listing:", error)
    return NextResponse.json({ error: "Failed to toggle listing" }, { status: 500 })
  }
}
