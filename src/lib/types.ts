import type { User, Listing, Order, Game, Category, Review, Notification, Payout } from "@prisma/client"

export type Role = User["role"]
export type ListingStatus = Listing["status"]
export type OrderStatus = Order["status"]
export type Rarity = Listing["rarity"]
export type VerificationLevel = User["verificationLevel"]
export type PayoutMethod = User["payoutMethod"]
export type PayoutStatus = Payout["status"]

export interface ListingWithRelations extends Listing {
  game: Pick<Game, "id" | "name" | "slug" | "iconUrl">
  category: Pick<Category, "id" | "name" | "slug">
  seller: Pick<User, "id" | "username" | "avatarUrl" | "isPro">
}

export interface GameWithCategories extends Game {
  categories: Pick<Category, "id" | "name" | "slug">[]
}

export interface OrderWithRelations extends Order {
  listing: Pick<Listing, "id" | "title" | "images" | "price">
  buyer: Pick<User, "id" | "username" | "avatarUrl">
  seller: Pick<User, "id" | "username" | "avatarUrl">
}

export interface UserPublicProfile {
  id: string
  username: string
  avatarUrl: string | null
  bio: string | null
  isPro: boolean
  isVerified: boolean
  verifiedAt: Date | null
  createdAt: Date
  _count: {
    reviews: number
    listings: number
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface ApiError {
  error: string
  code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "INTERNAL_ERROR" | "BAD_REQUEST"
  details?: Record<string, string[]>
}

export interface FilterParams {
  page?: number
  limit?: number
  gameId?: string
  categoryId?: string
  rarity?: Rarity
  minPrice?: number
  maxPrice?: number
  sort?: "newest" | "price_asc" | "price_desc" | "popular"
  search?: string
}

export type ListingCreateInput = Pick<Listing, 
  "title" | "description" | "price" | "quantity" | "rarity" | "images" | "gameId" | "categoryId" | "deliveryMethod" | "deliveryInstructions" | "tags"
>

export type ListingUpdateInput = Partial<Pick<Listing, 
  "title" | "description" | "price" | "quantity" | "rarity" | "images" | "categoryId" | "deliveryMethod" | "deliveryInstructions" | "tags"
>>

export type OrderStatusUpdate = {
  status: OrderStatus
  notes?: string
}

export type ReviewInput = {
  rating: number
  comment?: string
}