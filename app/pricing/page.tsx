"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Check, Brain, Menu, X, ArrowRight, Mail, Linkedin, Twitter, Github } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Animated gradient background */}
      {/* <div className="fixed inset-0 mx-4 my-4 md:mx-10 md:my-10 rounded-2xl background-animate opacity-90" /> */}

      {/* Enhanced glowing orbs */}
      {/* <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[20%] w-96 h-96 bg-purple-600/30 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob" />
        <div className="absolute top-[45%] right-[20%] w-[30rem] h-[30rem] bg-pink-500/30 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[15%] left-[35%] w-[28rem] h-[28rem] bg-orange-500/30 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-4000" />
      </div> */}

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-black/90 backdrop-blur-lg z-50 transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:hidden`}
      >
        <div className="p-6">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-6 right-6 p-2 text-white hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex flex-col space-y-8 mt-16">
            <Link href="/" className="text-2xl font-semibold text-white hover:text-purple-400 transition-colors">
              Home
            </Link>
            <Link
              href="#features"
              className="text-2xl font-semibold text-white hover:text-purple-400 transition-colors"
            >
              Features
            </Link>
            <Link href="/pricing" className="text-2xl font-semibold text-white hover:text-purple-400 transition-colors">
              Pricing
            </Link>
            <Link href="#docs" className="text-2xl font-semibold text-white hover:text-purple-400 transition-colors">
              Docs
            </Link>
            <Link href="#blog" className="text-2xl font-semibold text-white hover:text-purple-400 transition-colors">
              Blog
            </Link>
            <div className="pt-8 border-t border-white/10">
              <Link
                href="/login"
                className="block w-full py-3 text-center text-xl text-white hover:bg-white/10 rounded-lg mb-4"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="block w-full py-3 text-center text-xl bg-white text-black hover:bg-white/90 rounded-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="fixed py-8 top-0 md:top-2 left-1/2 -translate-x-1/2 w-[85%] md:w-[85%] max-w-7xl z-40">
        <div className="bg-black backdrop-blur-lg border border-white/20 rounded-2xl">
          <div className="container mx-auto px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Logo Area */}
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Brain className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <span className="text-xl md:text-2xl font-bold text-white">Anilyst</span>
              </Link>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-10">
                <Link href="/" className="text-white/80 hover:text-white transition-colors">
                  Home
                </Link>
                <Link href="#features" className="text-white/80 hover:text-white transition-colors">
                  Features
                </Link>
                <Link href="/pricing" className="text-white/80 hover:text-white transition-colors">
                  Pricing
                </Link>
                <Link href="#docs" className="text-white/80 hover:text-white transition-colors">
                  Docs
                </Link>
                <Link href="#blog" className="text-white/80 hover:text-white transition-colors">
                  Blog
                </Link>
              </div>

              {/* CTA Buttons */}
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/login" className="px-5 py-2.5 text-white/80 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 bg-white text-gray-900 rounded-xl hover:bg-white/90 transition-colors"
                >
                  Get Started
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Menu className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </nav>

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

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <RadioGroup
            defaultValue="monthly"
            value={billingInterval}
            onValueChange={(value) => setBillingInterval(value as "monthly" | "yearly")}
            className="grid grid-cols-2 bg-white/5 backdrop-blur-lg rounded-full p-1 border border-white/20 w-fit gap-1"
          >
            <div className="relative">
              <RadioGroupItem value="monthly" id="monthly" className="sr-only" />
              <label
                htmlFor="monthly"
                className={`block px-6 py-2 text-sm rounded-full cursor-pointer transition-colors ${
                  billingInterval === "monthly" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                Monthly billing
                <span className="block text-xs text-gray-400">No contracts, cancel anytime</span>
              </label>
            </div>
            <div className="relative">
              <RadioGroupItem value="yearly" id="yearly" className="sr-only" />
              <label
                htmlFor="yearly"
                className={`block px-6 py-2 text-sm rounded-full cursor-pointer transition-colors ${
                  billingInterval === "yearly" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                Yearly billing
                <span className="block text-xs md: text-blue-400">Save 20%,Save more Do more</span>
              </label>
            </div>
          </RadioGroup>
        </div>

        {/* Most Popular Label */}
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 text-white/80"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0L9.79611 6.20389L16 8L9.79611 9.79611L8 16L6.20389 9.79611L0 8L6.20389 6.20389L8 0Z" />
            </svg>
            <span className="text-sm font-medium">Most popular</span>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Business Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Business</h3>
            <p className="text-gray-300 mb-6">
              Departments and organizations who need a secure, scalable, and customizable AI platform
            </p>
            <div className="mb-6">
              <div className="text-2xl font-bold text-white">Custom</div>
              <div className="text-xl text-gray-300">Pricing</div>
            </div>
            <button className="w-full py-3 px-4 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors mb-8">
              Contact Sales
            </button>
            <div className="space-y-4">
              <p className="font-medium text-white">Everything in Teams, plus:</p>
              <ul className="space-y-3 text-gray-300">
                {[
                  "Unlimited features",
                  "Custom templates and workflows",
                  "Dedicated success manager",
                  "API access*",
                  "Advanced admin analytics",
                  "SSO plus additional security review",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-purple-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Teams Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            // className="fixed inset-0 mx-4 my-4 md:mx-10 md:my-10 rounded-2xl background-animate opacity-90"
            className="relative rounded-2xl p-8 border border-white/20 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-pink-600/20 backdrop-blur-lg"
          >
            <div className="absolute inset-0 rounded-2xl opacity-80 bg-gradient-to-br from-purple-700 via-red-500 to-green-500 -z-10"></div>
            <h3 className="text-2xl font-bold text-white mb-4">Teams</h3>
            <p className="text-gray-300 mb-6">
              Small marketing teams who need to generate, create, and repurpose content
            </p>
            <div className="mb-6">
              <div className="text-4xl font-bold text-white">$99</div>
              <div className="text-gray-300">/mo billed {billingInterval}</div>
            </div>
            <button className="w-full py-3 px-4 rounded-xl bg-white text-black hover:bg-white/90 transition-colors mb-8">
              Start Your 7-Day Free Trial
            </button>
            <div className="space-y-4">
              <p className="font-medium text-white">Everything in Creator, plus:</p>
              <ul className="space-y-3 text-gray-300">
                {[
                  "Unlimited* words generated by AI",
                  "Includes 3 seats",
                  "Access SEO mode",
                  "3 Brand voices",
                  "150 Knowledge assets",
                  "15 Campaigns",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-blue-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Creator Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="relative bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Creator</h3>
            <p className="text-gray-300 mb-6">
              Freelancers, Marketers, and entrepreneurs who are ready to apply Generative AI
            </p>
            <div className="mb-6">
              <div className="text-4xl font-bold text-white">$39</div>
              <div className="text-gray-300">/mo billed {billingInterval}</div>
            </div>
            <button className="w-full py-3 px-4 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors mb-8">
              Start Your 7-Day Free Trial
            </button>
            <div className="space-y-4">
              <p className="font-medium text-white">Everything in Free, plus:</p>
              <ul className="space-y-3 text-gray-300">
                {[
                  "Unlimited* words generated by AI",
                  "Includes 1 seat",
                  "50+ Templates",
                  "1 Brand voice",
                  "50 Knowledge assets",
                  "Browser extension",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-pink-400" />
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

      {/* Footer */}
      <footer className="relative z-10 bg-black border-t border-white/10">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Anilyst</h3>
              <p className="text-gray-400">Advanced AI-powered data analysis platform for modern businesses.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-gray-400 hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#docs" className="text-gray-400 hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#blog" className="text-gray-400 hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Connect</h4>
              <div className="flex space-x-4">
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Github className="w-5 h-5" />
                  </Link>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Twitter className="w-5 h-5" />
                  </Link>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </Link>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Mail className="w-5 h-5" />
                  </Link>
                </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8">
            <p className="text-center text-gray-400 text-sm">
              © {new Date().getFullYear()} Anilyst. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

