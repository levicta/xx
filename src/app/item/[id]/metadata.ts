import { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"

interface PageProps {
  params: Promise<{ id: string }>
}

async function getListing(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: {
      game: { select: { name: true } },
    },
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const listing = await getListing(id)

  if (!listing) {
    return {
      title: "Item Not Found - RobloxMarket",
    }
  }

  return {
    title: `${listing.title} - ${listing.game.name} | RobloxMarket`,
    description: `Buy ${listing.title} for $${listing.price.toFixed(2)} on RobloxMarket. ${listing.game.name} item.`,
    openGraph: {
      title: listing.title,
      description: `Buy ${listing.title} for $${listing.price.toFixed(2)}`,
      images: listing.images[0] ? [listing.images[0]] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: listing.title,
      description: `Buy ${listing.title} for $${listing.price.toFixed(2)}`,
      images: listing.images[0] ? [listing.images[0]] : [],
    },
  }
}

export default async function ItemSEOPage({ params }: PageProps) {
  const { id } = await params
  const listing = await getListing(id)

  if (!listing) notFound()

  return null
}
