import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { SellerSidebar } from "@/components/seller/SellerSidebar"

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  // Check onboarding status
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true },
  })

  const isOnboardingPage = String(children).includes("OnboardingWizard")
  const isSeller = user?.onboardingCompleted === true

  return (
    <div className="flex">
      {!isOnboardingPage && isSeller && <SellerSidebar />}
      <div className={!isSeller || isOnboardingPage ? "w-full" : "flex-1"}>
        {children}
      </div>
    </div>
  )
}