"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Check, Brain, Menu, X, ArrowRight, Mail, Linkedin, Twitter, Github } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Navbar from "./Navbar"
import Footer from "./Footer"

export default function Pricing() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly")
  
  // Calculate prices based on billing interval
  const getPrice = (basePrice: number) => {
    return billingInterval === "yearly" ? basePrice * 0.8 : basePrice
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">

        <Navbar />

      <div className="relative z-10 container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 py-16 pb-4 text-white">Plans & Pricing</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Choose the perfect plan for your data analysis needs
          </p>
        </motion.div>

        {/* Billing Toggle with modern pill design */}
        <div className="flex justify-center mb-16">
          <div className="p-1.5 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-full border border-gray-400 shadow-xl">
            <RadioGroup
              defaultValue="monthly"
              value={billingInterval}
              onValueChange={(value) => setBillingInterval(value as "monthly" | "yearly")}
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
                  <motion.div 
                    className="flex items-center gap-1 text-[10px] mt-0.5"
                    initial={false}
                    animate={{ 
                      opacity: billingInterval === "yearly" ? 1 : 0.9
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-green-300 tracking-wide">Save 20%</span>
                    <span className="text-white/30 text-[8px]">•</span>
                    <span className="text-purple-300 tracking-wide">2 months free</span>
                  </motion.div>
                </label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Free</h3>
            <p className="text-gray-300 mb-6">
              If you are a student or a hobbyist, you can use the free plan.
            </p>
            <div className="mb-6">
              <div className="text-4xl font-bold text-white">$0</div>
              {/* <div className="text-xl text-gray-300">Pricing</div> */}
            </div>
            <div className="space-y-4">
              <p className="font-medium text-white">For students and hobbyists</p>
              <ul className="space-y-3 text-gray-300">
                {[
                  { feature: "10 Free Visualizations per day", available: true },
                  { feature: "1 Analysis per day", available: true },
                  { feature: "Advanced Features", available: false },
                  { feature: "Customization", available: false },
                  { feature: "Support", available: false },
                  { feature: "Data Export", available: false },
                  { feature: "Only Web View", available: true }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {item.available ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <X className="w-5 h-5 text-red-400" />
                    )}
                    <span>{item.feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative rounded-2xl p-8 backdrop-blur-lg min-h-[750px] -mt-4 group"
          >
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-gradient-x" />
            <div className="absolute inset-[1px] rounded-2xl bg-black/90 backdrop-blur-xl" />
            
            {/* Content container */}
            <div className="relative z-10">
              {/* Most Popular Label */}
              <div className="flex items-center justify-center gap-2 mb-6 text-white/90">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0L9.79611 6.20389L16 8L9.79611 9.79611L8 16L6.20389 9.79611L0 8L6.20389 6.20389L8 0Z" />
                </svg>
                <span className="text-sm font-medium">Most popular</span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">Pro</h3>
              <p className="text-gray-300 mb-6">
                Small Businesses and Startups, Data Analysts and Students
              </p>
              <div className="mb-6">
                <motion.div 
                  className="text-4xl font-bold text-white"
                  initial={false}
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [1, 0.8, 1] 
                  }}
                  transition={{ duration: 0.3 }}
                  key={billingInterval}
                >
                  ${getPrice(10)}
                  <span className="text-lg font-normal text-gray-400">
                    /{billingInterval === "yearly" ? "mo" : "mo"}
                  </span>
                </motion.div>
                <div className="text-gray-300">
                  {billingInterval === "yearly" ? (
                    <span className="text-green-400">$96/year (Save $24)</span>
                  ) : (
                    "Billed monthly"
                  )}
                </div>
              </div>
              <button className="w-full py-3 px-4 rounded-xl bg-white text-black hover:bg-white/90 transition-colors mb-8">
                Start Your 7-Day Free Trial
              </button>
              <div className="space-y-4">
                <p className="font-medium text-white">Everything in Free, plus:</p>
                <ul className="space-y-3 text-gray-300">
                  {[
                    "Unlimited Visualizations",
                    "100 Analyses per day",
                    "Priority Support",
                    "Beta Access",
                    "Data Export",
                    "Customizable Dashboards"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-blue-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Pro +  Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="relative bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Pro +</h3>
            <p className="text-gray-300 mb-6">
              Large Businesses and Enterprises, Data Scientists and Analysts
            </p>
            <div className="mb-6">
              <motion.div 
                className="text-4xl font-bold text-white"
                initial={false}
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [1, 0.8, 1] 
                }}
                transition={{ duration: 0.3 }}
                key={billingInterval}
              >
                ${getPrice(20)}
                <span className="text-lg font-normal text-gray-400">
                  /{billingInterval === "yearly" ? "mo" : "mo"}
                </span>
              </motion.div>
              <div className="text-gray-300">
                {billingInterval === "yearly" ? (
                  <span className="text-green-400">$192/year (Save $48)</span>
                ) : (
                  "Billed monthly"
                )}
              </div>
            </div>
            <button className="w-full py-3 px-4 rounded-xl bg-white text-black border border-white/20 hover:bg-white/90 transition-colors mb-8">
              Start Your 7-Day Free Trial
            </button>
            <div className="space-y-4">
              <p className="font-medium text-white">Everything in Pro, plus:</p>
              <ul className="space-y-3 text-gray-300">
                {[
                  "Unlimited Visualizations",
                  "Unlimited Analyses",
                  "Priority Support",
                  "Beta Access",
                  "Data Export",
                  "Customizable Dashboards",
                  
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-yellow-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Call to Action */}
      <section className="relative z-10 py-24 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to Transform Your Data Analysis?</h2>
            <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto px-4">
              Join thousands of data scientists and analysts who have already discovered the power of AI-driven
              analysis.
            </p>
            <Link href="/signup">
              <button className="px-8 py-4 bg-white text-gray-900 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
                Get Started Now <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

