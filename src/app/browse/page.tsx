"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface Game {
  id: string
  name: string
  slug: string
  categories: { id: string; name: string }[]
}

const gameEmojis: Record<string, string> = {
  "adopt-me": "🐾",
  "blox-fruits": "🍎",
  "murder-mystery-2": "🔪",
  "pet-simulator-x": "🐕",
  "brookhaven": "🏠",
  "da-hood": "🎭",
  "royale-high": "👑",
  "jailbreak": "🚔",
}

export default function BrowsePage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGames() {
      setLoading(true)
      try {
        const res = await fetch("/api/games")
        const gamesData = await res.json()

        const gamesWithCategories = await Promise.all(
          (gamesData.games || []).map(async (game: { id: string; name: string; slug: string }) => {
            try {
              const detailRes = await fetch(`/api/games/${game.slug}`)
              const detailData = await detailRes.json()
              return { ...game, categories: detailData.categories || [] }
            } catch {
              return { ...game, categories: [] }
            }
          })
        )

        setGames(gamesWithCategories)
      } catch (error) {
        console.error("Failed to fetch games:", error)
      }
      setLoading(false)
    }

    fetchGames()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Browse</h1>
      </header>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card border border-border/50 rounded-xl overflow-hidden">
              <div className="aspect-square skeleton" />
              <div className="p-3 space-y-2">
                <div className="h-4 skeleton w-3/4" />
                <div className="h-3 skeleton w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {games.map((game) => {
            const emoji = gameEmojis[game.slug] || "🎮"
            const categoriesText = game.categories.map((c) => c.name).join(", ")

            return (
              <Link
                key={game.id}
                href={`/browse/${game.slug}`}
                className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-200"
              >
                <div className="aspect-square bg-secondary/30 flex items-center justify-center p-6">
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                    {emoji}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {game.name}
                  </h3>
                  {categoriesText && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {categoriesText}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <footer className="mt-12 text-center text-[10px] text-muted-foreground/50 tracking-widest">
        RBLX.MKT
      </footer>
    </div>
  )
}