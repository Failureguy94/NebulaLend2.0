"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { ArrowUpDown, Settings, Zap, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// Import the Chainlink price feed component at the top
import { useChainlinkPrice } from "./chainlink-price-feed"

interface WalletState {
  isConnected: boolean
  address: string
  balance: string
  chainId: number
  isConnecting: boolean
}

interface DynamicSwapInterfaceProps {
  walletState: WalletState
}

export function DynamicSwapInterface({ walletState }: DynamicSwapInterfaceProps) {
  const [fromToken, setFromToken] = useState("")
  const [toToken, setToToken] = useState("")
  const [fromAmount, setFromAmount] = useState("")
  const [isSwapping, setIsSwapping] = useState(false)

  // Update the tokens array to remove hardcoded prices
  const tokens = [
    { symbol: "ETH", name: "Ethereum", balance: "2.45" },
    { symbol: "USDC", name: "USD Coin", balance: "1,250.00" },
    { symbol: "DAI", name: "Dai Stablecoin", balance: "890.50" },
    { symbol: "WBTC", name: "Wrapped Bitcoin", balance: "0.15" },
  ]

  // Add hooks to get real-time prices
  const { priceData: fromPriceData } = useChainlinkPrice(fromToken)
  const { priceData: toPriceData } = useChainlinkPrice(toToken)

  // Update the calculateToAmount function to use Chainlink prices
  const calculateToAmount = () => {
    if (!fromAmount || !fromToken || !toToken || !fromPriceData || !toPriceData) return "0"

    const fromValue = Number.parseFloat(fromAmount) * fromPriceData.price
    const toAmount = fromValue / toPriceData.price
    return (toAmount * 0.997).toFixed(6)
  }

  const swapTokens = () => {
    const tempToken = fromToken
    setFromToken(toToken)
    setToToken(tempToken)
    setFromAmount("")
  }

  const toAmount = calculateToAmount()

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
                rotate: [0, 180, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-6"
            >
              <ArrowUpDown className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-gray-400 text-center max-w-md">
              Connect your wallet to start swapping tokens on NebulaLend
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
      className="max-w-md mx-auto"
    >
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10"
          animate={{
            background: [
              "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1))",
              "linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1))",
              "linear-gradient(225deg, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1))",
              "linear-gradient(315deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1))",
            ],
          }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
        />

        <CardHeader>
          <div className="flex items-center justify-between">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <CardTitle className="text-white flex items-center space-x-2">
                <ArrowUpDown className="w-5 h-5" />
                <span>Swap Tokens</span>
              </CardTitle>
              <CardDescription className="text-gray-400">Trade tokens using AMM liquidity pools</CardDescription>
            </motion.div>
            <motion.button
              whileHover={{ rotate: 180, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 relative z-10">
          {/* From Token */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <Label className="text-gray-300">From</Label>
            <div className="bg-slate-700/50 p-4 rounded-lg space-y-3 backdrop-blur-sm border border-slate-600/30">
              <div className="flex items-center justify-between">
                <Select value={fromToken} onValueChange={setFromToken}>
                  <SelectTrigger className="w-32 bg-slate-600/50 border-slate-500 text-white">
                    <SelectValue placeholder="Token" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {tokens.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol} className="text-white">
                        {token.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="text-right bg-transparent border-none text-xl font-semibold text-white focus:ring-0 flex-1"
                />
              </div>
              <AnimatePresence>
                {fromToken && fromPriceData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-400">
                      Balance: {tokens.find((t) => t.symbol === fromToken)?.balance}
                    </span>
                    <span className="text-gray-400">
                      ${fromAmount ? (Number.parseFloat(fromAmount) * fromPriceData.price).toFixed(2) : "0.00"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <motion.button
              onClick={swapTokens}
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              className="bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-full p-3 border border-slate-600/30 backdrop-blur-sm"
            >
              <ArrowUpDown className="w-5 h-5" />
            </motion.button>
          </div>

          {/* To Token */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <Label className="text-gray-300">To</Label>
            <div className="bg-slate-700/50 p-4 rounded-lg space-y-3 backdrop-blur-sm border border-slate-600/30">
              <div className="flex items-center justify-between">
                <Select value={toToken} onValueChange={setToToken}>
                  <SelectTrigger className="w-32 bg-slate-600/50 border-slate-500 text-white">
                    <SelectValue placeholder="Token" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {tokens
                      .filter((t) => t.symbol !== fromToken)
                      .map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol} className="text-white">
                          {token.symbol}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <motion.div
                  className="text-right text-xl font-semibold text-white flex-1"
                  key={toAmount}
                  initial={{ scale: 1.1, color: "#10b981" }}
                  animate={{ scale: 1, color: "#ffffff" }}
                >
                  {toAmount}
                </motion.div>
              </div>
              <AnimatePresence>
                {toToken && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-400">Balance: {tokens.find((t) => t.symbol === toToken)?.balance}</span>
                    <span className="text-gray-400">
                      $
                      {toAmount
                        ? (Number.parseFloat(toAmount) * tokens.find((t) => t.symbol === toToken)!.price).toFixed(2)
                        : "0.00"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Swap Details */}
          <AnimatePresence>
            {fromAmount && fromToken && toToken && fromPriceData && toPriceData && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className="bg-slate-700/30 p-3 rounded-lg space-y-2 text-sm backdrop-blur-sm border border-slate-600/30"
              >
                {/* In the swap details section, update to show real-time rates */}
                <div className="flex justify-between">
                  <span className="text-gray-400">Rate:</span>
                  <motion.span
                    className="text-white"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    {fromPriceData && toPriceData ? (
                      <>
                        1 {fromToken} = {(fromPriceData.price / toPriceData.price).toFixed(6)} {toToken}
                        <div className="text-xs text-gray-400 mt-1">Powered by Chainlink</div>
                      </>
                    ) : (
                      "Loading..."
                    )}
                  </motion.span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Trading Fee:</span>
                  <span className="text-white">0.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Slippage:</span>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                    0.5%
                  </Badge>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Swap Button */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Button
              onClick={() => setIsSwapping(true)}
              disabled={!fromToken || !toToken || !fromAmount || isSwapping}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-12 text-lg font-semibold"
            >
              <AnimatePresence mode="wait">
                {isSwapping ? (
                  <motion.div
                    key="swapping"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center space-x-2"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <RefreshCw className="w-5 h-5" />
                    </motion.div>
                    <span>Swapping...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="swap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center space-x-2"
                  >
                    <Zap className="w-5 h-5" />
                    <span>Swap Tokens</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
