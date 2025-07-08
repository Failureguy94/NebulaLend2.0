"use client"

import { Plus, TrendingUp, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface PoolsViewProps {
  isWalletConnected: boolean
}

export function PoolsView({ isWalletConnected }: PoolsViewProps) {
  const pools = [
    {
      pair: "ETH/USDC",
      tvl: 892341,
      volume24h: 125430,
      apy: 12.4,
      utilization: 68,
      yourLiquidity: 0,
      token0Reserve: "364.2 ETH",
      token1Reserve: "892,341 USDC",
    },
    {
      pair: "WBTC/DAI",
      tvl: 654789,
      volume24h: 89234,
      apy: 8.7,
      utilization: 45,
      yourLiquidity: 1250,
      token0Reserve: "14.5 WBTC",
      token1Reserve: "654,789 DAI",
    },
    {
      pair: "USDC/DAI",
      tvl: 543210,
      volume24h: 67890,
      apy: 5.2,
      utilization: 32,
      yourLiquidity: 0,
      token0Reserve: "271,605 USDC",
      token1Reserve: "271,605 DAI",
    },
    {
      pair: "ETH/DAI",
      tvl: 456789,
      volume24h: 78901,
      apy: 9.8,
      utilization: 58,
      yourLiquidity: 890,
      token0Reserve: "186.4 ETH",
      token1Reserve: "456,789 DAI",
    },
    {
      pair: "WBTC/USDC",
      tvl: 389456,
      volume24h: 56789,
      apy: 7.3,
      utilization: 41,
      yourLiquidity: 0,
      token0Reserve: "8.7 WBTC",
      token1Reserve: "389,456 USDC",
    },
    {
      pair: "ETH/WBTC",
      tvl: 234567,
      volume24h: 34567,
      apy: 6.8,
      utilization: 29,
      yourLiquidity: 0,
      token0Reserve: "95.7 ETH",
      token1Reserve: "5.2 WBTC",
    },
  ]

  if (!isWalletConnected) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto">
              <Activity className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Connect Your Wallet</h3>
            <p className="text-gray-400 max-w-md">
              Connect your wallet to view detailed pool information and add liquidity
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pools Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Liquidity Pools</h2>
          <p className="text-gray-400">Provide liquidity to earn trading fees and rewards</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Pool
        </Button>
      </div>

      {/* Pool Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Pools</CardTitle>
            <Activity className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pools.length}</div>
            <p className="text-xs text-gray-400">Active trading pairs</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total TVL</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${pools.reduce((sum, pool) => sum + pool.tvl, 0).toLocaleString()}
            </div>
            <p className="text-xs text-green-400">+12.5% this week</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">24h Volume</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${pools.reduce((sum, pool) => sum + pool.volume24h, 0).toLocaleString()}
            </div>
            <p className="text-xs text-blue-400">Across all pools</p>
          </CardContent>
        </Card>
      </div>

      {/* Pools List */}
      <div className="grid gap-6">
        {pools.map((pool, index) => (
          <Card key={index} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Pool Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {pool.pair.split("/")[0][0]}
                        {pool.pair.split("/")[1][0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">{pool.pair}</h3>
                      <p className="text-sm text-gray-400">AMM Pool</p>
                    </div>
                  </div>
                  {pool.yourLiquidity > 0 && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                      Your Position: ${pool.yourLiquidity}
                    </Badge>
                  )}
                </div>

                {/* Pool Stats */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Total Value Locked</p>
                    <p className="text-xl font-semibold text-white">${pool.tvl.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">24h Volume</p>
                    <p className="text-lg font-medium text-white">${pool.volume24h.toLocaleString()}</p>
                  </div>
                </div>

                {/* APY & Utilization */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">APY</p>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-lg">
                      {pool.apy}%
                    </Badge>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-gray-400">Utilization</p>
                      <p className="text-sm text-white">{pool.utilization}%</p>
                    </div>
                    <Progress value={pool.utilization} className="h-2" />
                  </div>
                </div>

                {/* Pool Reserves & Actions */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Pool Reserves</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-white">{pool.token0Reserve}</p>
                      <p className="text-white">{pool.token1Reserve}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                      Add Liquidity
                    </Button>
                    {pool.yourLiquidity > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-slate-600 text-white hover:bg-slate-700 bg-transparent"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pool Creation Info */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Create New Pool</CardTitle>
          <CardDescription className="text-gray-400">
            Don't see the pair you want? Create a new liquidity pool
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-purple-400 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-white">Select Tokens</h4>
              <p className="text-sm text-gray-400">Choose the token pair for your new pool</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-purple-400 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-white">Set Initial Price</h4>
              <p className="text-sm text-gray-400">Determine the starting exchange rate</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-purple-400 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-white">Add Liquidity</h4>
              <p className="text-sm text-gray-400">Provide initial liquidity to activate the pool</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
