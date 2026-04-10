import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      username: true,
      bio: true,
      avatarUrl: true,
    },
  })

  return NextResponse.json(user)
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { username, bio } = body

  // Check if username is taken
  if (username && username !== session.user.name) {
    const existing = await prisma.user.findUnique({
      where: { username },
    })
    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 })
    }
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(username && { username }),
      ...(bio !== undefined && { bio }),
    },
    select: {
      username: true,
      bio: true,
    },
  })

  return NextResponse.json(user)
}