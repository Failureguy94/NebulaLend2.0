"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, TrendingUp, Shield, Zap, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChainlinkPriceFeed, ChainlinkNetworkStatus } from "./chainlink-price-feed"

interface OracleData {
  symbol: string
  feedAddress: string
  price: number
  confidence: number
  lastUpdate: number
  heartbeat: number
  deviation: number
  status: "active" | "stale" | "error"
}

export function ChainlinkOracleDashboard() {
  const [oracles, setOracles] = useState<OracleData[]>([
    {
      symbol: "ETH",
      feedAddress: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      price: 2450.32,
      confidence: 99.8,
      lastUpdate: Date.now() - 30000,
      heartbeat: 3600,
      deviation: 0.5,
      status: "active",
    },
    {
      symbol: "BTC",
      feedAddress: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
      price: 45123.45,
      confidence: 99.9,
      lastUpdate: Date.now() - 45000,
      heartbeat: 3600,
      deviation: 0.3,
      status: "active",
    },
    {
      symbol: "USDC",
      feedAddress: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
      price: 1.0001,
      confidence: 99.95,
      lastUpdate: Date.now() - 60000,
      heartbeat: 86400,
      deviation: 0.1,
      status: "active",
    },
    {
      symbol: "DAI",
      feedAddress: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
      price: 0.9998,
      confidence: 99.7,
      lastUpdate: Date.now() - 120000,
      heartbeat: 86400,
      deviation: 0.2,
      status: "stale",
    },
  ])

  const [networkStats, setNetworkStats] = useState({
    totalFeeds: 4,
    activeFeeds: 3,
    avgConfidence: 99.6,
    totalUpdates: 1247,
    avgLatency: 85,
  })

  // Simulate real-time oracle updates
  useEffect(() => {
    const interval = setInterval(() => {
      setOracles((prev) =>
        prev.map((oracle) => ({
          ...oracle,
          price: oracle.price * (1 + (Math.random() - 0.5) * 0.001),
          confidence: Math.max(95, oracle.confidence + (Math.random() - 0.5) * 2),
          lastUpdate: oracle.status === "active" ? Date.now() - Math.random() * 60000 : oracle.lastUpdate,
          deviation: Math.max(0.1, oracle.deviation + (Math.random() - 0.5) * 0.2),
        })),
      )

      setNetworkStats((prev) => ({
        ...prev,
        avgConfidence: 95 + Math.random() * 5,
        totalUpdates: prev.totalUpdates + Math.floor(Math.random() * 5),
        avgLatency: 50 + Math.random() * 100,
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-400 bg-green-500/20"
      case "stale":
        return "text-yellow-400 bg-yellow-500/20"
      case "error":
        return "text-red-400 bg-red-500/20"
      default:
        return "text-gray-400 bg-gray-500/20"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Activity className="w-4 h-4" />
      case "stale":
        return <AlertTriangle className="w-4 h-4" />
      case "error":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Network Status */}
      <ChainlinkNetworkStatus />

      {/* Network Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Feeds", value: networkStats.totalFeeds, icon: Activity, color: "from-blue-500 to-cyan-500" },
          {
            label: "Active Feeds",
            value: networkStats.activeFeeds,
            icon: TrendingUp,
            color: "from-green-500 to-emerald-500",
          },
          {
            label: "Avg Confidence",
            value: `${networkStats.avgConfidence.toFixed(1)}%`,
            icon: Shield,
            color: "from-purple-500 to-pink-500",
          },
          {
            label: "Total Updates",
            value: networkStats.totalUpdates.toLocaleString(),
            icon: Zap,
            color: "from-orange-500 to-red-500",
          },
          {
            label: "Avg Latency",
            value: `${networkStats.avgLatency.toFixed(0)}ms`,
            icon: Activity,
            color: "from-indigo-500 to-purple-500",
          },
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                      <motion.p
                        className="text-lg font-bold text-white"
                        key={stat.value}
                        initial={{ scale: 1.1, color: "#10b981" }}
                        animate={{ scale: 1, color: "#ffffff" }}
                        transition={{ duration: 0.3 }}
                      >
                        {stat.value}
                      </motion.p>
                    </div>
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Oracle Feeds */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Live Oracle Feeds</span>
          </CardTitle>
          <CardDescription className="text-gray-400">Real-time Chainlink price feed data and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AnimatePresence>
              {oracles.map((oracle, index) => (
                <motion.div
                  key={oracle.symbol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                    {/* Asset Info */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{oracle.symbol[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-white">{oracle.symbol}/USD</p>
                        <p className="text-xs text-gray-400">
                          {oracle.feedAddress.slice(0, 8)}...{oracle.feedAddress.slice(-6)}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-center">
                      <ChainlinkPriceFeed
                        symbol={oracle.symbol}
                        size="sm"
                        showChange={false}
                        className="justify-center"
                      />
                    </div>

                    {/* Confidence */}
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Shield className="w-4 h-4 text-green-400" />
                        <motion.span
                          className="text-white font-medium"
                          key={oracle.confidence}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                        >
                          {oracle.confidence.toFixed(1)}%
                        </motion.span>
                      </div>
                      <Progress value={oracle.confidence} className="h-1 mt-1" />
                    </div>

                    {/* Status */}
                    <div className="text-center">
                      <Badge className={getStatusColor(oracle.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(oracle.status)}
                          <span className="capitalize">{oracle.status}</span>
                        </div>
                      </Badge>
                    </div>

                    {/* Last Update */}
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Last Update</p>
                      <motion.p
                        className="text-white text-sm"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      >
                        {Math.floor((Date.now() - oracle.lastUpdate) / 1000)}s ago
                      </motion.p>
                    </div>

                    {/* Deviation */}
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Deviation</p>
                      <span
                        className={`text-sm font-medium ${
                          oracle.deviation < 0.5
                            ? "text-green-400"
                            : oracle.deviation < 1.0
                              ? "text-yellow-400"
                              : "text-red-400"
                        }`}
                      >
                        ±{oracle.deviation.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Oracle Integration Info */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Chainlink Integration Benefits</CardTitle>
          <CardDescription className="text-gray-400">
            How Chainlink oracles enhance NebulaLend's security and reliability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Decentralized Security",
                description: "Multiple independent nodes provide tamper-resistant price data",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: Activity,
                title: "High Availability",
                description: "99.9% uptime with automatic failover and redundancy",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Zap,
                title: "Real-time Updates",
                description: "Sub-second price updates during high volatility periods",
                color: "from-purple-500 to-pink-500",
              },
            ].map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="text-center space-y-3"
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${benefit.color} rounded-full flex items-center justify-center mx-auto`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white">{benefit.title}</h3>
                  <p className="text-sm text-gray-400">{benefit.description}</p>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
