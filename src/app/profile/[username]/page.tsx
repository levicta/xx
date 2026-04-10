import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/Badge"
import { ListingCard } from "@/components/listing/ListingCard"
import { VerificationBadge } from "@/components/seller/VerificationBadge"
import { Star, Shield, Clock, MessageCircle, ThumbsUp } from "lucide-react"

interface PageProps {
  params: Promise<{ username: string }>
}

async function getUser(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      bio: true,
      isPro: true,
      isVerified: true,
      verificationLevel: true,
      createdAt: true,
      _count: {
        select: {
          listings: true,
          sales: true,
          receivedReviews: true,
        },
      },
    },
  })
}

async function getUserListings(userId: string) {
  return prisma.listing.findMany({
    where: { sellerId: userId, status: "ACTIVE" },
    include: {
      game: { select: { id: true, name: true, slug: true, iconUrl: true } },
      category: { select: { id: true, name: true, slug: true } },
      seller: { select: { id: true, username: true, avatarUrl: true, isPro: true, isVerified: true, verificationLevel: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

async function getUserReviews(userId: string) {
  return prisma.review.findMany({
    where: { sellerId: userId },
    include: {
      reviewer: { select: { username: true, avatarUrl: true } },
      order: {
        include: {
          listing: { select: { title: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  })
}

async function getAverageRating(userId: string) {
  const result = await prisma.review.aggregate({
    where: { sellerId: userId },
    _avg: { rating: true },
  })
  return result._avg.rating || 0
}

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= fullStars
              ? "fill-primary text-primary"
              : star === fullStars + 1 && hasHalf
              ? "fill-primary/50 text-primary/50"
              : "fill-muted text-muted"
          }`}
        />
      ))}
      <span className="text-sm text-foreground ml-1">
        {rating.toFixed(1)}
      </span>
    </div>
  )
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params

  const user = await getUser(username)
  if (!user) notFound()

  const [listings, reviews, avgRating] = await Promise.all([
    getUserListings(user.id),
    getUserReviews(user.id),
    getAverageRating(user.id),
  ])

  const positiveReviews = reviews.filter((r) => r.rating >= 4).length
  const positivePercent = reviews.length > 0 
    ? Math.round((positiveReviews / reviews.length) * 100) 
    : 100

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile Card */}
            <div className="rounded-2xl bg-card border border-border/50 p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-4xl font-semibold text-primary-foreground">
                    {user.username[0].toUpperCase()}
                  </div>
                  {user.isPro && (
                    <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-card border-2 border-card">
                      <Shield className="h-4 w-4 text-primary fill-primary" />
                    </div>
                  )}
                </div>
                
                <h1 className="text-xl font-semibold text-foreground mb-1 flex items-center gap-2">
                  {user.username}
                  {user.isVerified && <VerificationBadge level={user.verificationLevel} size="md" />}
                </h1>
                
                <div className="flex items-center gap-1.5 mb-3">
                  <StarRating rating={avgRating} />
                  <span className="text-sm text-muted-foreground">
                    ({reviews.length})
                  </span>
                </div>

                {user.bio && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {user.bio}
                  </p>
                )}

                <button className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 font-medium hover:opacity-90 transition-opacity">
                  contact seller
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="rounded-2xl bg-card border border-border/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  response time
                </div>
                <span className="text-sm font-medium text-foreground">&lt; 1 hour</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ThumbsUp className="h-4 w-4" />
                  positive feedback
                </div>
                <span className="text-sm font-medium text-foreground">{positivePercent}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  total sales
                </div>
                <span className="text-sm font-medium text-foreground">{user._count.sales}</span>
              </div>
            </div>

            {/* Member Info */}
            <div className="text-center text-sm text-muted-foreground">
              <p>member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
            </div>
          </div>

          {/* Right Column - Listings & Reviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Listings */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  active listings
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({listings.length})
                  </span>
                </h2>
              </div>
              
              {listings.length === 0 ? (
                <div className="rounded-2xl bg-card border border-border/50 p-8 text-center">
                  <p className="text-muted-foreground">no active listings</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}
            </section>

            {/* Reviews */}
            {reviews.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    reviews
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({reviews.length})
                    </span>
                  </h2>
                </div>
                
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-2xl bg-card border border-border/50 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground shrink-0">
                          {review.reviewer.username[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{review.reviewer.username}</span>
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.rating
                                        ? "fill-primary text-primary"
                                        : "fill-muted text-muted"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-foreground mb-2">{review.comment}</p>
                          )}
                          <span className="text-xs text-muted-foreground">
                            for: {review.order.listing.title}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}