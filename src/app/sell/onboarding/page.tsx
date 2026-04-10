import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { OnboardingWizard } from "@/components/seller/OnboardingWizard"

export const dynamic = 'force-dynamic'

async function getOnboardingStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      onboardingCompleted: true,
      onboardingStep: true,
      role: true,
    },
  })
  return user
}

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const status = await getOnboardingStatus(session.user.id)

  if (status?.onboardingCompleted) {
    redirect("/sell")
  }

  return (
    <>
      <div className="text-center mb-6">
        <span className="text-2xl font-bold tracking-tight">rblx.mkt</span>
      </div>
      <h1 className="text-3xl font-semibold text-foreground mb-8">become a seller</h1>
      <OnboardingWizard initialStep={status?.onboardingStep || 1} />
    </>
  )
}