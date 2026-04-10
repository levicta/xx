"use client"

interface Step {
  key: string
  label: string
}

const STEPS: Step[] = [
  { key: "PAID", label: "Paid" },
  { key: "DELIVERING", label: "Delivering" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "COMPLETED", label: "Complete" },
]

interface OrderStatusStepperProps {
  status: string
}

export function OrderStatusStepper({ status }: OrderStatusStepperProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === status)
  const isDisputed = status === "DISPUTED"
  const isRefunded = status === "REFUNDED"

  if (isDisputed) {
    return (
      <div className="bg-destructive/10 border border-destructive rounded-[16px] p-4 text-center">
        <span className="text-destructive font-semibold">⚠️ Order Under Dispute</span>
      </div>
    )
  }

  if (isRefunded) {
    return (
      <div className="bg-muted/10 border border-muted rounded-[16px] p-4 text-center">
        <span className="text-muted-foreground font-semibold">Order Refunded</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between">
      {STEPS.map((step, index) => {
        const isCompleted = index <= currentIndex
        const isCurrent = index === currentIndex

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-muted-foreground"
                }`}
              >
                {isCompleted ? "✓" : index + 1}
              </div>
              <span
                className={`text-xs mt-2 ${
                  isCurrent ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`w-full h-0.5 mx-2 ${
                  index < currentIndex ? "bg-primary" : "bg-border"
                }`}
                style={{ minWidth: "40px" }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
