"use client"

import { motion } from "framer-motion"
import { Sparkles, Zap, TrendingUp, DollarSign, Activity } from "lucide-react"

export function FloatingElements() {
  const icons = [Sparkles, Zap, TrendingUp, DollarSign, Activity]

  return (
    <div className="fixed inset-0 pointer-events-none -z-5">
      {[...Array(12)].map((_, i) => {
        const Icon = icons[i % icons.length]
        return (
          <motion.div
            key={i}
            className="absolute text-white/10"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              rotate: 360,
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
              delay: i * 2,
            }}
          >
            <Icon size={24 + Math.random() * 24} />
          </motion.div>
        )
      })}
    </div>
  )
}
