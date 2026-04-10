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
      role: true,
      onboardingCompleted: true,
      onboardingStep: true,
      isVerified: true,
      verificationLevel: true,
      payoutMethod: true,
      payoutAddress: true,
    },
  })

  return NextResponse.json({
    role: user?.role,
    onboardingCompleted: user?.onboardingCompleted || false,
    onboardingStep: user?.onboardingStep || 1,
    isVerified: user?.isVerified || false,
    verificationLevel: user?.verificationLevel || "NONE",
    payoutMethod: user?.payoutMethod,
    hasPayoutConfigured: !!(user?.payoutAddress),
  })
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { step, payoutMethod, payoutAddress } = body

  const updateData: Record<string, unknown> = {}

  if (step) {
    updateData.onboardingStep = step
  }

  if (payoutMethod) {
    updateData.payoutMethod = payoutMethod
  }

  if (payoutAddress !== undefined) {
    updateData.payoutAddress = payoutAddress
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
  })

  return NextResponse.json({
    onboardingStep: user.onboardingStep,
    payoutMethod: user.payoutMethod,
  })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { action } = body

  if (action === "complete") {
    // Mark onboarding as complete and update role to SELLER
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboardingCompleted: true,
        role: "SELLER",
        onboardingStep: 5,
        isVerified: true,
        verifiedAt: new Date(),
        verificationLevel: "BASIC",
      },
    })

    return NextResponse.json({
      success: true,
      role: user.role,
      onboardingCompleted: user.onboardingCompleted,
      isVerified: user.isVerified,
      verificationLevel: user.verificationLevel,
    })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}