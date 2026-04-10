"use client"

import { useState } from "react"
import Link from "next/link"

interface OnboardingWizardProps {
  initialStep?: number
}

const steps = [
  { id: 1, title: "welcome", description: "Start selling on rblx.mkt" },
  { id: 2, title: "profile", description: "Set up your seller profile" },
  { id: 3, title: "verification", description: "Verify your identity" },
  { id: 4, title: "payouts", description: "Connect your payout method" },
  { id: 5, title: "complete", description: "You're all set!" },
]

export function OnboardingWizard({ initialStep = 1 }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    agreedToTerms: false,
    payoutMethod: "",
    payoutAddress: "",
  })

  const handleNext = async () => {
    setLoading(true)
    
    if (currentStep === 2) {
      await fetch("/api/seller/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: formData.bio || null,
        }),
      })
    }

    if (currentStep === 4) {
      await fetch("/api/seller/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: currentStep + 1,
          payoutMethod: formData.payoutMethod,
          payoutAddress: formData.payoutAddress,
        }),
      })
      
      try {
        const res = await fetch("/api/seller/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "complete" }),
        })
        if (res.ok) {
          setCurrentStep(5)
        }
      } catch (error) {
        console.error("Failed to complete onboarding:", error)
      }
      setLoading(false)
      return
    }

    await fetch("/api/seller/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: currentStep + 1 }),
    })
    setCurrentStep(currentStep + 1)
    setLoading(false)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-5xl">🏪</span>
              </div>
              <h2 className="text-xl font-semibold text-foreground">start selling your roblox items today</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-secondary rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-foreground">93%</p>
                <p className="text-xs text-muted-foreground">kept per sale</p>
              </div>
              <div className="bg-secondary rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-foreground">60s</p>
                <p className="text-xs text-muted-foreground">to list</p>
              </div>
              <div className="bg-secondary rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-foreground">🔒</p>
                <p className="text-xs text-muted-foreground">stripe secured</p>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">join thousands of sellers on rblx.mkt</p>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">set up your profile</h2>
              <p className="text-sm text-muted-foreground mt-1">tell buyers about yourself</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="your-username"
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  bio (optional)
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="describe what you sell..."
                  rows={3}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">verify your account</h2>
              <p className="text-sm text-muted-foreground mt-1">help build trust with buyers</p>
            </div>
            <div className="space-y-4">
              <label className="flex items-start gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                <input
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-border bg-secondary text-primary focus:ring-primary"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">agree to terms of service</p>
                  <p className="text-xs text-muted-foreground">by checking this box, you agree to our terms and conditions</p>
                </div>
              </label>
              <p className="text-xs text-muted-foreground">
                linking your discord account helps verify your identity and enables buyer support if needed.
              </p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">connect payouts</h2>
              <p className="text-sm text-muted-foreground mt-1">get paid for your sales</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  payout method
                </label>
                <select
                  value={formData.payoutMethod}
                  onChange={(e) => setFormData({ ...formData, payoutMethod: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">select method...</option>
                  <option value="PAYPAL">paypal</option>
                  <option value="CASHAPP">cashapp</option>
                </select>
              </div>
              {formData.payoutMethod && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    {formData.payoutMethod === "PAYPAL" ? "paypal email" : "cashapp handle"}
                  </label>
                  <input
                    type="text"
                    value={formData.payoutAddress}
                    onChange={(e) => setFormData({ ...formData, payoutAddress: e.target.value })}
                    placeholder={formData.payoutMethod === "PAYPAL" ? "email@example.com" : "$username"}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              )}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground">you&apos;re all set!</h2>
              <p className="text-muted-foreground mt-2">start selling on rblx.mkt</p>
            </div>
            <Link
              href="/sell"
              className="inline-block w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              go to dashboard
            </Link>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 text-sm mb-6">
        {[{id:1, title:"welcome"}, {id:3, title:"verification"}, {id:4, title:"terms"}].map((step, index) => (
          <span key={step.id} className="flex items-center">
            <span className={currentStep >= step.id ? "text-foreground font-medium" : "text-muted-foreground"}>
              {step.title}
            </span>
            {index < 2 && <span className="mx-2 text-border/50">→</span>}
          </span>
        ))}
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-8">
        {renderStep()}
      </div>

      {currentStep < 5 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleNext}
            disabled={loading || (currentStep === 3 && !formData.agreedToTerms) || (currentStep === 4 && !formData.payoutMethod)}
            className="w-full max-w-[320px] py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "..." : currentStep === 4 ? "complete" : "continue"}
          </button>
        </div>
      )}
    </div>
  )
}
