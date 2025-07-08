"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp } from "lucide-react"
import { DynamicDashboard } from "@/components/dynamic-dashboard"
import { AnimatedBackground } from "@/components/animated-background"
import { FloatingElements } from "@/components/floating-elements"
import { DynamicNavigation } from "@/components/dynamic-navigation"
import { DynamicWalletConnect } from "@/components/dynamic-wallet-connect"

export default function NebulaLend() {
  const [mounted, setMounted] = useState(false)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [walletState, setWalletState] = useState({
    isConnected: false,
    address: "",
    balance: "0",
    chainId: 1,
    isConnecting: false,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-white text-2xl font-bold"
        >
          Loading NebulaLend...
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      <FloatingElements />

      <div className="relative z-10">
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center justify-between p-6 backdrop-blur-md bg-black/20 border-b border-white/10"
        >
          <motion.div className="flex items-center space-x-3" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <motion.div
              className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center relative"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(168, 85, 247, 0.4)",
                  "0 0 40px rgba(236, 72, 153, 0.6)",
                  "0 0 20px rgba(168, 85, 247, 0.4)",
                ],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <TrendingUp className="w-7 h-7 text-white" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                style={{ opacity: 0.3 }}
              />
            </motion.div>
            <div>
              <motion.h1
                className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              >
                NebulaLend
              </motion.h1>
              <p className="text-sm text-gray-300">Decentralized Asset Lending</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <DynamicWalletConnect walletState={walletState} setWalletState={setWalletState} />
          </motion.div>
        </motion.header>

        <DynamicNavigation activeSection={activeSection} setActiveSection={setActiveSection} />

        <AnimatePresence mode="wait">
          <motion.main
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8"
          >
            <DynamicDashboard activeSection={activeSection} walletState={walletState} />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  )
}
