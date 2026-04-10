export const CACHE_TIMES = {
  LISTINGS: 60 * 5,
  GAME_LISTINGS: 60 * 3,
  USER_PROFILE: 60 * 60,
  HOMEPAGE: 60 * 10,
  SEARCH: 60,
} as const

export function getCacheHeader(seconds: number) {
  return {
    next: { revalidate: seconds },
  }
}

export function getDynamicCacheHeader(seconds: number) {
  return {
    next: { revalidate: seconds },
  }
}