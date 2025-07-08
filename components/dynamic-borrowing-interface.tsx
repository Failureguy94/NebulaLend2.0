"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { TrendingDown, AlertTriangle, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Import the Chainlink price feed component at the top
import { ChainlinkPriceFeed, useChainlinkPrice } from "./chainlink-price-feed"

interface WalletState {
  isConnected: boolean
  address: string
  balance: string
  chainId: number
  isConnecting: boolean
}

interface DynamicBorrowingInterfaceProps {
  walletState: WalletState
}

export function DynamicBorrowingInterface({ walletState }: DynamicBorrowingInterfaceProps) {
  const [collateralToken, setCollateralToken] = useState("")
  const [borrowToken, setBorrowToken] = useState("")
  const [collateralAmount, setCollateralAmount] = useState("")
  const [borrowAmount, setBorrowAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Update the tokens array to use Chainlink price feeds
  const tokens = [
    { symbol: "ETH", name: "Ethereum", balance: "2.45", ltv: 75 },
    { symbol: "WBTC", name: "Wrapped Bitcoin", balance: "0.15", ltv: 70 },
    { symbol: "USDC", name: "USD Coin", balance: "1,250.00", ltv: 85 },
    { symbol: "DAI", name: "Dai Stablecoin", balance: "890.50", ltv: 85 },
  ]

  // Add a new hook to get real-time prices for calculations
  const { priceData: collateralPriceData } = useChainlinkPrice(collateralToken)
  const { priceData: borrowPriceData } = useChainlinkPrice(borrowToken)

  // Update the calculateHealthFactor function to use Chainlink prices
  const calculateHealthFactor = () => {
    if (!collateralAmount || !borrowAmount || !collateralToken || !borrowToken) return 100
    if (!collateralPriceData || !borrowPriceData) return 100

    const collateral = tokens.find((t) => t.symbol === collateralToken)
    if (!collateral) return 100

    const collateralValue = Number.parseFloat(collateralAmount) * collateralPriceData.price
    const borrowValue = Number.parseFloat(borrowAmount) * borrowPriceData.price
    const maxBorrow = collateralValue * (collateral.ltv / 100)

    return maxBorrow > 0 ? (maxBorrow / borrowValue) * 100 : 100
  }

  const healthFactor = calculateHealthFactor()

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
                rotate: [0, -10, 10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-6"
            >
              <TrendingDown className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-gray-400 text-center max-w-md">
              Connect your wallet to start borrowing against your collateral
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
      className="max-w-4xl mx-auto space-y-6"
    >
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
        />

        <CardHeader>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <CardTitle className="text-white flex items-center space-x-2">
              <TrendingDown className="w-5 h-5" />
              <span>Borrow Assets</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Borrow assets against your collateral with competitive rates
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Collateral Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-blue-400" />
                <h4 className="font-semibold text-white text-lg">Collateral</h4>
              </div>

              <div>
                <Label className="text-gray-300 mb-2 block">Collateral Token</Label>
                <Select value={collateralToken} onValueChange={setCollateralToken}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white backdrop-blur-sm">
                    <SelectValue placeholder="Select collateral" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 backdrop-blur-sm">
                    {tokens.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol} className="text-white">
                        <div className="flex items-center justify-between w-full">
                          <span>
                            {token.symbol} - {token.name}
                          </span>
                          <Badge variant="secondary" className="ml-2 bg-blue-500/20 text-blue-400">
                            {token.ltv}% LTV
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300 mb-2 block">Collateral Amount</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={collateralAmount}
                    onChange={(e) => setCollateralAmount(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white pr-16 backdrop-blur-sm"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300 px-2 py-1 rounded text-sm font-medium"
                    onClick={() => {
                      const token = tokens.find((t) => t.symbol === collateralToken)
                      if (token) setCollateralAmount(token.balance)
                    }}
                  >
                    MAX
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Borrow Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2 mb-4">
                <TrendingDown className="w-5 h-5 text-orange-400" />
                <h4 className="font-semibold text-white text-lg">Borrow</h4>
              </div>

              <div>
                <Label className="text-gray-300 mb-2 block">Borrow Token</Label>
                <Select value={borrowToken} onValueChange={setBorrowToken}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white backdrop-blur-sm">
                    <SelectValue placeholder="Select token to borrow" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 backdrop-blur-sm">
                    {tokens
                      .filter((t) => t.symbol !== collateralToken)
                      .map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol} className="text-white">
                          {token.symbol} - {token.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300 mb-2 block">Borrow Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white backdrop-blur-sm"
                />
              </div>
            </motion.div>
          </div>

          {/* Health Factor Display */}
          <AnimatePresence>
            {collateralAmount && borrowAmount && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="bg-slate-700/30 p-6 rounded-lg backdrop-blur-sm border border-slate-600/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-white text-lg flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Health Factor
                  </h4>
                  <motion.div
                    key={healthFactor}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Badge
                      variant={healthFactor > 150 ? "secondary" : healthFactor > 110 ? "outline" : "destructive"}
                      className={`text-lg px-3 py-1 ${
                        healthFactor > 150
                          ? "bg-green-500/20 text-green-400"
                          : healthFactor > 110
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {healthFactor.toFixed(1)}%
                    </Badge>
                  </motion.div>
                </div>

                <motion.div
                  key={healthFactor}
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <Progress value={Math.min(healthFactor, 200)} className="h-3 mb-4" />
                </motion.div>

                {/* In the health factor display section, add real-time price displays */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-400 mb-1">Collateral Value</p>
                    <motion.p
                      className="text-white font-semibold"
                      key={collateralAmount}
                      initial={{ scale: 1.1, color: "#10b981" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                    >
                      {collateralAmount && collateralToken && collateralPriceData ? (
                        <span>
                          ${(Number.parseFloat(collateralAmount) * collateralPriceData.price).toLocaleString()}
                          <ChainlinkPriceFeed
                            symbol={collateralToken}
                            size="sm"
                            showChange={false}
                            className="block mt-1 justify-center"
                          />
                        </span>
                      ) : (
                        "$0"
                      )}
                    </motion.p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 mb-1">Borrow Value</p>
                    <motion.p
                      className="text-white font-semibold"
                      key={borrowAmount}
                      initial={{ scale: 1.1, color: "#f97316" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                    >
                      {borrowAmount && borrowToken && borrowPriceData ? (
                        <span>
                          ${(Number.parseFloat(borrowAmount) * borrowPriceData.price).toLocaleString()}
                          <ChainlinkPriceFeed
                            symbol={borrowToken}
                            size="sm"
                            showChange={false}
                            className="block mt-1 justify-center"
                          />
                        </span>
                      ) : (
                        "$0"
                      )}
                    </motion.p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 mb-1">Liquidation Threshold</p>
                    <p className="text-red-400 font-semibold">110%</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Risk Warning */}
          <AnimatePresence>
            {healthFactor < 150 && healthFactor < 200 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Alert
                  className={`${
                    healthFactor < 110 ? "bg-red-500/10 border-red-500/20" : "bg-yellow-500/10 border-yellow-500/20"
                  } backdrop-blur-sm`}
                >
                  <AlertTriangle className={`h-4 w-4 ${healthFactor < 110 ? "text-red-400" : "text-yellow-400"}`} />
                  <AlertDescription className={healthFactor < 110 ? "text-red-300" : "text-yellow-300"}>
                    {healthFactor < 110
                      ? "⚠️ Critical liquidation risk! Your position may be liquidated immediately."
                      : "⚠️ Moderate risk. Consider adding more collateral or reducing borrow amount."}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Borrow Button */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Button
              onClick={() => setIsLoading(true)}
              disabled={
                !collateralToken ||
                !borrowToken ||
                !collateralAmount ||
                !borrowAmount ||
                healthFactor < 110 ||
                isLoading
              }
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 h-12 text-lg font-semibold"
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
                    <span>Processing Loan...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="borrow"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center space-x-2"
                  >
                    <TrendingDown className="w-5 h-5" />
                    <span>Borrow Assets</span>
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
