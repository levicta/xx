import Link from "next/link"
import { VerificationBadge } from "@/components/seller/VerificationBadge"

interface ListingCardProps {
  listing: {
    id: string
    title: string
    price: number
    quantity: number
    quantitySold: number
    rarity: string
    images: string[]
    game: { id: string; name: string; slug: string; iconUrl: string }
    category: { id: string; name: string; slug: string }
    seller: { id: string; username: string; avatarUrl: string | null; isPro: boolean; isVerified?: boolean; verificationLevel?: "NONE" | "BASIC" | "ADVANCED" }
    viewCount: number
    isBoosted: boolean
  }
}

export function ListingCard({ listing }: ListingCardProps) {
  const available = listing.quantity - listing.quantitySold

  return (
    <Link
      href={`/item/${listing.id}`}
      className="group block bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:translate-y-[-2px]"
    >
      <div className="relative h-36 bg-muted overflow-hidden">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-3">
        <h3 className="text-sm font-medium text-card-foreground truncate">
          {listing.title}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            ${listing.price.toFixed(2)}
          </span>
          <span className={`text-xs ${available > 0 ? "text-muted-foreground" : "text-destructive"}`}>
            {available > 0 ? `${available} left` : "Sold out"}
          </span>
        </div>
        {listing.seller.isVerified && (
          <div className="mt-2 flex items-center gap-1">
            <VerificationBadge level={listing.seller.verificationLevel} size="sm" />
            <span className="text-xs text-muted-foreground">verified seller</span>
          </div>
        )}
      </div>
    </Link>
  )
}