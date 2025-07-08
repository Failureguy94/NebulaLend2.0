"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { TrendingUp, Zap } from "lucide-react"

export function AnimatedPoolsList() {
  const [pools, setPools] = useState([
    { pair: "ETH/USDC", tvl: 892341, apy: 12.4, utilization: 68, volume24h: 125430 },
    { pair: "WBTC/DAI", tvl: 654789, apy: 8.7, utilization: 45, volume24h: 89234 },
    { pair: "USDC/DAI", tvl: 543210, apy: 5.2, utilization: 32, volume24h: 67890 },
    { pair: "ETH/DAI", tvl: 456789, apy: 9.8, utilization: 58, volume24h: 78901 },
  ])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPools((prev) =>
        prev.map((pool) => ({
          ...pool,
          tvl: pool.tvl + (Math.random() - 0.5) * 1000,
          apy: Math.max(0.1, pool.apy + (Math.random() - 0.5) * 0.5),
          utilization: Math.max(0, Math.min(100, pool.utilization + (Math.random() - 0.5) * 5)),
          volume24h: pool.volume24h + (Math.random() - 0.5) * 2000,
        })),
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -50, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <CardTitle className="text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Live Pools Performance</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
              className="w-2 h-2 bg-green-400 rounded-full"
            />
          </CardTitle>
          <CardDescription className="text-gray-400">Real-time pool metrics and performance data</CardDescription>
        </motion.div>
      </CardHeader>

      <CardContent>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          <AnimatePresence>
            {pools.map((pool, index) => (
              <motion.div
                key={pool.pair}
                variants={itemVariants}
                layout
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "rgba(100, 116, 139, 0.1)",
                  transition: { duration: 0.2 },
                }}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30 cursor-pointer group"
              >
                <div className="flex items-center space-x-4">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center relative"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.8 }}
                  >
                    <span className="text-white font-semibold">
                      {pool.pair.split("/")[0][0]}
                      {pool.pair.split("/")[1][0]}
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-20"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    />
                  </motion.div>

                  <div>
                    <motion.p className="font-semibold text-white text-lg" layoutId={`title-${pool.pair}`}>
                      {pool.pair}
                    </motion.p>
                    <motion.p
                      className="text-sm text-gray-400"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    >
                      TVL: ${pool.tvl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </motion.p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <motion.div
                      key={pool.apy}
                      initial={{ scale: 1.2, color: "#10b981" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                      transition={{ duration: 0.3 }}
                    >
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 mb-2">
                        {pool.apy.toFixed(1)}% APY
                      </Badge>
                    </motion.div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">Utilization:</span>
                      <div className="w-16">
                        <Progress value={pool.utilization} className="h-2" />
                      </div>
                      <motion.span
                        className="text-xs text-gray-300 min-w-[3rem]"
                        key={pool.utilization}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                      >
                        {pool.utilization.toFixed(0)}%
                      </motion.span>
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Trade
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </CardContent>
    </Card>
  )
}
