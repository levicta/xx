import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { method, address, amount } = body

    if (!method || !address || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (amount < 10) {
      return NextResponse.json({ error: "Minimum payout is $10" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || user.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { balance: { decrement: amount } },
      }),
      prisma.payout.create({
        data: {
          userId: session.user.id,
          amount,
          method,
          address,
          status: "PENDING",
        },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Payout request error:", error)
    return NextResponse.json({ error: "Failed to request payout" }, { status: 500 })
  }
}
