import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role?: "BUYER" | "SELLER" | "ADMIN"
      sellerOnboardingComplete?: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role?: "BUYER" | "SELLER" | "ADMIN"
    sellerOnboardingComplete?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: "BUYER" | "SELLER" | "ADMIN"
    sellerOnboardingComplete?: boolean
  }
}