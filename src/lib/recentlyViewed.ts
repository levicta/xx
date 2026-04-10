export interface RecentlyViewedItem {
  id: string
  title: string
  price: number
  image: string
  gameName: string
  gameSlug: string
  sellerUsername: string
}

const STORAGE_KEY = "roblox-market-recently-viewed"
const MAX_ITEMS = 8

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function addToRecentlyViewed(item: RecentlyViewedItem): void {
  if (typeof window === "undefined") return
  try {
    const current = getRecentlyViewed()
    const filtered = current.filter((i) => i.id !== item.id)
    const updated = [item, ...filtered].slice(0, MAX_ITEMS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // Ignore storage errors
  }
}

export function clearRecentlyViewed(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}