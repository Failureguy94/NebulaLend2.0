"use client"

import { useState } from "react"
import { Plus, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LendingInterfaceProps {
  isWalletConnected: boolean
}

export function LendingInterface({ isWalletConnected }: LendingInterfaceProps) {
  const [selectedToken, setSelectedToken] = useState("")
  const [amount, setAmount] = useState("")

  const tokens = [
    { symbol: "ETH", name: "Ethereum", balance: "2.45", apy: "8.5%" },
    { symbol: "USDC", name: "USD Coin", balance: "1,250.00", apy: "12.3%" },
    { symbol: "DAI", name: "Dai Stablecoin", balance: "890.50", apy: "9.8%" },
    { symbol: "WBTC", name: "Wrapped Bitcoin", balance: "0.15", apy: "6.2%" },
  ]

  const pools = [
    { pair: "ETH/USDC", tvl: "$892,341", apy: "12.4%", yourLiquidity: "$0" },
    { pair: "WBTC/DAI", tvl: "$654,789", apy: "8.7%", yourLiquidity: "$1,250" },
    { pair: "USDC/DAI", tvl: "$543,210", apy: "5.2%", yourLiquidity: "$0" },
    { pair: "ETH/DAI", tvl: "$456,789", apy: "9.8%", yourLiquidity: "$890" },
  ]

  if (!isWalletConnected) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Connect Your Wallet</h3>
            <p className="text-gray-400 max-w-md">
              Connect your wallet to start lending assets and earning yield on NebulaLend
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Lending Form */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Lend Assets</CardTitle>
          <CardDescription className="text-gray-400">Provide liquidity to earn yield on your assets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="token" className="text-gray-300">
                  Select Token
                </Label>
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Choose token to lend" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {tokens.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol} className="text-white">
                        <div className="flex items-center justify-between w-full">
                          <span>
                            {token.symbol} - {token.name}
                          </span>
                          <Badge variant="secondary" className="ml-2 bg-green-500/20 text-green-400">
                            {token.apy}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount" className="text-gray-300">
                  Amount
                </Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white pr-16"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300"
                    onClick={() => {
                      const token = tokens.find((t) => t.symbol === selectedToken)
                      if (token) setAmount(token.balance)
                    }}
                  >
                    MAX
                  </Button>
                </div>
                {selectedToken && (
                  <p className="text-sm text-gray-400 mt-1">
                    Balance: {tokens.find((t) => t.symbol === selectedToken)?.balance} {selectedToken}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-3">Lending Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current APY:</span>
                    <span className="text-green-400">
                      {selectedToken ? tokens.find((t) => t.symbol === selectedToken)?.apy : "0%"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">LP Tokens:</span>
                    <span className="text-white">{amount || "0"} LP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Est. Daily Earnings:</span>
                    <span className="text-white">
                      ${amount ? (Number.parseFloat(amount) * 0.0003).toFixed(4) : "0.0000"}
                    </span>
                  </div>
                </div>
              </div>

              <Alert className="bg-blue-500/10 border-blue-500/20">
                <Info className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  You'll receive LP tokens representing your share of the pool. These tokens earn fees from trading
                  activity.
                </AlertDescription>
              </Alert>
            </div>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            disabled={!selectedToken || !amount}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Liquidity
          </Button>
        </CardContent>
      </Card>

      {/* Active Pools */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Available Pools</CardTitle>
          <CardDescription className="text-gray-400">Current liquidity pools and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pools.map((pool, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {pool.pair.split("/")[0][0]}
                      {pool.pair.split("/")[1][0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{pool.pair}</p>
                    <p className="text-sm text-gray-400">TVL: {pool.tvl}</p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                    {pool.apy} APY
                  </Badge>
                  <p className="text-sm text-gray-400">Your Liquidity: {pool.yourLiquidity}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
