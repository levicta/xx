"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, ShoppingCart, DollarSign } from "lucide-react"

const sidebarItems = [
  { label: "overview", href: "/sell", icon: Home },
  { label: "my listings", href: "/sell/listings", icon: Package },
  { label: "orders", href: "/sell/orders", icon: ShoppingCart },
  { label: "earnings", href: "/sell/earnings", icon: DollarSign },
]

export function SellerSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 border-r border-border/50 bg-background hidden lg:block">
      <nav className="flex flex-col gap-1 py-4">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/sell" && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors lowercase ${
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-foreground" />
              )}
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
