import { HTMLAttributes } from "react"

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular"
  width?: string
  height?: string
}

export function Skeleton({ 
  className = "", 
  variant = "rectangular",
  width,
  height,
  ...props 
}: SkeletonProps) {
  const variants = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-[--radius-sm]",
  }

  return (
    <div
      className={`skeleton ${variants[variant]} ${className}`}
      style={{ width, height }}
      {...props}
    />
  )
}
