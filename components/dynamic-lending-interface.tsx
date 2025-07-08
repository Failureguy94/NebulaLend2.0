"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Plus, Sparkles, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

// Import the Chainlink price feed component at the top
import { ChainlinkPriceFeed } from "./chainlink-price-feed"

interface WalletState {
  isConnected: boolean
  address: string
  balance: string
  chainId: number
  isConnecting: boolean
}

interface DynamicLendingInterfaceProps {
  walletState: WalletState
}

export function DynamicLendingInterface({ walletState }: DynamicLendingInterfaceProps) {
  const [selectedToken, setSelectedToken] = useState("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // In the tokens array, update to use real-time Chainlink prices
  const tokens = [
    { symbol: "ETH", name: "Ethereum", balance: walletState.balance || "2.45", apy: 8.5 },
    { symbol: "USDC", name: "USD Coin", balance: "1,250.00", apy: 12.3 },
    { symbol: "DAI", name: "Dai Stablecoin", balance: "890.50", apy: 9.8 },
    { symbol: "WBTC", name: "Wrapped Bitcoin", balance: "0.15", apy: 6.2 },
  ]

  const handleLend = async () => {
    setIsLoading(true)
    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    setAmount("")
    toast({
      title: "Liquidity Added!",
      description: `Successfully added ${amount} ${selectedToken} to the pool`,
    })
  }

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
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6"
            >
              <Plus className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-gray-400 text-center max-w-md">
              Connect your wallet to start lending assets and earning yield on NebulaLend
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
      className="max-w-2xl mx-auto space-y-6"
    >
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
        />

        <CardHeader>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <CardTitle className="text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span>Lend Assets</span>
            </CardTitle>
            <CardDescription className="text-gray-400">Provide liquidity to earn competitive yields</CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="token" className="text-gray-300 mb-2 block">
                  Select Token
                </Label>
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white backdrop-blur-sm">
                    <SelectValue placeholder="Choose token to lend" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 backdrop-blur-sm">
                    {tokens.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol} className="text-white">
                        <div className="flex items-center justify-between w-full">
                          <span>
                            {token.symbol} - {token.name}
                          </span>
                          <Badge variant="secondary" className="ml-2 bg-green-500/20 text-green-400">
                            {token.apy}% APY
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount" className="text-gray-300 mb-2 block">
                  Amount
                </Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white pr-16 backdrop-blur-sm"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 px-2 py-1 rounded text-sm font-medium"
                    onClick={() => {
                      const token = tokens.find((t) => t.symbol === selectedToken)
                      if (token) setAmount(token.balance.replace(/,/g, ""))
                    }}
                  >
                    MAX
                  </motion.button>
                </div>
                <AnimatePresence>
                  {selectedToken && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-gray-400 mt-1"
                    >
                      Balance: {tokens.find((t) => t.symbol === selectedToken)?.balance} {selectedToken}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              {/* Replace the lending details section with Chainlink-powered pricing */}
              <div className="bg-slate-700/30 p-4 rounded-lg backdrop-blur-sm border border-slate-600/30">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Lending Details
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current APY:</span>
                    <motion.span
                      className="text-green-400 font-medium"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    >
                      {selectedToken ? tokens.find((t) => t.symbol === selectedToken)?.apy + "%" : "0%"}
                    </motion.span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Price:</span>
                    {selectedToken && <ChainlinkPriceFeed symbol={selectedToken} size="sm" showChange={true} />}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">LP Tokens:</span>
                    <span className="text-white">{amount || "0"} LP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Est. Daily Earnings:</span>
                    <motion.span
                      className="text-white"
                      key={amount}
                      initial={{ scale: 1.1, color: "#10b981" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                    >
                      ${amount ? (Number.parseFloat(amount) * 0.0003).toFixed(4) : "0.0000"}
                    </motion.span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Button
              onClick={handleLend}
              disabled={!selectedToken || !amount || isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 text-lg font-semibold"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center space-x-2"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Processing...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="lend"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Liquidity</span>
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
