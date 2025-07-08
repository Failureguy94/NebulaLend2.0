"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, DollarSign, Shield, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface WalletState {
  isConnected: boolean
  address: string
  balance: string
  chainId: number
  isConnecting: boolean
}

interface DynamicPortfolioViewProps {
  walletState: WalletState
}

export function DynamicPortfolioView({ walletState }: DynamicPortfolioViewProps) {
  const [portfolioData, setPortfolioData] = useState({
    totalDeposited: 4250.75,
    totalBorrowed: 1850.25,
    netWorth: 2400.5,
    healthFactor: 185.5,
    totalEarnings: 125.3,
  })

  // Simulate real-time updates
  useEffect(() => {
    if (!walletState.isConnected) return

    const interval = setInterval(() => {
      setPortfolioData((prev) => ({
        ...prev,
        netWorth: prev.netWorth + (Math.random() - 0.5) * 10,
        totalEarnings: prev.totalEarnings + Math.random() * 0.1,
        healthFactor: Math.max(110, prev.healthFactor + (Math.random() - 0.5) * 2),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [walletState.isConnected])

  if (!walletState.isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
              className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-6"
            >
              <DollarSign className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-gray-400 text-center max-w-md">
              Connect your wallet to view your portfolio and track your positions
            </p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const portfolioCards = [
    {
      title: "Net Worth",
      value: portfolioData.netWorth,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      change: "+8.2%",
      prefix: "$",
    },
    {
      title: "Total Deposited",
      value: portfolioData.totalDeposited,
      icon: DollarSign,
      color: "from-blue-500 to-cyan-500",
      change: "Earning yield",
      prefix: "$",
    },
    {
      title: "Total Borrowed",
      value: portfolioData.totalBorrowed,
      icon: TrendingDown,
      color: "from-orange-500 to-red-500",
      change: "Active debt",
      prefix: "$",
    },
    {
      title: "Total Earnings",
      value: portfolioData.totalEarnings,
      icon: Sparkles,
      color: "from-purple-500 to-pink-500",
      change: "All time",
      prefix: "$",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {portfolioCards.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{
                scale: 1.05,
                rotateY: 10,
                z: 50,
              }}
            >
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm relative overflow-hidden group">
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                />

                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">{card.title}</CardTitle>
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.8 }}
                    className={`p-2 rounded-lg bg-gradient-to-r ${card.color}`}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </motion.div>
                </CardHeader>

                <CardContent>
                  <motion.div
                    className="text-2xl font-bold text-white"
                    key={card.value}
                    initial={{ scale: 1.1, color: "#10b981" }}
                    animate={{ scale: 1, color: "#ffffff" }}
                    transition={{ duration: 0.3 }}
                  >
                    {card.prefix}
                    {card.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </motion.div>
                  <p className="text-xs text-green-400">{card.change}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Health Factor */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Health Factor</span>
              <motion.div
                key={portfolioData.healthFactor}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  {portfolioData.healthFactor.toFixed(1)}%
                </Badge>
              </motion.div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              key={portfolioData.healthFactor}
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Progress value={Math.min(portfolioData.healthFactor, 200)} className="h-4 mb-4" />
            </motion.div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Liquidation Risk: Low</span>
              <span className="text-gray-400">Threshold: 110%</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
