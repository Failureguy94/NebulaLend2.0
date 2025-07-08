"use client"

import { useState } from "react"
import { TrendingDown, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface BorrowingInterfaceProps {
  isWalletConnected: boolean
}

export function BorrowingInterface({ isWalletConnected }: BorrowingInterfaceProps) {
  const [collateralToken, setCollateralToken] = useState("")
  const [borrowToken, setBorrowToken] = useState("")
  const [collateralAmount, setCollateralAmount] = useState("")
  const [borrowAmount, setBorrowAmount] = useState("")

  const tokens = [
    { symbol: "ETH", name: "Ethereum", balance: "2.45", price: 2450, ltv: 75 },
    { symbol: "WBTC", name: "Wrapped Bitcoin", balance: "0.15", price: 45000, ltv: 70 },
    { symbol: "USDC", name: "USD Coin", balance: "1,250.00", price: 1, ltv: 85 },
    { symbol: "DAI", name: "Dai Stablecoin", balance: "890.50", price: 1, ltv: 85 },
  ]

  const calculateHealthFactor = () => {
    if (!collateralAmount || !borrowAmount || !collateralToken || !borrowToken) return 100

    const collateral = tokens.find((t) => t.symbol === collateralToken)
    const borrow = tokens.find((t) => t.symbol === borrowToken)

    if (!collateral || !borrow) return 100

    const collateralValue = Number.parseFloat(collateralAmount) * collateral.price
    const borrowValue = Number.parseFloat(borrowAmount) * borrow.price
    const maxBorrow = collateralValue * (collateral.ltv / 100)

    return maxBorrow > 0 ? (maxBorrow / borrowValue) * 100 : 100
  }

  const healthFactor = calculateHealthFactor()
  const maxBorrowAmount =
    collateralAmount && collateralToken
      ? (Number.parseFloat(collateralAmount) *
          tokens.find((t) => t.symbol === collateralToken)!.price *
          tokens.find((t) => t.symbol === collateralToken)!.ltv) /
        100
      : 0

  if (!isWalletConnected) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto">
              <TrendingDown className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Connect Your Wallet</h3>
            <p className="text-gray-400 max-w-md">Connect your wallet to start borrowing against your collateral</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Borrowing Form */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Borrow Assets</CardTitle>
          <CardDescription className="text-gray-400">
            Borrow assets against your collateral with competitive rates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Collateral Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Collateral</h4>

              <div>
                <Label htmlFor="collateral-token" className="text-gray-300">
                  Collateral Token
                </Label>
                <Select value={collateralToken} onValueChange={setCollateralToken}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select collateral" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
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
                <Label htmlFor="collateral-amount" className="text-gray-300">
                  Collateral Amount
                </Label>
                <div className="relative">
                  <Input
                    id="collateral-amount"
                    type="number"
                    placeholder="0.00"
                    value={collateralAmount}
                    onChange={(e) => setCollateralAmount(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white pr-16"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300"
                    onClick={() => {
                      const token = tokens.find((t) => t.symbol === collateralToken)
                      if (token) setCollateralAmount(token.balance)
                    }}
                  >
                    MAX
                  </Button>
                </div>
                {collateralToken && (
                  <p className="text-sm text-gray-400 mt-1">
                    Balance: {tokens.find((t) => t.symbol === collateralToken)?.balance} {collateralToken}
                  </p>
                )}
              </div>
            </div>

            {/* Borrow Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Borrow</h4>

              <div>
                <Label htmlFor="borrow-token" className="text-gray-300">
                  Borrow Token
                </Label>
                <Select value={borrowToken} onValueChange={setBorrowToken}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select token to borrow" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
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
                <Label htmlFor="borrow-amount" className="text-gray-300">
                  Borrow Amount
                </Label>
                <div className="relative">
                  <Input
                    id="borrow-amount"
                    type="number"
                    placeholder="0.00"
                    value={borrowAmount}
                    onChange={(e) => setBorrowAmount(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white pr-16"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300"
                    onClick={() => {
                      if (borrowToken && maxBorrowAmount > 0) {
                        const borrowTokenData = tokens.find((t) => t.symbol === borrowToken)
                        if (borrowTokenData) {
                          setBorrowAmount((maxBorrowAmount / borrowTokenData.price).toFixed(6))
                        }
                      }
                    }}
                  >
                    MAX
                  </Button>
                </div>
                {maxBorrowAmount > 0 && (
                  <p className="text-sm text-gray-400 mt-1">Max borrow: ${maxBorrowAmount.toFixed(2)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Health Factor */}
          {collateralAmount && borrowAmount && (
            <div className="bg-slate-700/30 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white">Health Factor</h4>
                <Badge
                  variant={healthFactor > 150 ? "secondary" : healthFactor > 110 ? "outline" : "destructive"}
                  className={
                    healthFactor > 150
                      ? "bg-green-500/20 text-green-400"
                      : healthFactor > 110
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                  }
                >
                  {healthFactor.toFixed(2)}%
                </Badge>
              </div>
              <Progress value={Math.min(healthFactor, 200)} className="h-2 mb-2" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Collateral Value:</span>
                  <span className="text-white">
                    $
                    {collateralAmount && collateralToken
                      ? (
                          Number.parseFloat(collateralAmount) * tokens.find((t) => t.symbol === collateralToken)!.price
                        ).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Borrow Value:</span>
                  <span className="text-white">
                    $
                    {borrowAmount && borrowToken
                      ? (Number.parseFloat(borrowAmount) * tokens.find((t) => t.symbol === borrowToken)!.price).toFixed(
                          2,
                        )
                      : "0.00"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Liquidation Threshold:</span>
                  <span className="text-white">110%</span>
                </div>
              </div>
            </div>
          )}

          {healthFactor < 150 && healthFactor < 200 && (
            <Alert
              className={
                healthFactor < 110 ? "bg-red-500/10 border-red-500/20" : "bg-yellow-500/10 border-yellow-500/20"
              }
            >
              <AlertTriangle className={`h-4 w-4 ${healthFactor < 110 ? "text-red-400" : "text-yellow-400"}`} />
              <AlertDescription className={healthFactor < 110 ? "text-red-300" : "text-yellow-300"}>
                {healthFactor < 110
                  ? "⚠️ High liquidation risk! Your position may be liquidated."
                  : "⚠️ Moderate risk. Consider adding more collateral or reducing borrow amount."}
              </AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            disabled={!collateralToken || !borrowToken || !collateralAmount || !borrowAmount || healthFactor < 110}
          >
            <TrendingDown className="w-4 h-4 mr-2" />
            Borrow Assets
          </Button>
        </CardContent>
      </Card>

      {/* Borrowing Info */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">How Borrowing Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-purple-400 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-white">Deposit Collateral</h4>
              <p className="text-sm text-gray-400">Lock your assets as collateral to secure your loan</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-purple-400 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-white">Borrow Assets</h4>
              <p className="text-sm text-gray-400">Borrow up to your LTV ratio against your collateral</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-purple-400 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-white">Maintain Health</h4>
              <p className="text-sm text-gray-400">Keep your health factor above 110% to avoid liquidation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
