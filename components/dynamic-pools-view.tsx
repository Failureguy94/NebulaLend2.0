"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Plus, Activity, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface WalletState {
  isConnected: boolean
  address: string
  balance: string
  chainId: number
  isConnecting: boolean
}

interface DynamicPoolsViewProps {
  walletState: WalletState
}

export function DynamicPoolsView({ walletState }: DynamicPoolsViewProps) {
  const [pools, setPools] = useState([
    { pair: "ETH/USDC", tvl: 892341, volume24h: 125430, apy: 12.4, utilization: 68, yourLiquidity: 0 },
    { pair: "WBTC/DAI", tvl: 654789, volume24h: 89234, apy: 8.7, utilization: 45, yourLiquidity: 1250 },
    { pair: "USDC/DAI", tvl: 543210, volume24h: 67890, apy: 5.2, utilization: 32, yourLiquidity: 0 },
    { pair: "ETH/DAI", tvl: 456789, volume24h: 78901, apy: 9.8, utilization: 58, yourLiquidity: 890 },
  ])

  // Real-time pool updates
  useEffect(() => {
    if (!walletState.isConnected) return

    const interval = setInterval(() => {
      setPools((prev) =>
        prev.map((pool) => ({
          ...pool,
          tvl: pool.tvl + (Math.random() - 0.5) * 2000,
          volume24h: pool.volume24h + (Math.random() - 0.5) * 1000,
          apy: Math.max(0.1, pool.apy + (Math.random() - 0.5) * 0.3),
          utilization: Math.max(0, Math.min(100, pool.utilization + (Math.random() - 0.5) * 3)),
        })),
      )
    }, 4000)

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
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mb-6"
            >
              <Activity className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-gray-400 text-center max-w-md">
              Connect your wallet to view detailed pool information and add liquidity
            </p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold text-white">Live Pools</h2>
          <p className="text-gray-400">Real-time liquidity pool performance</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Pool
          </Button>
        </motion.div>
      </motion.div>

      {/* Pools Grid */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="grid gap-6">
        <AnimatePresence>
          {pools.map((pool, index) => (
            <motion.div
              key={pool.pair}
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              }}
              layout
            >
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm relative overflow-hidden group">
                <motion.div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardContent className="p-6 relative z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Pool Info */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <motion.div
                          className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center relative"
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.8 }}
                        >
                          <span className="text-white font-bold text-lg">
                            {pool.pair.split("/")[0][0]}
                            {pool.pair.split("/")[1][0]}
                          </span>
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-30"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                          />
                        </motion.div>
                        <div>
                          <h3 className="font-bold text-white text-xl">{pool.pair}</h3>
                          <p className="text-sm text-gray-400">AMM Pool</p>
                        </div>
                      </div>
                      {pool.yourLiquidity > 0 && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }}>
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                            Your Position: ${pool.yourLiquidity}
                          </Badge>
                        </motion.div>
                      )}
                    </div>

                    {/* Pool Stats */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400">Total Value Locked</p>
                        <motion.p
                          className="text-2xl font-bold text-white"
                          key={pool.tvl}
                          initial={{ scale: 1.1, color: "#10b981" }}
                          animate={{ scale: 1, color: "#ffffff" }}
                          transition={{ duration: 0.3 }}
                        >
                          ${pool.tvl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </motion.p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">24h Volume</p>
                        <motion.p
                          className="text-lg font-semibold text-white"
                          key={pool.volume24h}
                          initial={{ scale: 1.05 }}
                          animate={{ scale: 1 }}
                        >
                          ${pool.volume24h.toLocaleString()}
                        </motion.p>
                      </div>
                    </div>

                    {/* APY & Utilization */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400 mb-2">APY</p>
                        <motion.div
                          key={pool.apy}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-lg px-3 py-1">
                            {pool.apy.toFixed(1)}%
                          </Badge>
                        </motion.div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-400">Utilization</p>
                          <motion.p
                            className="text-sm text-white"
                            key={pool.utilization}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                          >
                            {pool.utilization.toFixed(0)}%
                          </motion.p>
                        </div>
                        <motion.div
                          key={pool.utilization}
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                          <Progress value={pool.utilization} className="h-2" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-3">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                          <Zap className="w-4 h-4 mr-2" />
                          Add Liquidity
                        </Button>
                      </motion.div>
                      {pool.yourLiquidity > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outline"
                            className="w-full border-slate-600 text-white hover:bg-slate-700 bg-transparent"
                          >
                            Remove
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
