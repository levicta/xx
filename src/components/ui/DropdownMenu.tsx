"use client"

import * as React from "react"
import { createContext, useContext, useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = createContext<DropdownMenuContextType>({ open: false, setOpen: () => {} })

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

export function DropdownMenuTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const { setOpen } = useContext(DropdownMenuContext)
  const [localOpen, setLocalOpen] = useState(false)

  const handleClick = () => {
    setLocalOpen(!localOpen)
    setOpen(!localOpen)
  }

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>
    const childOnClick = child.props.onClick
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        if (childOnClick) childOnClick(e)
        handleClick()
      },
    })
  }
  return <button onClick={handleClick}>{children}</button>
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  align?: "start" | "center" | "end"
  className?: string
}

export function DropdownMenuContent({ children, align = "end", className }: DropdownMenuContentProps) {
  const { open, setOpen } = useContext(DropdownMenuContext)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        document.removeEventListener("keydown", handleEscape)
      }
    }
  }, [open, setOpen])

  if (!open) return null

  const alignClass = align === "end" ? "right-0" : align === "start" ? "left-0" : "left-1/2 -translate-x-1/2"
  
  return (
    <div 
      ref={ref}
      className={cn(
        "absolute top-full mt-2 z-50 w-56 bg-card border border-border rounded-xl shadow-lg animate-in fade-in-0 zoom-in-95", 
        alignClass, 
        className
      )}
    >
      {children}
    </div>
  )
}

export function DropdownMenuItem({ children, className, asChild, onClick }: { children: React.ReactNode; className?: string; asChild?: boolean; onClick?: () => void }) {
  const { setOpen } = useContext(DropdownMenuContext)
  
  const handleClick = () => {
    onClick?.()
    setOpen(false)
  }

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>
    const childOnClick = child.props.onClick
    const childClass = child.props.className || ""
    return (
      <div className={cn("px-2 py-1.5 rounded-md hover:bg-secondary cursor-pointer", className)}>
        {React.cloneElement(child, {
          className: cn("flex items-center gap-2 w-full", childClass),
          onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
            if (childOnClick) childOnClick(e)
            handleClick()
          },
        })}
      </div>
    )
  }
  return (
    <button
      onClick={handleClick}
      className={cn("flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-secondary transition-colors cursor-pointer", className)}
    >
      {children}
    </button>
  )
}

export function DropdownMenuLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-3 py-2 text-sm font-normal", className)}>
      {children}
    </div>
  )
}

export function DropdownMenuSeparator() {
  return <div className="-mx-1 my-1 h-px bg-border" />
}