"use client"

import { useState } from "react"
import { ArrowUpDown, Settings, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SwapInterfaceProps {
  isWalletConnected: boolean
}

export function SwapInterface({ isWalletConnected }: SwapInterfaceProps) {
  const [fromToken, setFromToken] = useState("")
  const [toToken, setToToken] = useState("")
  const [fromAmount, setFromAmount] = useState("")
  const [slippage, setSlippage] = useState("0.5")

  const tokens = [
    { symbol: "ETH", name: "Ethereum", balance: "2.45", price: 2450 },
    { symbol: "USDC", name: "USD Coin", balance: "1,250.00", price: 1 },
    { symbol: "DAI", name: "Dai Stablecoin", balance: "890.50", price: 1 },
    { symbol: "WBTC", name: "Wrapped Bitcoin", balance: "0.15", price: 45000 },
  ]

  const calculateToAmount = () => {
    if (!fromAmount || !fromToken || !toToken) return "0"

    const fromTokenData = tokens.find((t) => t.symbol === fromToken)
    const toTokenData = tokens.find((t) => t.symbol === toToken)

    if (!fromTokenData || !toTokenData) return "0"

    const fromValue = Number.parseFloat(fromAmount) * fromTokenData.price
    const toAmount = fromValue / toTokenData.price

    // Apply 0.3% trading fee
    return (toAmount * 0.997).toFixed(6)
  }

  const swapTokens = () => {
    const tempToken = fromToken
    setFromToken(toToken)
    setToToken(tempToken)
    setFromAmount("")
  }

  const toAmount = calculateToAmount()
  const priceImpact = fromAmount ? (Number.parseFloat(fromAmount) * 0.001).toFixed(3) : "0"

  if (!isWalletConnected) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto">
              <ArrowUpDown className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Connect Your Wallet</h3>
            <p className="text-gray-400 max-w-md">Connect your wallet to start swapping tokens on NebulaLend</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Swap Interface */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Swap Tokens</CardTitle>
              <CardDescription className="text-gray-400">Trade tokens using AMM liquidity pools</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* From Token */}
          <div className="space-y-2">
            <Label className="text-gray-300">From</Label>
            <div className="bg-slate-700/50 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Select value={fromToken} onValueChange={setFromToken}>
                  <SelectTrigger className="w-32 bg-slate-600 border-slate-500 text-white">
                    <SelectValue placeholder="Token" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
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
                  className="text-right bg-transparent border-none text-xl font-semibold text-white focus:ring-0"
                />
              </div>
              {fromToken && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Balance: {tokens.find((t) => t.symbol === fromToken)?.balance}</span>
                  <span className="text-gray-400">
                    $
                    {fromAmount
                      ? (Number.parseFloat(fromAmount) * tokens.find((t) => t.symbol === fromToken)!.price).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={swapTokens}
              className="bg-slate-700 hover:bg-slate-600 text-white rounded-full"
            >
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <Label className="text-gray-300">To</Label>
            <div className="bg-slate-700/50 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Select value={toToken} onValueChange={setToToken}>
                  <SelectTrigger className="w-32 bg-slate-600 border-slate-500 text-white">
                    <SelectValue placeholder="Token" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {tokens
                      .filter((t) => t.symbol !== fromToken)
                      .map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol} className="text-white">
                          {token.symbol}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <div className="text-right text-xl font-semibold text-white">{toAmount}</div>
              </div>
              {toToken && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Balance: {tokens.find((t) => t.symbol === toToken)?.balance}</span>
                  <span className="text-gray-400">
                    $
                    {toAmount
                      ? (Number.parseFloat(toAmount) * tokens.find((t) => t.symbol === toToken)!.price).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Swap Details */}
          {fromAmount && fromToken && toToken && (
            <div className="bg-slate-700/30 p-3 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Rate:</span>
                <span className="text-white">
                  1 {fromToken} ={" "}
                  {(
                    tokens.find((t) => t.symbol === fromToken)!.price / tokens.find((t) => t.symbol === toToken)!.price
                  ).toFixed(6)}{" "}
                  {toToken}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Trading Fee:</span>
                <span className="text-white">0.3%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Price Impact:</span>
                <span className={`${Number.parseFloat(priceImpact) > 1 ? "text-red-400" : "text-green-400"}`}>
                  {priceImpact}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Slippage Tolerance:</span>
                <span className="text-white">{slippage}%</span>
              </div>
            </div>
          )}

          {Number.parseFloat(priceImpact) > 1 && (
            <Alert className="bg-yellow-500/10 border-yellow-500/20">
              <Info className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-300">
                High price impact detected. Consider reducing your swap amount.
              </AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            disabled={!fromToken || !toToken || !fromAmount}
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Swap Tokens
          </Button>
        </CardContent>
      </Card>

      {/* AMM Info */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">AMM Trading</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                x * y = k
              </Badge>
              <span className="text-gray-300">Constant product formula</span>
            </div>
            <p className="text-gray-400">
              Swaps are executed using automated market maker (AMM) pools. Prices are determined by the ratio of tokens
              in each pool.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-600">
              <span className="text-gray-400">Network:</span>
              <Badge variant="outline" className="border-green-500 text-green-400">
                Ethereum Mainnet
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
