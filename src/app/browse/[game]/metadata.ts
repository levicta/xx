import { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"

interface PageProps {
  params: Promise<{ game: string }>
}

async function getGame(slug: string) {
  return prisma.game.findUnique({
    where: { slug },
    select: { name: true, description: true, coverUrl: true },
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { game } = await params
  const gameData = await getGame(game)

  if (!gameData) {
    return {
      title: "Game Not Found - RobloxMarket",
    }
  }

  return {
    title: `${gameData.name} Items | RobloxMarket`,
    description: gameData.description || `Buy and sell ${gameData.name} items on RobloxMarket.`,
    alternates: {
      canonical: `/browse/${game}`,
    },
    openGraph: {
      title: `${gameData.name} Items | RobloxMarket`,
      description: gameData.description || `Buy and sell ${gameData.name} items.`,
      url: `/browse/${game}`,
      images: gameData.coverUrl ? [{ url: gameData.coverUrl }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${gameData.name} Items | RobloxMarket`,
      description: gameData.description || `Buy and sell ${gameData.name} items.`,
      images: gameData.coverUrl ? [gameData.coverUrl] : [],
    },
  }
}

export default async function GameSEOPage({ params }: PageProps) {
  const { game } = await params
  const gameData = await getGame(game)

  if (!gameData) notFound()

  return null
}
