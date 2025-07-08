"use client"

import { TrendingUp, TrendingDown, AlertTriangle, DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PortfolioViewProps {
  isWalletConnected: boolean
}

export function PortfolioView({ isWalletConnected }: PortfolioViewProps) {
  // Mock portfolio data
  const portfolioData = {
    totalDeposited: 4250.75,
    totalBorrowed: 1850.25,
    netWorth: 2400.5,
    healthFactor: 185.5,
    totalEarnings: 125.3,
  }

  const deposits = [
    { token: "ETH", amount: "1.25", value: 3062.5, apy: "8.5%", earnings: 45.2 },
    { token: "USDC", amount: "800.00", value: 800.0, apy: "12.3%", earnings: 35.8 },
    { token: "DAI", amount: "388.25", value: 388.25, apy: "9.8%", earnings: 44.3 },
  ]

  const borrows = [
    { token: "USDC", amount: "1200.00", value: 1200.0, apy: "15.2%", healthFactor: 185.5 },
    { token: "DAI", amount: "650.25", value: 650.25, apy: "12.8%", healthFactor: 185.5 },
  ]

  const lpPositions = [
    { pair: "ETH/USDC", lpTokens: "0.0045", value: 892.5, fees: 12.45 },
    { pair: "WBTC/DAI", lpTokens: "0.0032", value: 654.3, fees: 8.9 },
  ]

  if (!isWalletConnected) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto">
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Connect Your Wallet</h3>
            <p className="text-gray-400 max-w-md">
              Connect your wallet to view your portfolio and track your positions
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Net Worth</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${portfolioData.netWorth.toLocaleString()}</div>
            <p className="text-xs text-green-400">+8.2% this month</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Deposited</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${portfolioData.totalDeposited.toLocaleString()}</div>
            <p className="text-xs text-gray-400">Earning yield</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Borrowed</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${portfolioData.totalBorrowed.toLocaleString()}</div>
            <p className="text-xs text-gray-400">Active debt</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${portfolioData.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-green-400">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Health Factor Alert */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <span>Health Factor</span>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              {portfolioData.healthFactor}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={Math.min(portfolioData.healthFactor, 200)} className="h-3 mb-3" />
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Liquidation Risk: Low</span>
            <span className="text-gray-400">Threshold: 110%</span>
          </div>
          <Alert className="mt-4 bg-green-500/10 border-green-500/20">
            <AlertTriangle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">
              Your positions are healthy. Health factor is well above liquidation threshold.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Deposits */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Your Deposits</CardTitle>
          <CardDescription className="text-gray-400">Assets you've deposited to earn yield</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deposits.map((deposit, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{deposit.token[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {deposit.amount} {deposit.token}
                    </p>
                    <p className="text-sm text-gray-400">${deposit.value.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 mb-1">
                    {deposit.apy} APY
                  </Badge>
                  <p className="text-sm text-gray-300">+${deposit.earnings.toFixed(2)} earned</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Borrows */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Your Borrows</CardTitle>
          <CardDescription className="text-gray-400">Assets you've borrowed against your collateral</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {borrows.map((borrow, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{borrow.token[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {borrow.amount} {borrow.token}
                    </p>
                    <p className="text-sm text-gray-400">${borrow.value.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="border-orange-500 text-orange-400 mb-1">
                    {borrow.apy} APY
                  </Badge>
                  <p className="text-sm text-gray-300">Health: {borrow.healthFactor}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* LP Positions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">LP Positions</CardTitle>
          <CardDescription className="text-gray-400">Your liquidity provider positions and earned fees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lpPositions.map((position, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {position.pair.split("/")[0][0]}
                      {position.pair.split("/")[1][0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{position.pair}</p>
                    <p className="text-sm text-gray-400">{position.lpTokens} LP tokens</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">${position.value.toLocaleString()}</p>
                  <p className="text-sm text-green-400">+${position.fees.toFixed(2)} fees</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
