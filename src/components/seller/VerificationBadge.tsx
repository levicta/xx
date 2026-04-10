"use client"

interface VerificationBadgeProps {
  level?: "NONE" | "BASIC" | "ADVANCED"
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}

export function VerificationBadge({ level = "BASIC", size = "sm", showLabel = false }: VerificationBadgeProps) {
  if (level === "NONE") return null

  const sizeClasses = {
    sm: "w-4 h-4 text-[10px]",
    md: "w-5 h-5 text-xs",
    lg: "w-6 h-6 text-sm",
  }

  const labelSizeClasses = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={`${sizeClasses[size]} rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center`}
        title={`verified${level !== "BASIC" ? ` (${level.toLowerCase()})` : ""}`}
      >
        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </span>
      {showLabel && (
        <span className={`${labelSizeClasses[size]} text-muted-foreground`}>
          verified
        </span>
      )}
    </span>
  )
}