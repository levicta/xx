"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"

interface OrderActionsProps {
  orderId: string
  status: string
  isBuyer: boolean
  isSeller: boolean
}

export function OrderActions({ orderId, status, isBuyer, isSeller }: OrderActionsProps) {
  const router = useRouter()
  const isLocked = status === "COMPLETED" || status === "REFUNDED"

  const handleAction = async (action: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Action failed")
      }
    } catch (error) {
      console.error("Action failed:", error)
    }
  }

  if (isLocked) return null

  return (
    <div className="flex flex-wrap gap-3">
      {isSeller && status === "PAID" && (
        <Button onClick={() => handleAction("mark_delivered")}>
          Mark as Delivered
        </Button>
      )}
      {isBuyer && status === "DELIVERING" && (
        <Button onClick={() => handleAction("confirm_receipt")}>
          Confirm Receipt
        </Button>
      )}
      {(isBuyer || isSeller) && (
        <Button variant="danger" onClick={() => handleAction("open_dispute")}>
          Open Dispute
        </Button>
      )}
    </div>
  )
}
