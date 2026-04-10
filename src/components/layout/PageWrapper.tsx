import { HTMLAttributes } from "react"

interface PageWrapperProps extends HTMLAttributes<HTMLDivElement> {
  fullWidth?: boolean
}

export function PageWrapper({ 
  className = "", 
  fullWidth = false,
  children, 
  ...props 
}: PageWrapperProps) {
  return (
    <div 
      className={`flex-1 ${fullWidth ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
