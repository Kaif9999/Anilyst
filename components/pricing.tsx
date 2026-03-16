"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Navbar from "./Navbar"
import Footer from "./Footer"

// Update checkoutUrl with your Dodo product IDs for $25 and $49 plans
const PLANS = [
  {
    name: "Pro",
    monthlyPrice: 25,
    description: "Perfect for individuals and small projects",
    features: [
      "Unlimited visualizations",
      "Unlimited analyses",
      "Data export",
      "Web & mobile access",
      "Email support",
    ],
    cta: "Get Pro",
    checkoutUrl: "https://checkout.dodopayments.com/buy/YOUR_PRO_PRODUCT_ID?quantity=1&redirect_url=https://anilyst.tech%2Fmain%2F",
    popular: false,
  },
  {
    name: "Premium",
    monthlyPrice: 49,
    description: "For teams and power users",
    features: [
      "Everything in Pro",
      "Priority support",
      "Beta access",
      "Advanced analytics",
      "API access",
      "Dedicated account manager",
    ],
    cta: "Get Premium",
    checkoutUrl: "https://checkout.dodopayments.com/buy/YOUR_PREMIUM_PRODUCT_ID?quantity=1&redirect_url=https://anilyst.tech%2Fmain%2F",
    popular: true,
  },
] as const

export default function Pricing() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly")
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const getMonthlyPrice = (basePrice: number) => {
    return billingInterval === "yearly" ? Math.round(basePrice * 0.6 * 100) / 100 : basePrice
  }

  const getYearlyTotal = (basePrice: number) => {
    return Math.round(basePrice * 12 * 0.6)
  }

  const handleSubscribe = (url: string, planName: string) => {
    setLoadingPlan(planName)
    window.location.href = url
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <Navbar />

      <div className="relative z-10 container mx-auto px-4 pt-28 pb-20 md:pt-36 md:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Simple pricing
          </h1>
          <p className="text-gray-400 max-w-md mx-auto">
            Two plans. No hidden fees. Cancel anytime.
          </p>
        </motion.div>

        {/* Billing Toggle - Sliding pill */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          <div className="p-1.5 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-full border border-white/20 shadow-xl">
            <RadioGroup
              value={billingInterval}
              onValueChange={(v) => setBillingInterval(v as "monthly" | "yearly")}
              className="relative grid grid-cols-2 w-[340px] gap-0.5"
            >
              {/* Sliding Background */}
              <motion.div
                className="absolute inset-1.5 w-[calc(50%-8px)] bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-pink-400/30 rounded-full shadow-lg border border-pink-500/20"
                initial={false}
                animate={{
                  x: billingInterval === "yearly" ? "calc(100% + 3px)" : 0
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
              />

              {/* Monthly Option */}
              <div className="relative">
                <RadioGroupItem value="monthly" id="monthly" className="sr-only" />
                <label
                  htmlFor="monthly"
                  className={`relative flex flex-col items-center justify-center px-4 py-2.5 rounded-full cursor-pointer transition-all duration-200 ${
                    billingInterval === "monthly"
                      ? "text-white"
                      : "text-gray-400 hover:text-white/90"
                  }`}
                >
                  <span className="font-medium text-[13px] tracking-wide">Monthly</span>
                  <span className="text-[10px] mt-0.5 tracking-wide opacity-90">
                    Regular price
                  </span>
                </label>
              </div>

              {/* Yearly Option */}
              <div className="relative">
                <RadioGroupItem value="yearly" id="yearly" className="sr-only" />
                <label
                  htmlFor="yearly"
                  className={`relative flex flex-col items-center justify-center px-4 py-2.5 rounded-full cursor-pointer transition-all duration-200 ${
                    billingInterval === "yearly"
                      ? "text-white"
                      : "text-gray-400 hover:text-white/90"
                  }`}
                >
                  <span className="font-medium text-[13px] tracking-wide">Yearly</span>
                  <span className="text-green-300 text-[10px] mt-0.5 tracking-wide">
                    Save 40%
                  </span>
                </label>
              </div>
            </RadioGroup>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
              className={`relative rounded-2xl p-8 border transition-all ${
                plan.popular
                  ? "bg-white/[0.07] border-violet-500/50 shadow-lg shadow-violet-500/10"
                  : "bg-white/[0.04] border-white/10 hover:border-white/20"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-violet-500/30 text-violet-300 border border-violet-500/30">
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-400">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    ${getMonthlyPrice(plan.monthlyPrice)}
                  </span>
                  <span className="text-gray-500">/mo</span>
                </div>
                {billingInterval === "yearly" && (
                  <p className="text-sm text-gray-400 mt-1">
                    ${getYearlyTotal(plan.monthlyPrice)}/year billed annually
                  </p>
                )}
              </div>

              <button
                onClick={() => handleSubscribe(plan.checkoutUrl, plan.name)}
                disabled={!!loadingPlan}
                className={`w-full py-3.5 rounded-xl font-medium transition-all mb-6 disabled:opacity-50 ${
                  plan.popular
                    ? "bg-violet-500 text-white hover:bg-violet-600"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                {loadingPlan === plan.name ? "Redirecting..." : plan.cta}
              </button>

              <ul className="space-y-3">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-gray-300 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="relative z-10 py-20 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 mb-6">
            Questions? <a href="mailto:kaifmohd5000@gmail.com?subject=Anilyst Pricing" className="text-violet-400 hover:text-violet-300">Contact us</a>
          </p>
          <Link href="/signup">
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/15 transition-colors border border-white/10">
              Create free account <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
