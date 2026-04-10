import { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"

interface PageProps {
  params: Promise<{ username: string }>
}

async function getUser(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      bio: true,
      avatarUrl: true,
      isPro: true,
      isVerified: true,
      _count: { select: { listings: true, receivedReviews: true } },
    },
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const user = await getUser(username)

  if (!user) {
    return {
      title: "User Not Found - RobloxMarket",
    }
  }

  const reviewCount = user._count.receivedReviews
  const reviewText = reviewCount === 1 ? "review" : "reviews"

  return {
    title: `${user.username} ${user.isPro ? " Pro Seller" : ""} - RobloxMarket`,
    description: user.bio 
      ? user.bio 
      : `View ${user.username}'s ${user._count.listings} listings and ${reviewCount} ${reviewText} on RobloxMarket.`,
    alternates: {
      canonical: `/profile/${username}`,
    },
    openGraph: {
      title: `${user.username} ${user.isPro ? " Pro Seller" : ""} - RobloxMarket`,
      description: user.bio || `View ${user.username}'s listings on RobloxMarket.`,
      url: `/profile/${username}`,
      images: user.avatarUrl ? [{ url: user.avatarUrl }] : [],
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `${user.username} - RobloxMarket`,
      description: user.bio || `View ${user.username}'s listings on RobloxMarket.`,
      images: user.avatarUrl ? [user.avatarUrl] : [],
    },
  }
}

export default async function ProfileSEOPage({ params }: PageProps) {
  const { username } = await params
  const user = await getUser(username)

  if (!user) notFound()

  return null
}