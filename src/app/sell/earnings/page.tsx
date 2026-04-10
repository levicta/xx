"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/20 text-amber-400",
  PROCESSING: "bg-blue-500/20 text-blue-400",
  COMPLETED: "bg-primary/20 text-primary",
  FAILED: "bg-red-500/20 text-red-400",
}

export default function SellerEarningsPage() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [method, setMethod] = useState("paypal")
  const [address, setAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const amountNum = parseFloat(amount)
    if (amountNum < 10) {
      setError("Minimum payout is $10")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/payouts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, address, amount: amountNum }),
      })

      if (res.ok) {
        setShowModal(false)
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || "Failed to request payout")
      }
    } catch (err) {
      setError("Something went wrong")
    }

    setLoading(false)
  }

  return (
    <main>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-foreground lowercase">earnings & payouts</h1>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm font-medium text-primary hover:text-primary/80"
          >
            request payout
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-sm text-muted-foreground">available balance</p>
            <p className="mt-1 text-2xl font-semibold text-primary">$0.00</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-sm text-muted-foreground">lifetime earned</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">$0.00</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-sm text-muted-foreground">commission rate</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">7%</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <h2 className="font-semibold text-foreground mb-4">payout history</h2>
          <div className="flex min-h-[150px] items-center justify-center">
            <p className="text-muted-foreground">no payouts yet</p>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
            <div className="relative bg-card border border-border rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-foreground mb-4">request payout</h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleRequestPayout} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    payout method
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="paypal">paypal</option>
                    <option value="cashapp">cashapp</option>
                    <option value="crypto">crypto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    {method === "paypal" ? "paypal email" : 
                     method === "cashapp" ? "cashapp handle" : "crypto address"}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={method === "paypal" ? "email@example.com" : 
                                  method === "cashapp" ? "$username" : "0x..."}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    amount (min $10)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="10.00"
                    min="10"
                    step="0.01"
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-secondary text-muted-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {loading ? "processing..." : "request payout"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
  )
}