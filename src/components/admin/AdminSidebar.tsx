"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Package, AlertTriangle, DollarSign, Gamepad2 } from "lucide-react"

const navItems = [
  { href: "/admin", label: "dashboard", icon: Home },
  { href: "/admin/users", label: "users", icon: Users },
  { href: "/admin/listings", label: "listings", icon: Package },
  { href: "/admin/reports", label: "reports", icon: AlertTriangle },
  { href: "/admin/payouts", label: "payouts", icon: DollarSign },
  { href: "/admin/games", label: "games", icon: Gamepad2 },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 border-r border-border/50 bg-background hidden lg:block">
      <nav className="flex flex-col gap-1 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/admin" && pathname.startsWith(item.href))
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