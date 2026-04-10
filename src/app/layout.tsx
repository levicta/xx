import type { Metadata } from "next"
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/components/SessionProvider"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
})

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "RBLX.MKT - Buy & Sell Roblox Items",
    template: "%s | RobloxMarket",
  },
  description: "The peer-to-peer marketplace for buying and selling Roblox virtual items.",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "RBLX.MKT - Buy & Sell Roblox Items",
    description: "The peer-to-peer marketplace for buying and selling Roblox virtual items.",
    url: "/",
    siteName: "RobloxMarket",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "RBLX.MKT - Buy & Sell Roblox Items",
    description: "The peer-to-peer marketplace for buying and selling Roblox virtual items.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-[family-name:var(--font-dm-sans)]">
        <SessionProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  )
}