"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Activity, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PriceData {
  symbol: string
  price: number
  change24h: number
  lastUpdated: number
  confidence: number
}

interface ChainlinkPriceFeedProps {
  symbol: string
  className?: string
  showChange?: boolean
  size?: "sm" | "md" | "lg"
}

// Chainlink Price Feed Contract Addresses (Ethereum Mainnet)
const CHAINLINK_FEEDS = {
  ETH: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", // ETH/USD
  BTC: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c", // BTC/USD
  USDC: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6", // USDC/USD
  DAI: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9", // DAI/USD
  LINK: "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c", // LINK/USD
}

// Simulated Chainlink data fetcher
class ChainlinkDataFeed {
  private static instance: ChainlinkDataFeed
  private priceCache: Map<string, PriceData> = new Map()
  private subscribers: Map<string, Set<(data: PriceData) => void>> = new Map()

  static getInstance(): ChainlinkDataFeed {
    if (!ChainlinkDataFeed.instance) {
      ChainlinkDataFeed.instance = new ChainlinkDataFeed()
    }
    return ChainlinkDataFeed.instance
  }

  async fetchPrice(symbol: string): Promise<PriceData> {
    // In a real implementation, this would call the Chainlink contract
    // For demo purposes, we'll simulate real-time price data
    const basePrice = this.getBasePrice(symbol)
    const variation = (Math.random() - 0.5) * 0.02 // ±1% variation
    const price = basePrice * (1 + variation)
    const change24h = (Math.random() - 0.5) * 10 // ±5% daily change

    const priceData: PriceData = {
      symbol,
      price,
      change24h,
      lastUpdated: Date.now(),
      confidence: 95 + Math.random() * 5, // 95-100% confidence
    }

    this.priceCache.set(symbol, priceData)
    this.notifySubscribers(symbol, priceData)

    return priceData
  }

  subscribe(symbol: string, callback: (data: PriceData) => void): () => void {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set())
    }
    this.subscribers.get(symbol)!.add(callback)

    // Return unsubscribe function
    return () => {
      this.subscribers.get(symbol)?.delete(callback)
    }
  }

  private notifySubscribers(symbol: string, data: PriceData) {
    this.subscribers.get(symbol)?.forEach((callback) => callback(data))
  }

  private getBasePrice(symbol: string): number {
    const basePrices: Record<string, number> = {
      ETH: 2450,
      BTC: 45000,
      WBTC: 45000,
      USDC: 1.0,
      DAI: 1.0,
      LINK: 15.5,
    }
    return basePrices[symbol] || 1
  }

  startRealTimeUpdates() {
    // Update prices every 10 seconds
    setInterval(() => {
      Array.from(this.priceCache.keys()).forEach((symbol) => {
        this.fetchPrice(symbol)
      })
    }, 10000)
  }
}

export function ChainlinkPriceFeed({
  symbol,
  className = "",
  showChange = true,
  size = "md",
}: ChainlinkPriceFeedProps) {
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const dataFeed = ChainlinkDataFeed.getInstance()

    // Initial fetch
    dataFeed.fetchPrice(symbol).then((data) => {
      setPriceData(data)
      setIsLoading(false)
    })

    // Subscribe to real-time updates
    const unsubscribe = dataFeed.subscribe(symbol, (data) => {
      setIsUpdating(true)
      setPriceData(data)
      setTimeout(() => setIsUpdating(false), 500)
    })

    // Start real-time updates
    dataFeed.startRealTimeUpdates()

    return unsubscribe
  }, [symbol])

  if (isLoading || !priceData) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"
        />
        <span className="text-gray-400">Loading price...</span>
      </div>
    )
  }

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg font-semibold",
  }

  const isPositive = priceData.change24h >= 0

  return (
    <motion.div
      className={`flex items-center space-x-2 ${className}`}
      animate={isUpdating ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {/* Price */}
      <motion.span
        className={`text-white ${sizeClasses[size]}`}
        key={priceData.price}
        initial={{ color: "#10b981" }}
        animate={{ color: "#ffffff" }}
        transition={{ duration: 0.5 }}
      >
        $
        {priceData.price.toLocaleString(undefined, {
          minimumFractionDigits: symbol === "USDC" || symbol === "DAI" ? 4 : 2,
          maximumFractionDigits: symbol === "USDC" || symbol === "DAI" ? 4 : 2,
        })}
      </motion.span>

      {/* 24h Change */}
      {showChange && (
        <motion.div
          className="flex items-center space-x-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3 text-green-400" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-400" />
          )}
          <span className={`text-xs ${isPositive ? "text-green-400" : "text-red-400"}`}>
            {isPositive ? "+" : ""}
            {priceData.change24h.toFixed(2)}%
          </span>
        </motion.div>
      )}

      {/* Chainlink Badge */}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>
        <Badge variant="outline" className="border-blue-500 text-blue-400 text-xs px-1 py-0">
          <Activity className="w-2 h-2 mr-1" />
          CL
        </Badge>
      </motion.div>

      {/* Update indicator */}
      {isUpdating && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="w-2 h-2 bg-blue-400 rounded-full"
        />
      )}
    </motion.div>
  )
}

// Hook for using Chainlink price data
export function useChainlinkPrice(symbol: string) {
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const dataFeed = ChainlinkDataFeed.getInstance()

    dataFeed
      .fetchPrice(symbol)
      .then((data) => {
        setPriceData(data)
        setIsLoading(false)
        setError(null)
      })
      .catch((err) => {
        setError(err.message)
        setIsLoading(false)
      })

    const unsubscribe = dataFeed.subscribe(symbol, setPriceData)
    return unsubscribe
  }, [symbol])

  return { priceData, isLoading, error }
}

// Chainlink Network Status Component
export function ChainlinkNetworkStatus() {
  const [status, setStatus] = useState({
    isOnline: true,
    latency: 0,
    feedsActive: 0,
    lastUpdate: Date.now(),
  })

  useEffect(() => {
    // Simulate network status updates
    const interval = setInterval(() => {
      setStatus((prev) => ({
        isOnline: Math.random() > 0.05, // 95% uptime
        latency: 50 + Math.random() * 100,
        feedsActive: 5 + Math.floor(Math.random() * 3),
        lastUpdate: Date.now(),
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className="flex items-center space-x-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center space-x-2">
        <motion.div
          className={`w-3 h-3 rounded-full ${status.isOnline ? "bg-green-400" : "bg-red-400"}`}
          animate={status.isOnline ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
        />
        <span className="text-white text-sm font-medium">Chainlink Network</span>
        <Badge variant={status.isOnline ? "secondary" : "destructive"} className="text-xs">
          {status.isOnline ? "Online" : "Offline"}
        </Badge>
      </div>

      <div className="flex items-center space-x-4 text-xs text-gray-400">
        <div className="flex items-center space-x-1">
          <Zap className="w-3 h-3" />
          <span>{status.latency.toFixed(0)}ms</span>
        </div>
        <div className="flex items-center space-x-1">
          <Activity className="w-3 h-3" />
          <span>{status.feedsActive} feeds</span>
        </div>
      </div>
    </motion.div>
  )
}
