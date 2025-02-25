"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Star, Check } from "lucide-react"
import StarryBackground from "./starry-background"

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Anilyst",
  "description": "AI-powered data analysis platform",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/PreOrder"
  }
}

export default function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist')
      }

      setSubmitted(true)
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="relative min-h-screen bg-black overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Starry Background */}
      <StarryBackground />
      
      {/* Animated gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[20%] w-64 md:w-96 h-64 md:h-96 bg-purple-600/30 rounded-full mix-blend-overlay filter blur-3xl opacity-50 animate-blob" />
        <div className="absolute top-[45%] right-[20%] w-72 md:w-[30rem] h-72 md:h-[30rem] bg-pink-500/30 rounded-full mix-blend-overlay filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[15%] left-[35%] w-64 md:w-[28rem] h-64 md:h-[28rem] bg-blue-500/30 rounded-full mix-blend-overlay filter blur-3xl opacity-50 animate-blob animation-delay-4000" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-screen flex items-center justify-center">
        <article className="w-full max-w-3xl backdrop-blur-xl bg-black/30 p-6 md:p-8 rounded-3xl border border-white/10">
          <motion.div 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/20 mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Star className="w-3 h-3 text-yellow-400 animate-pulse" />
            <span className="text-xs md:text-sm bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-medium">
              Limited Time Offer
            </span>
          </motion.div>

          <header>
            <h1 
              className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Experience the Future of Data Analysis
            </h1>
            
            <meta name="description" content="Join our exclusive waitlist for early access to AI-powered data analysis tools" />
          </header>
          
          <motion.p 
            className="text-base md:text-lg text-gray-300/90 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Join our exclusive waitlist today and unlock premium features that will transform your data analysis journey.
          </motion.p>

          {!submitted ? (
            <motion.form 
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all hover:bg-white/10 focus:bg-white/10"
              />
              <motion.button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 group whitespace-nowrap"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Join Waitlist
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 text-green-400 bg-green-500/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-green-500/20 mb-8"
            >
              <Check className="w-5 h-5" />
              <span>You're on the list! We'll notify you when we launch.</span>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 text-red-400 bg-red-500/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-red-500/20 mb-8"
            >
              <span>{error}</span>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center"
          >
            {[
              {
                title: "Early Access",
                description: "Be among the first to try",
                icon: "🚀",
                gradient: "from-blue-500/20 to-purple-500/20"
              },
              {
                title: "Special Pricing",
                description: <span>Get <span className="text-green-400 font-semibold animate-pulse">20% OFF</span> at launch</span>,
                icon: "💎",
                gradient: "from-purple-500/20 to-pink-500/20"
              },
              {
                title: "Priority Support",
                description: "Direct access to our team",
                icon: "⭐",
                gradient: "from-pink-500/20 to-orange-500/20"
              }
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                whileHover={{ scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } }}
                className={`p-4 rounded-2xl bg-gradient-to-b ${benefit.gradient} border border-white/10 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300 hover:shadow-[0_0_30px_-12px_rgba(255,255,255,0.2)]`}
              >
                <motion.div 
                  className="text-2xl mb-2"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {benefit.icon}
                </motion.div>
                <h3 className="text-base font-semibold text-white mb-1">{benefit.title}</h3>
                <p className="text-sm text-gray-400">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </article>
      </div>
    </main>
  )
} 