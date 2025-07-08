"use client"

import { motion, useMotionValue, useSpring } from "framer-motion"
import { useState, useEffect } from "react"
import { TrendingUp, DollarSign, Activity, PieChart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DynamicStatsCards() {
  const [stats, setStats] = useState({
    tvl: 2847392,
    totalBorrowed: 1234567,
    availableLiquidity: 1612825,
    activePools: 8,
  })

  // Animate numbers
  const tvlValue = useMotionValue(0)
  const borrowedValue = useMotionValue(0)
  const liquidityValue = useMotionValue(0)
  const poolsValue = useMotionValue(0)

  const animatedTvl = useSpring(tvlValue, { stiffness: 100, damping: 30 })
  const animatedBorrowed = useSpring(borrowedValue, { stiffness: 100, damping: 30 })
  const animatedLiquidity = useSpring(liquidityValue, { stiffness: 100, damping: 30 })
  const animatedPools = useSpring(poolsValue, { stiffness: 100, damping: 30 })

  useEffect(() => {
    tvlValue.set(stats.tvl)
    borrowedValue.set(stats.totalBorrowed)
    liquidityValue.set(stats.availableLiquidity)
    poolsValue.set(stats.activePools)
  }, [stats])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        tvl: prev.tvl + Math.random() * 1000 - 500,
        totalBorrowed: prev.totalBorrowed + Math.random() * 500 - 250,
        availableLiquidity: prev.availableLiquidity + Math.random() * 800 - 400,
        activePools: prev.activePools + (Math.random() > 0.9 ? 1 : 0),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: "easeOut",
      },
    }),
  }

  const cards = [
    {
      title: "Total Value Locked",
      value: animatedTvl,
      icon: DollarSign,
      color: "from-purple-500 to-pink-500",
      change: "+12.5%",
      prefix: "$",
    },
    {
      title: "Total Borrowed",
      value: animatedBorrowed,
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-500",
      change: "+8.2%",
      prefix: "$",
    },
    {
      title: "Available Liquidity",
      value: animatedLiquidity,
      icon: Activity,
      color: "from-green-500 to-emerald-500",
      change: "Ready",
      prefix: "$",
    },
    {
      title: "Active Pools",
      value: animatedPools,
      icon: PieChart,
      color: "from-orange-500 to-red-500",
      change: "Mainnet",
      prefix: "",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <motion.div
            key={index}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{
              scale: 1.05,
              rotateY: 5,
              z: 50,
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm relative overflow-hidden group">
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                initial={false}
              />

              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">{card.title}</CardTitle>
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                  className={`p-2 rounded-lg bg-gradient-to-r ${card.color}`}
                >
                  <Icon className="h-4 w-4 text-white" />
                </motion.div>
              </CardHeader>

              <CardContent>
                <motion.div className="text-2xl font-bold text-white">
                  {card.prefix}
                  <motion.span>
                    {card.value.get().toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </motion.span>
                </motion.div>

                <motion.p
                  className="text-xs text-green-400"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  {card.change}
                </motion.p>
              </CardContent>

              {/* Animated border */}
              <motion.div
                className="absolute inset-0 rounded-lg"
                style={{
                  background: `linear-gradient(45deg, transparent, ${card.color.includes("purple") ? "#a855f7" : card.color.includes("blue") ? "#3b82f6" : card.color.includes("green") ? "#10b981" : "#f97316"}, transparent)`,
                  padding: "1px",
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "exclude",
                }}
                animate={{
                  background: [
                    `linear-gradient(0deg, transparent, ${card.color.includes("purple") ? "#a855f7" : card.color.includes("blue") ? "#3b82f6" : card.color.includes("green") ? "#10b981" : "#f97316"}, transparent)`,
                    `linear-gradient(90deg, transparent, ${card.color.includes("purple") ? "#a855f7" : card.color.includes("blue") ? "#3b82f6" : card.color.includes("green") ? "#10b981" : "#f97316"}, transparent)`,
                    `linear-gradient(180deg, transparent, ${card.color.includes("purple") ? "#a855f7" : card.color.includes("blue") ? "#3b82f6" : card.color.includes("green") ? "#10b981" : "#f97316"}, transparent)`,
                    `linear-gradient(270deg, transparent, ${card.color.includes("purple") ? "#a855f7" : card.color.includes("blue") ? "#3b82f6" : card.color.includes("green") ? "#10b981" : "#f97316"}, transparent)`,
                  ],
                }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
